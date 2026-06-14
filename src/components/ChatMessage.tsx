"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Volume2, VolumeX, Terminal, Cpu, Edit, CheckSquare, XSquare } from "lucide-react";
import { highlightCode } from "../utils/highlighter";
import { triggerConfetti } from "../utils/confetti";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  feedback?: "up" | "down" | null;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
  idx: number;
  onRegenerate?: () => void;
  onFeedback?: (feedback: "up" | "down") => void;
  onEdit?: (newContent: string) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  isLast: boolean;
}

export default function ChatMessage({
  message,
  idx,
  onRegenerate,
  onFeedback,
  onEdit,
  isSpeaking,
  onToggleSpeech,
  isLast,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Inline user edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const copyToClipboard = async (e: React.MouseEvent, text: string) => {
    try {
      triggerConfetti(e.clientX, e.clientY);
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const copyCode = async (e: React.MouseEvent, code: string, id: string) => {
    try {
      triggerConfetti(e.clientX, e.clientY);
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (err) {
      console.error("Failed to copy code!", err);
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`group flex w-full gap-3 sm:gap-4 py-4 px-3 sm:py-6 sm:px-6 rounded-2xl transition-all duration-300 ${
      isUser 
        ? "justify-end" 
        : "glass-effect bg-white/5 dark:bg-neutral-900/40 border-glass-border shadow-md"
    }`}>
      {/* Bot Icon / Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg glow-primary">
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}

      {/* Message Content Area */}
      <div className={`flex flex-col max-w-[calc(100%-2.5rem)] sm:max-w-[85%] md:max-w-[75%] gap-2 w-full ${isUser ? "items-end" : "items-start"}`}>
        {/* Model metadata if assistant */}
        {!isUser && message.model && (
          <span className="flex items-center gap-1.5 text-xs text-secondary font-medium tracking-wide mb-1 select-none">
            <Terminal className="w-3.5 h-3.5" />
            {message.model}
          </span>
        )}

        <div className={`w-full text-base leading-7 break-words ${
          isUser 
            ? isEditing 
              ? "w-full" 
              : "px-5 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md rounded-tr-none text-left" 
            : "text-foreground font-sans prose prose-neutral dark:prose-invert max-w-none"
        }`}>
          {isUser ? (
            isEditing ? (
              <div className="flex flex-col gap-2 w-full">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-primary text-foreground outline-none resize-y min-h-[80px]"
                />
                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <XSquare className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-foreground tracking-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground/90 tracking-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground/80">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside pl-4 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside pl-4 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-0.5">{children}</li>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-glass-border">
                    <table className="min-w-full divide-y divide-glass-border bg-black/10 dark:bg-neutral-950/20 text-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-black/20 dark:bg-neutral-950/40 text-xs font-semibold uppercase">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-glass-border">{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => <th className="px-4 py-3 text-left font-medium tracking-wider">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2.5 whitespace-normal">{children}</td>,
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  const codeContent = String(children).replace(/\n$/, "");

                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-primary font-mono text-sm font-semibold break-all" {...props}>
                        {children}
                      </code>
                    );
                  }

                  const lang = match[1] || "code";
                  const codeBlockId = `code-${Math.random().toString(36).substr(2, 9)}`;

                  return (
                    <div className="my-5 rounded-xl overflow-hidden border border-glass-border bg-black/40 dark:bg-black/60 shadow-lg code-container">
                      {/* Code Header */}
                      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-glass-border text-xs text-neutral-400 select-none">
                        <span className="font-mono uppercase text-secondary font-semibold">{lang}</span>
                        <button
                          onClick={(e) => copyCode(e, codeContent, codeBlockId)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded hover:bg-white/5 active:scale-95"
                          title="Copy Code"
                        >
                          {copiedCodeId === codeBlockId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      {/* Highlighted Code */}
                      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono">
                        <code
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(codeContent, lang),
                          }}
                        />
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Message Action Bar */}
        <div className="flex items-center gap-3 mt-3 select-none text-neutral-500 dark:text-neutral-400 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          {/* User message Edit Controls */}
          {isUser && !isEditing && onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground transition-all duration-200 active:scale-95"
              title="Edit Prompt"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Copy message button */}
          {!isEditing && (
            <button
              onClick={(e) => copyToClipboard(e, message.content)}
              className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground transition-all duration-200 active:scale-95"
              title="Copy Message"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {/* Speech synthesis toggle (Only for Assistant) */}
          {!isUser && !isEditing && (
            <button
              onClick={onToggleSpeech}
              className={`flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground transition-all duration-200 active:scale-95 ${
                isSpeaking ? "text-primary bg-primary/10" : ""
              }`}
              title={isSpeaking ? "Stop Reading" : "Read Aloud"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 animate-pulse" />
                  {/* Sound Wave Bars */}
                  <div className="soundwave">
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                  </div>
                </>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Feedback system (Only for Assistant) */}
          {!isUser && !isEditing && onFeedback && (
            <>
              <button
                onClick={() => onFeedback("up")}
                className={`p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground transition-all duration-200 active:scale-95 ${
                  message.feedback === "up" ? "text-emerald-500 bg-emerald-500/10" : ""
                }`}
                title="Good Response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onFeedback("down")}
                className={`p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground transition-all duration-200 active:scale-95 ${
                  message.feedback === "down" ? "text-rose-500 bg-rose-500/10" : ""
                }`}
                title="Bad Response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Regenerate response (if last assistant message) */}
          {!isUser && !isEditing && isLast && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground transition-all duration-200 active:scale-95"
              title="Regenerate Response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold shadow-md select-none border border-glass-border text-xs sm:text-sm">
          ME
        </div>
      )}
    </div>
  );
}
