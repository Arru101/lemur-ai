"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatMessage from "../components/ChatMessage";
import LemurLogo from "../components/LemurLogo";
import { translations } from "../utils/translations";
import { triggerConfetti } from "../utils/confetti";
import { 
  Menu, 
  Send, 
  Mic, 
  Paperclip, 
  FileText, 
  X, 
  Sparkles, 
  Cpu, 
  ArrowDown,
  StopCircle,
  Zap,
  Brain,
  Code2,
  Compass,
  ChevronDown,
  Calculator,
  PenTool,
  BookOpen
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  feedback?: "up" | "down" | null;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export default function Home() {
  // --- States ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("smart-router");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom dropdown selector state
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  
  // Voice Dictation & Synthesis
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  // Scroll to bottom tracker
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  
  // File attachments
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    data: string; // base64
    content?: string; // plain text if text file
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Abort controller reference to cancel API requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = translations[language] || translations.en;

  // Safe Storage wrapper supporting both local (for theme/lang) and session (for chat history - cleared on tab close)
  const safeStorage = {
    getItem: (key: string, useSession = false): string | null => {
      try {
        if (typeof window !== "undefined") {
          const storage = useSession ? sessionStorage : localStorage;
          return storage.getItem(key);
        }
      } catch (e) {
        console.warn("Storage read blocked by security sandbox:", e);
      }
      return null;
    },
    setItem: (key: string, value: string, useSession = false): void => {
      try {
        if (typeof window !== "undefined") {
          const storage = useSession ? sessionStorage : localStorage;
          storage.setItem(key, value);
        }
      } catch (e) {
        console.warn("Storage write blocked by security sandbox:", e);
      }
    }
  };

  // --- Close model selector dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Load localStorage on Mount ---
  useEffect(() => {
    // Theme Loading
    const savedTheme = safeStorage.getItem("lemur-theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Language Loading
    const savedLanguage = safeStorage.getItem("lemur-lang");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Conversations Loading (using session storage)
    const savedChats = safeStorage.getItem("lemur-chats", true);
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch (err) {
        console.error("Error reading chat history", err);
      }
    }
  }, []);

  // --- Save Conversations to sessionStorage ---
  const saveChats = (updated: Conversation[]) => {
    setConversations(updated);
    safeStorage.setItem("lemur-chats", JSON.stringify(updated), true);
  };



  // --- Auto-scroll / Scroll Listeners ---
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleContainerScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 280;
    setShowScrollBtn(isScrolledUp);
  };

  useEffect(() => {
    if (!showScrollBtn) {
      scrollToBottom();
    }
  }, [conversations, loading]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(null);
  }, [activeId]);

  // --- Handle Theme Toggle ---
  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    safeStorage.setItem("lemur-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // --- Handle Language Change ---
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    safeStorage.setItem("lemur-lang", lang);
  };

  // --- active chat references ---
  const activeConversation = conversations.find(c => c.id === activeId) || null;
  const messages = activeConversation ? activeConversation.messages : [];

  // --- Start new chat ---
  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat: Conversation = {
      id: newId,
      title: `${t.newChat} ${conversations.length + 1}`,
      timestamp: Date.now(),
      messages: []
    };
    const updated = [newChat, ...conversations];
    saveChats(updated);
    setActiveId(newId);
    setAttachedFile(null);
    setImagePreview(null);
    setTimeout(() => chatInputRef.current?.focus(), 100);
  };

  // --- Delete chat ---
  const handleDeleteChat = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    saveChats(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
      } else {
        setActiveId(null);
      }
    }
  };

  // --- Clear all chats ---
  const handleClearAll = () => {
    saveChats([]);
    setActiveId(null);
    setAttachedFile(null);
    setImagePreview(null);
  };

  // --- Select chat ---
  const handleSelectChat = (id: string) => {
    setActiveId(id);
    setAttachedFile(null);
    setImagePreview(null);
    setTimeout(() => chatInputRef.current?.focus(), 100);
  };

  // --- Rename chat ---
  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = conversations.map((c) => {
      if (c.id === id) {
        return { ...c, title: newTitle };
      }
      return c;
    });
    saveChats(updated);
  };

  // --- File Uploading Helpers ---
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (fileObj: File) => {
    if (!fileObj) return;

    if (fileObj.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();

    if (fileObj.type.startsWith("image/")) {
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        setImagePreview(base64Data);
        setAttachedFile({
          name: fileObj.name,
          type: fileObj.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(fileObj);
    } else if (
      fileObj.type.startsWith("text/") || 
      [".md", ".json", ".js", ".ts", ".py", ".html", ".css", ".csv"].some(ext => fileObj.name.endsWith(ext))
    ) {
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        
        const base64Reader = new FileReader();
        base64Reader.onload = (b) => {
          setAttachedFile({
            name: fileObj.name,
            type: fileObj.type || "text/plain",
            data: b.target?.result as string,
            content: textContent
          });
          setImagePreview(null);
        };
        base64Reader.readAsDataURL(fileObj);
      };
      reader.readAsText(fileObj);
    } else {
      alert(t.unsupportedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj) processFile(fileObj);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fileObj = e.dataTransfer.files?.[0];
    if (fileObj) processFile(fileObj);
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Voice Dictation (Speech to Text) ---
  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.speechNotSupported);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "zh" ? "zh-CN" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error: ", event.error);
      if (event.error === "not-allowed") {
        alert(t.micAccessDenied);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- Global TTS (Text to Speech) Controller ---
  const handleToggleSpeech = (msgIdx: number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingIdx === msgIdx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
    } else {
      window.speechSynthesis.cancel();
      
      const cleanText = text
        .replace(/[#*`_~[\]()\-]/g, "")
        .replace(/```[\s\S]*?```/g, "[code block omitted]");
        
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      
      setSpeakingIdx(msgIdx);
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Export Chat Logic ---
  const handleExport = (format: "md" | "txt" | "pdf") => {
    if (!activeConversation || messages.length === 0) return;

    const title = activeConversation.title;

    if (format === "pdf") {
      window.print();
      return;
    }

    let exportContent = "";
    if (format === "md") {
      exportContent = `# ${title}\nExported from Lemur AI\n\n`;
      messages.forEach((m) => {
        const sender = m.role === "user" ? "User" : "Lemur AI";
        const modelStr = m.model ? ` (${m.model})` : "";
        exportContent += `### **${sender}${modelStr}**\n${m.content}\n\n---\n\n`;
      });
    } else {
      exportContent = `=== ${title} ===\nExported from Lemur AI\n\n`;
      messages.forEach((m) => {
        const sender = m.role === "user" ? "User" : "Lemur AI";
        const modelStr = m.model ? ` [${m.model}]` : "";
        exportContent += `${sender}${modelStr}:\n${m.content}\n\n========================\n\n`;
      });
    }

    const blob = new Blob([exportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Thumbs Feedback Hook ---
  const handleFeedback = (msgIdx: number, type: "up" | "down") => {
    if (!activeId) return;

    const updated = conversations.map((c) => {
      if (c.id === activeId) {
        const updatedMsgs = [...c.messages];
        updatedMsgs[msgIdx] = {
          ...updatedMsgs[msgIdx],
          feedback: updatedMsgs[msgIdx].feedback === type ? null : type
        };
        return { ...c, messages: updatedMsgs };
      }
      return c;
    });

    saveChats(updated);
    if (type === "up") {
      alert(t.feedbackGood);
    }
  };

  // --- Response Cancellation (Stop Generating) ---
  const handleCancelResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  // --- Main Submit Handler ---
  const handleSubmit = async (e: React.FormEvent, customPrompt?: string) => {
    e.preventDefault();
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() && !attachedFile) return;

    let currentChatId = activeId;
    let updatedChats = [...conversations];

    if (!currentChatId) {
      const newId = `chat-${Date.now()}`;
      currentChatId = newId;
      const newChat: Conversation = {
        id: newId,
        title: promptToSend.substring(0, 26) || "New Conversation",
        timestamp: Date.now(),
        messages: []
      };
      updatedChats = [newChat, ...updatedChats];
      saveChats(updatedChats);
      setActiveId(newId);
    }

    const currentChatIndex = updatedChats.findIndex(c => c.id === currentChatId);
    const currentChat = updatedChats[currentChatIndex];

    const userMessage: Message = {
      role: "user",
      content: promptToSend,
      timestamp: Date.now()
    };

    const promptWithAttachedText = attachedFile && attachedFile.content
      ? `[Attached Document: ${attachedFile.name}]\n\n${promptToSend}`
      : promptToSend;

    const displayUserMsg = {
      ...userMessage,
      content: attachedFile 
        ? `${t.fileUploaded} ${attachedFile.name}\n\n${promptToSend}` 
        : promptToSend
    };

    const updatedMessages = [...currentChat.messages, displayUserMsg];
    
    let newTitle = currentChat.title;
    if (currentChat.messages.length === 0) {
      newTitle = promptToSend.substring(0, 30) + (promptToSend.length > 30 ? "..." : "");
    }

    updatedChats[currentChatIndex] = {
      ...currentChat,
      title: newTitle,
      messages: updatedMessages
    };

    saveChats(updatedChats);
    setInput("");
    removeAttachment();
    setLoading(true);

    try {
      const payloadMessages = currentChat.messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      payloadMessages.push({
        role: "user",
        content: promptWithAttachedText
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          model,
          language,
          file: attachedFile ? {
            name: attachedFile.name,
            type: attachedFile.type,
            data: attachedFile.data,
            content: attachedFile.content
          } : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server response failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        model: data.model,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalizedChats = [...updatedChats];
      finalizedChats[currentChatIndex] = {
        ...currentChat,
        title: newTitle,
        messages: finalMessages
      };
      saveChats(finalizedChats);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request cancelled by the user.");
        return;
      }
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Could not reach the server API."}`,
        model: "System Error",
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      const finalizedChats = [...updatedChats];
      finalizedChats[currentChatIndex] = {
        ...currentChat,
        title: newTitle,
        messages: finalMessages
      };
      saveChats(finalizedChats);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // --- Message Edit & Resubmit ---
  const handleEditUserMessage = async (msgIdx: number, newContent: string) => {
    if (!activeId || loading) return;

    const currentChatIndex = conversations.findIndex(c => c.id === activeId);
    const currentChat = conversations[currentChatIndex];

    const prefixMessages = currentChat.messages.slice(0, msgIdx);
    const editedUserMsg: Message = {
      role: "user",
      content: newContent,
      timestamp: Date.now()
    };

    const updatedMessages = [...prefixMessages, editedUserMsg];
    const updatedChats = [...conversations];
    updatedChats[currentChatIndex] = {
      ...currentChat,
      messages: updatedMessages
    };

    saveChats(updatedChats);
    setLoading(true);

    try {
      const payloadMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          model,
          language
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Server response failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        model: data.model,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalizedChats = [...updatedChats];
      finalizedChats[currentChatIndex] = {
        ...currentChat,
        messages: finalMessages
      };
      saveChats(finalizedChats);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request cancelled by the user.");
        return;
      }
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Failed to regenerate response."}`,
        model: "System Error",
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      const finalizedChats = [...updatedChats];
      finalizedChats[currentChatIndex] = {
        ...currentChat,
        messages: finalMessages
      };
      saveChats(finalizedChats);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // --- Message Regeneration ---
  const handleRegenerate = async () => {
    if (!activeId || loading) return;

    const currentChatIndex = conversations.findIndex(c => c.id === activeId);
    const currentChat = conversations[currentChatIndex];
    if (currentChat.messages.length < 2) return;

    const poppedMessages = [...currentChat.messages];
    poppedMessages.pop();

    const updatedChats = [...conversations];
    updatedChats[currentChatIndex] = {
      ...currentChat,
      messages: poppedMessages
    };
    saveChats(updatedChats);
    setLoading(true);

    try {
      const payloadMessages = poppedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          model,
          language
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server response failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        model: data.model,
        timestamp: Date.now()
      };

      const finalMessages = [...poppedMessages, assistantMessage];
      const finalizedChats = [...updatedChats];
      finalizedChats[currentChatIndex] = {
        ...currentChat,
        messages: finalMessages
      };
      saveChats(finalizedChats);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request cancelled by the user.");
        return;
      }
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Failed to regenerate response."}`,
        model: "System Error",
        timestamp: Date.now()
      };
      const finalMessages = [...poppedMessages, errorMessage];
      const finalizedChats = [...updatedChats];
      finalizedChats[currentChatIndex] = {
        ...currentChat,
        messages: finalMessages
      };
      saveChats(finalizedChats);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // --- Auto-grow textarea ---
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative" onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* Sidebar Drawer */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onClearAll={handleClearAll}
        onRenameChat={handleRenameChat}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onExport={handleExport}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        
        {/* Application Header Panel */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-glass-border select-none bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl lg:hidden hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Custom Premium Model Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-2 text-sm font-semibold bg-neutral-100 dark:bg-neutral-900 border border-glass-border px-3 py-1.5 rounded-xl cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200 text-foreground glow-primary"
              >
                {model === "smart-router" && <Zap className="w-4 h-4 text-amber-500" />}
                {model === "gemini-flash" && <Sparkles className="w-4 h-4 text-purple-400" />}
                {model === "deepseek-r1" && <Brain className="w-4 h-4 text-cyan-400" />}
                {model === "qwen-coder" && <Code2 className="w-4 h-4 text-emerald-400" />}
                {model === "llama-3" && <Cpu className="w-4 h-4 text-orange-400" />}
                {model === "mistral-7b" && <Compass className="w-4 h-4 text-sky-400" />}
                
                <span>{
                  model === "smart-router" ? t.smartRouter :
                  model === "gemini-flash" ? "Gemini 2.5 Flash" :
                  model === "deepseek-r1" ? "DeepSeek R1" :
                  model === "qwen-coder" ? "Qwen 3 Coder" :
                  model === "llama-3" ? "Llama 3.3 70B" :
                  model === "mistral-7b" ? "Gemma 4 31B" : model
                }</span>
                
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Dropdown Options List */}
              {modelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-glass-border shadow-2xl z-30 p-2 flex flex-col gap-1 animate-slide-up">
                  <button
                    type="button"
                    onClick={() => { setModel("smart-router"); setModelDropdownOpen(false); }}
                    className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors hover:bg-white/5 ${model === "smart-router" ? "bg-primary/15 text-primary" : "text-foreground"}`}
                  >
                    <Zap className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">{t.smartRouter}</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Auto-routes to the best model</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setModel("gemini-flash"); setModelDropdownOpen(false); }}
                    className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors hover:bg-white/5 ${model === "gemini-flash" ? "bg-primary/15 text-primary" : "text-foreground"}`}
                  >
                    <Sparkles className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Gemini 2.5 Flash</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Fast, general & image support</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setModel("deepseek-r1"); setModelDropdownOpen(false); }}
                    className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors hover:bg-white/5 ${model === "deepseek-r1" ? "bg-primary/15 text-primary" : "text-foreground"}`}
                  >
                    <Brain className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">DeepSeek R1</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Complex math & deep reasoning</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setModel("qwen-coder"); setModelDropdownOpen(false); }}
                    className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors hover:bg-white/5 ${model === "qwen-coder" ? "bg-primary/15 text-primary" : "text-foreground"}`}
                  >
                    <Code2 className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Qwen 3 Coder</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Coding expert & debugging</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setModel("llama-3"); setModelDropdownOpen(false); }}
                    className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors hover:bg-white/5 ${model === "llama-3" ? "bg-primary/15 text-primary" : "text-foreground"}`}
                  >
                    <Cpu className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Llama 3.3 70B</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">High intelligence reasoning</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setModel("mistral-7b"); setModelDropdownOpen(false); }}
                    className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors hover:bg-white/5 ${model === "mistral-7b" ? "bg-primary/15 text-primary" : "text-foreground"}`}
                  >
                    <Compass className="w-4 h-4 mt-0.5 text-sky-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Gemma 4 31B</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Google open model chat</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Free Access
            </span>
          </div>
        </header>

        {/* Conversation Box */}
        <div 
          ref={chatContainerRef}
          onScroll={handleContainerScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin"
        >
          {messages.length === 0 ? (
            /* Empty Chat State - Suggestive Cards dashboard */
            <div className="max-w-3xl mx-auto py-12 md:py-24 flex flex-col items-center text-center space-y-8 select-none">
              
              <div className="w-16 h-16 rounded-2xl bg-white/5 dark:bg-neutral-900/40 border border-glass-border flex items-center justify-center shadow-xl glow-primary transform hover:scale-105 transition-transform duration-300">
                <LemurLogo className="w-11 h-11" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-neutral-500 bg-clip-text text-transparent font-sans">
                  {t.suggestHeading}
                </h1>
                <p className="text-sm md:text-base text-neutral-500 max-w-lg mx-auto font-medium">
                  {t.suggestSub}
                </p>
              </div>

              {/* Grid Suggestions cards with Lucide Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescCoding)}
                  className="glass-effect bg-white/5 dark:bg-neutral-900/20 border-glass-border hover:border-primary/40 p-4 rounded-2xl cursor-pointer text-left hover:scale-[1.01] transition-all duration-200 group glow-primary"
                >
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    <Code2 className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                    {t.suggestTitleCoding}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {t.suggestDescCoding}
                  </p>
                </div>

                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescMath)}
                  className="glass-effect bg-white/5 dark:bg-neutral-900/20 border-glass-border hover:border-secondary/40 p-4 rounded-2xl cursor-pointer text-left hover:scale-[1.01] transition-all duration-200 group glow-secondary"
                >
                  <h3 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors flex items-center gap-2">
                    <Calculator className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                    {t.suggestTitleMath}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {t.suggestDescMath}
                  </p>
                </div>

                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescCreative)}
                  className="glass-effect bg-white/5 dark:bg-neutral-900/20 border-glass-border hover:border-accent/40 p-4 rounded-2xl cursor-pointer text-left hover:scale-[1.01] transition-all duration-200 group"
                >
                  <h3 className="text-sm font-bold text-foreground group-hover:text-pink-500 transition-colors flex items-center gap-2">
                    <PenTool className="w-4.5 h-4.5 text-accent flex-shrink-0" />
                    {t.suggestTitleCreative}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {t.suggestDescCreative}
                  </p>
                </div>

                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescExplain)}
                  className="glass-effect bg-white/5 dark:bg-neutral-900/20 border-glass-border hover:border-indigo-400/40 p-4 rounded-2xl cursor-pointer text-left hover:scale-[1.01] transition-all duration-200 group"
                >
                  <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" />
                    {t.suggestTitleExplain}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {t.suggestDescExplain}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Rendered Messages list */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  idx={idx}
                  message={msg}
                  onRegenerate={idx === messages.length - 1 ? handleRegenerate : undefined}
                  onFeedback={(type) => handleFeedback(idx, type)}
                  onEdit={(newContent) => handleEditUserMessage(idx, newContent)}
                  isSpeaking={speakingIdx === idx}
                  onToggleSpeech={() => handleToggleSpeech(idx, msg.content)}
                  isLast={idx === messages.length - 1}
                />
              ))}

              {/* Typing thinking states */}
              {loading && (
                <div className="flex w-full gap-4 py-6 px-4 md:px-6 rounded-2xl glass-effect bg-white/5 dark:bg-neutral-900/40 border-glass-border shadow-md select-none">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg glow-primary">
                    <Cpu className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-xs text-secondary font-medium tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Lemur AI is thinking...
                    </span>
                    <div className="flex items-center gap-1 py-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Text Form Area */}
        <footer className="p-4 md:p-6 border-t border-glass-border select-none bg-background/30 backdrop-blur-md relative">
          
          {/* Scroll to bottom floating action button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-glass-border text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200 shadow-lg glow-primary active:scale-95 z-30"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>
          )}

          <div className="max-w-3xl mx-auto relative">
            
            {/* File Upload Preview bar */}
            {attachedFile && (
              <div className="absolute bottom-full left-0 right-0 mb-3 px-4 py-2.5 rounded-2xl border border-glass-border bg-neutral-100 dark:bg-neutral-950 flex items-center justify-between shadow-xl z-20 animate-slide-up">
                <div className="flex items-center gap-2.5 min-w-0">
                  {imagePreview ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0 border border-glass-border">
                      <img src={imagePreview} alt="Upload preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-neutral-500 uppercase">{attachedFile.type || "File"}</p>
                  </div>
                </div>
                <button
                  onClick={removeAttachment}
                  className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-foreground transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Controls Capsule Container */}
            <form 
              onSubmit={handleSubmit}
              className="glass-input flex flex-col rounded-2xl border border-glass-border overflow-hidden bg-neutral-900/10 dark:bg-black/30 shadow-xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300"
            >
              <textarea
                ref={chatInputRef}
                rows={1}
                value={input}
                onChange={handleTextAreaChange}
                onKeyDown={handleKeyPress}
                placeholder={t.placeholder}
                maxLength={4000}
                className="w-full bg-transparent px-4 pt-4 pb-2 text-sm md:text-base text-foreground placeholder-neutral-500 focus:outline-none resize-none min-h-[44px] max-h-[180px] font-sans"
              />

              <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-dashed border-glass-border/30">
                {/* Left Attachment Actions */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,text/*,.md,.json,.js,.ts,.py,.html,.css,.csv"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleFileClick}
                    className="p-2 rounded-xl text-neutral-500 hover:text-primary hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200"
                    title={t.uploadFile}
                  >
                    <Paperclip className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </button>
                </div>

                {/* Right Input Actions */}
                <div className="flex items-center gap-2">
                  
                  {/* Character gauge tracker */}
                  <span className="text-[10px] text-neutral-500 font-mono mr-1 select-none">
                    {input.length.toLocaleString()} / 4,000
                  </span>

                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                      isListening 
                        ? "text-red-500 bg-red-500/10" 
                        : "text-neutral-500 hover:text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                    title={t.voiceInput}
                  >
                    {isListening ? (
                      <>
                        <Mic className="w-4 h-4 md:w-4.5 md:h-4.5 animate-pulse" />
                        <div className="soundwave scale-75 select-none pointer-events-none">
                          <span className="soundwave-bar" />
                          <span className="soundwave-bar" />
                          <span className="soundwave-bar" />
                        </div>
                      </>
                    ) : (
                      <Mic className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    )}
                  </button>

                  {/* Submit / Cancel response togglers */}
                  {loading && abortControllerRef.current ? (
                    <button
                      type="button"
                      onClick={handleCancelResponse}
                      className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/25 active:scale-95 transition-all duration-200 border border-rose-500/30"
                      title="Stop generating"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={(!input.trim() && !attachedFile) || loading}
                      className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md active:scale-95 transition-all duration-200 glow-primary"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </footer>
      </main>
    </div>
  );
}
