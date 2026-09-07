"use client";

import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Volume2,
  VolumeX,
  Edit,
  CheckSquare,
  XSquare,
  Sparkles,
  User,
  Brain,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { highlightCode } from "../utils/highlighter";
import { triggerConfetti } from "../utils/confetti";
import LemurLogo from "./LemurLogo";

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
  isGenerating?: boolean;
  onSelectQuestion?: (question: string) => void;
}

function ChatMessageComponent({
  message,
  idx,
  onRegenerate,
  onFeedback,
  onEdit,
  isSpeaking,
  onToggleSpeech,
  isLast,
  isGenerating = false,
  onSelectQuestion,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // State for collapsible thought process
  const [thoughtExpanded, setThoughtExpanded] = useState(false);

  // Parse <think>...</think> reasoning tags and <related_questions> tags with memoization
  const { thinkingText, isThinkingActive, content: displayContent, questions } = useMemo(() => {
    const rawContent = message.content || "";

    let thinkPart: string | null = null;
    let isThinkingOngoing = false;
    let remainingContent = rawContent;

    // Check for closed <think>...</think>
    const closedThinkRegex = /<think>([\s\S]*?)<\/think>/i;
    const closedMatch = rawContent.match(closedThinkRegex);

    if (closedMatch) {
      thinkPart = closedMatch[1].trim();
      remainingContent = rawContent.replace(closedThinkRegex, "").trim();
    } else {
      // Check for active open <think> during streaming
      const openThinkRegex = /<think>([\s\S]*)$/i;
      const openMatch = rawContent.match(openThinkRegex);
      if (openMatch) {
        thinkPart = openMatch[1].trim();
        remainingContent = ""; // Main answer has not started yet
        isThinkingOngoing = true;
      }
    }

    // Now parse <related_questions> on the remaining text
    const regex = /<related_questions>([\s\S]*?)<\/related_questions>/i;
    const match = remainingContent.match(regex);

    if (match) {
      const questionsText = match[1];
      const cleanedContent = remainingContent.replace(regex, "").trim();

      const parsedQuestions = questionsText
        .split("\n")
        .map((q) => q.trim().replace(/^[-*\d.]+\s*/, ""))
        .filter((q) => q.length > 0)
        .slice(0, 3);

      return {
        thinkingText: thinkPart,
        isThinkingActive: isThinkingOngoing,
        content: cleanedContent,
        questions: parsedQuestions,
      };
    }

    // Clean any partial unclosed <related_questions tag during real-time streaming
    const partialTagIdx = remainingContent.indexOf("<related_questions>");
    if (partialTagIdx !== -1) {
      return {
        thinkingText: thinkPart,
        isThinkingActive: isThinkingOngoing,
        content: remainingContent.slice(0, partialTagIdx).trim(),
        questions: [],
      };
    }

    return {
      thinkingText: thinkPart,
      isThinkingActive: isThinkingOngoing,
      content: remainingContent,
      questions: [],
    };
  }, [message.content]);

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

  // Memoized formatted time
  const formattedTime = useMemo(() => {
    if (!message.timestamp) return "";
    try {
      const d = new Date(message.timestamp);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [message.timestamp]);

  return (
    <div
      className={`group flex w-full gap-3 sm:gap-4 py-2.5 sm:py-3.5 px-1 sm:px-2 message-contain ${
        isLast ? "msg-enter" : ""
      } ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-2xl ios-glass border border-black/[0.08] dark:border-white/15 text-foreground select-none mt-1 shadow-md">
          {isGenerating ? (
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          ) : (
            <LemurLogo className="w-5 h-5" />
          )}
        </div>
      )}

      {/* Message Content Area */}
      <div
        className={`flex flex-col max-w-[calc(100%-2.25rem)] sm:max-w-[85%] md:max-w-[80%] 2xl:max-w-[82%] gap-1 w-full min-w-0 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Model metadata & Status Header */}
        {!isUser && (
          <div className="flex items-center justify-between w-full mb-1.5 select-none flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-sans tracking-tight">
                {message.model || "Lemur AI"}
              </span>

              {isGenerating ? (
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 animate-pulse shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  Streaming
                </span>
              ) : null}
            </div>

            {formattedTime && (
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono tracking-tight ml-auto">
                {formattedTime}
              </span>
            )}
          </div>
        )}

        {/* User time */}
        {isUser && formattedTime && (
          <div className="flex items-center justify-end w-full mb-0.5 select-none pr-1">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono tracking-tight">
              {formattedTime}
            </span>
          </div>
        )}

        <div
          className={`w-full text-sm sm:text-base leading-relaxed break-words ${
            isUser
              ? isEditing
                ? "w-full"
                : "px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-[22px] ios-glass-bubble text-white shadow-md text-left font-sans"
              : "ios-glass-card px-4.5 sm:px-6 py-4 sm:py-5 rounded-2xl sm:rounded-3xl chat-prose max-w-none text-left"
          }`}
        >
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
              <p className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] leading-relaxed tracking-tight font-normal text-white selection:bg-white/30">
                {message.content}
              </p>
            )
          ) : (
            <>
              {/* Collapsible Thought Process / Reasoning Accordion */}
              {thinkingText && (
                <div className="mb-4 rounded-2xl border border-black/[0.08] dark:border-white/10 overflow-hidden bg-black/[0.02] dark:bg-white/[0.03] transition-colors shadow-sm">
                  <button
                    type="button"
                    onClick={() => setThoughtExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer select-none text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className={`w-3.5 h-3.5 ${isThinkingActive ? "text-cyan-500 dark:text-cyan-400 animate-pulse" : "text-neutral-500 dark:text-neutral-400"}`} />
                      <span className="font-semibold font-sans text-foreground/90">
                        {isThinkingActive ? "Thinking in real-time..." : "Thought process"}
                      </span>
                      {!isThinkingActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-300 font-mono border border-black/[0.08] dark:border-white/10">
                          {thinkingText.split(/\s+/).filter(Boolean).length} words
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isThinkingActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping mr-1" />
                      )}
                      {(isThinkingActive || thoughtExpanded) ? (
                        <ChevronUp className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {(isThinkingActive || thoughtExpanded) && (
                    <div className="px-4 py-3.5 text-[12px] sm:text-[12.5px] text-neutral-200 dark:text-neutral-300 font-mono whitespace-pre-wrap leading-[1.7] max-h-72 overflow-y-auto scrollbar-thin bg-neutral-900/95 dark:bg-black/40 border-t border-black/[0.08] dark:border-white/10 selection:bg-cyan-500/20">
                      {thinkingText}
                      {isThinkingActive && <span className="streaming-cursor ml-1" />}
                    </div>
                  )}
                </div>
              )}

              {(!isThinkingActive || displayContent) && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-3.5 last:mb-0 leading-[1.75] text-[14.5px] sm:text-[15.5px] text-neutral-800 dark:text-neutral-200 tracking-tight font-normal font-sans">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl sm:text-2xl font-bold mt-7 mb-3 text-neutral-900 dark:text-white tracking-tight font-sans first:mt-1">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg sm:text-xl font-bold mt-6 mb-2.5 text-neutral-900 dark:text-white/95 tracking-tight font-sans first:mt-1">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base sm:text-lg font-semibold mt-4.5 mb-2 text-neutral-850 dark:text-neutral-100 tracking-tight font-sans first:mt-1">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm sm:text-base font-semibold mt-3.5 mb-1.5 text-neutral-800 dark:text-neutral-200 tracking-tight font-sans">
                      {children}
                    </h4>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-neutral-950 dark:text-white tracking-tight">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-neutral-700 dark:text-neutral-300 font-normal">
                      {children}
                    </em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-5 pl-1 mb-4 space-y-2 text-neutral-800 dark:text-neutral-200 marker:text-primary dark:marker:text-indigo-400 marker:text-sm">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside ml-5 pl-1 mb-4 space-y-2 text-neutral-800 dark:text-neutral-200 marker:text-primary dark:marker:text-indigo-400 marker:font-semibold marker:text-xs">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-[1.7] text-[14px] sm:text-[15px] pl-1 tracking-tight">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 rounded-xl border-l-[3.5px] border-primary border-t-0 border-r-0 border-b-0 bg-primary/[0.04] dark:bg-primary/[0.08] px-4 py-3 text-sm sm:text-[14.5px] text-neutral-700 dark:text-neutral-200 italic shadow-sm leading-relaxed">
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr className="my-6 border-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-white/15 to-transparent" />
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors inline-flex items-center gap-0.5 break-words"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-5 rounded-2xl border border-black/[0.08] dark:border-white/10 shadow-md bg-neutral-100/90 dark:bg-neutral-900/80">
                      <table className="min-w-full text-xs sm:text-sm font-sans">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-black/[0.04] dark:bg-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 select-none border-b border-black/[0.08] dark:border-white/10">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-neutral-200/60 dark:divide-white/[0.04]">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-primary/[0.03] dark:hover:bg-white/[0.03] transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left font-semibold font-sans tracking-wider text-neutral-800 dark:text-neutral-200 border-0">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 align-top leading-relaxed text-xs sm:text-sm border-b border-neutral-200/50 dark:border-white/[0.04] last:border-b-0">
                      {children}
                    </td>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    const codeContent = String(children).replace(/\n$/, "");

                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-neutral-200/70 dark:bg-white/[0.08] text-primary dark:text-indigo-300 font-mono text-[12px] sm:text-[13px] font-semibold border-0 tracking-tight break-all"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    const lang = match[1] || "code";
                    let codeHash = 0;
                    for (let i = 0; i < Math.min(codeContent.length, 32); i++) {
                      codeHash = ((codeHash << 5) - codeHash + codeContent.charCodeAt(i)) | 0;
                    }
                    const codeBlockId = `code-${idx ?? 0}-${lang}-${codeContent.length}-${Math.abs(codeHash)}`;

                    return (
                      <div className="my-4 rounded-2xl overflow-hidden border border-white/12 bg-[#0d1017] shadow-xl code-container transform-gpu">
                        {/* macOS-style Frosted Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10 text-xs select-none">
                          <div className="flex items-center gap-2.5">
                            {/* Apple Traffic Lights */}
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-[0_0_6px_rgba(255,95,86,0.5)]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-[0_0_6px_rgba(255,189,46,0.5)]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-[0_0_6px_rgba(39,201,63,0.5)]" />
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono uppercase text-neutral-300 font-semibold text-[10px] tracking-wider border border-white/10">
                              {lang}
                            </span>
                          </div>

                          <button
                            onClick={(e) => copyCode(e, codeContent, codeBlockId)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-all duration-150 active:scale-95 text-xs font-medium border border-white/10"
                            title="Copy Code"
                          >
                            {copiedCodeId === codeBlockId ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-[11px] font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 opacity-75" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        {/* Highlighted Code */}
                        <pre className="p-4 overflow-x-auto text-xs sm:text-[13px] leading-relaxed font-mono text-neutral-100 selection:bg-primary/30">
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
                {displayContent}
              </ReactMarkdown>
              )}

              {/* Streaming Cursor Motion */}
              {isGenerating && (
                isThinkingActive ? null : displayContent ? (
                  <span className="streaming-cursor" />
                ) : (
                  <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold py-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
                    Lemur AI is formulating your answer...
                    <span className="streaming-cursor" />
                  </span>
                )
              )}
            </>
          )}
        </div>

        {/* Modern Minimal Action Bar */}
        {!isGenerating && (
          <div className="flex items-center gap-1 mt-1.5 select-none text-neutral-500 dark:text-neutral-400 opacity-90 md:opacity-0 md:group-hover:opacity-100 touch-visible transition-all duration-150 w-fit">
            {/* User Edit */}
            {isUser && !isEditing && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-foreground text-neutral-500 dark:text-neutral-400 apple-spring active:scale-95"
                title="Edit Prompt"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Copy message button */}
            {!isEditing && (
              <button
                onClick={(e) => copyToClipboard(e, displayContent)}
                className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-foreground text-neutral-500 dark:text-neutral-400 apple-spring active:scale-95"
                title="Copy Message"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Speech synthesis toggle (Assistant only) */}
            {!isUser && !isEditing && (
              <button
                onClick={onToggleSpeech}
                className={`flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-foreground text-neutral-500 dark:text-neutral-400 apple-spring active:scale-95 ${
                  isSpeaking ? "text-primary bg-primary/15 border border-primary/20" : ""
                }`}
                title={isSpeaking ? "Stop Reading" : "Read Aloud"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-pulse text-primary" />
                    <div className="soundwave">
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                    </div>
                  </>
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Feedback system */}
            {!isUser && !isEditing && onFeedback && (
              <>
                <button
                  onClick={() => onFeedback("up")}
                  className={`p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-foreground text-neutral-500 dark:text-neutral-400 apple-spring active:scale-95 ${
                    message.feedback === "up" ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/20" : ""
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onFeedback("down")}
                  className={`p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-foreground text-neutral-500 dark:text-neutral-400 apple-spring active:scale-95 ${
                    message.feedback === "down" ? "text-rose-500 dark:text-rose-400 bg-rose-500/15 border border-rose-500/20" : ""
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Regenerate response */}
            {!isUser && !isEditing && isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-foreground text-neutral-500 dark:text-neutral-400 apple-spring active:scale-95"
                title="Regenerate Response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Related Questions block */}
        {!isUser && !isGenerating && questions.length > 0 && onSelectQuestion && (
          <div className="flex flex-col gap-2.5 mt-4 pt-3 w-full select-none msg-enter">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/10 to-transparent mb-1" />
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 font-sans flex items-center gap-1.5 tracking-wide">
              <Sparkles className="w-3 h-3 text-primary" />
              Suggested Follow-ups
            </span>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => onSelectQuestion(q)}
                  className="group/chip text-xs sm:text-[13px] text-left px-3.5 py-2 rounded-xl ios-glass hover:border-primary/40 text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary apple-spring active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 touch-target"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 opacity-50 group-hover/chip:opacity-100 group-hover/chip:translate-x-0.5 transition-all text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/25 border border-white/20 select-none mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

// React.memo optimization: Prevents all past messages from re-rendering during user typing or parent state changes
const ChatMessage = React.memo(ChatMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message === nextProps.message &&
    prevProps.isSpeaking === nextProps.isSpeaking &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.isGenerating === nextProps.isGenerating &&
    prevProps.idx === nextProps.idx
  );
});

export default ChatMessage;

