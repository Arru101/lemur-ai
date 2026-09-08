"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import ChatMessage from "../components/ChatMessage";
import LemurLogo from "../components/LemurLogo";
import Toast, { ToastItem, ToastType, setGlobalToastFn } from "../components/Toast";
import { translations } from "../utils/translations";
import { 
  Menu, 
  Mic, 
  Paperclip, 
  FileText, 
  X, 
  Sparkles, 
  Cpu, 
  ArrowDown, 
  ArrowUp, 
  Square, 
  SquarePen, 
  BrainCircuit, 
  Brain, 
  Code2, 
  Compass, 
  ChevronDown, 
  Calculator, 
  PenTool, 
  BookOpen, 
  PanelLeft,
  Check,
  ArrowUpRight
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

interface AttachedFilePayload {
  name: string;
  type: string;
  data: string;
  content?: string;
}

interface ChatPayloadMessage {
  role: string;
  content: string;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResultItem[];
}

interface ISpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
};

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

const getNow = (): number => Date.now();

const generateChatId = (): string => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function Home() {
  // --- States ---
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("smart-router");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Abort controller reference to cancel API requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = translations[language] || translations.en;

  // --- Toast helpers ---
  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register global toast function
  useEffect(() => {
    setGlobalToastFn(addToast);
    return () => setGlobalToastFn(null);
  }, [addToast]);

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

  // Keep a ref to conversations to prevent storage sync re-renders
  const conversationsRef = useRef<Conversation[]>(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // --- Load localStorage on Mount ---
  useEffect(() => {
    queueMicrotask(() => {
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
          conversationsRef.current = parsed;
          if (parsed.length > 0) {
            setActiveId(parsed[0].id);
          }
        } catch (err) {
          console.error("Error reading chat history", err);
        }
      }
      setHydrated(true);
    });
  }, []);

  // --- Save Conversations to sessionStorage ---
  const saveChats = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    conversationsRef.current = updated;
    safeStorage.setItem("lemur-chats", JSON.stringify(updated), true);
  }, []);

  // --- Auto-scroll / Scroll Listeners with rAF throttling (O(1) 60fps smooth scrolling) ---
  const isUserScrolledUpRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const autoScrollRafRef = useRef<number | null>(null);

  const scrollToBottom = useCallback((behavior: "smooth" | "auto" = "smooth") => {
    isUserScrolledUpRef.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const autoScrollToBottom = useCallback(() => {
    if (!isUserScrolledUpRef.current) {
      if (autoScrollRafRef.current) return;
      autoScrollRafRef.current = requestAnimationFrame(() => {
        autoScrollRafRef.current = null;
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, []);

  // Passive event listener for 60fps/120fps compositor-driven scrolling
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        if (!container) return;

        const isScrolledUp =
          container.scrollHeight - container.scrollTop - container.clientHeight > 180;
        isUserScrolledUpRef.current = isScrolledUp;
        setShowScrollBtn((prev) => (prev !== isScrolledUp ? isScrolledUp : prev));
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [activeId]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    queueMicrotask(() => {
      setSpeakingIdx(null);
    });
  }, [activeId]);

  // --- Handle Theme Toggle ---
  const handleThemeToggle = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      safeStorage.setItem("lemur-theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      return nextTheme;
    });
  }, []);

  // --- Handle Language Change ---
  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    safeStorage.setItem("lemur-lang", lang);
  }, []);

  // --- active chat references ---
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  const messages = useMemo(() => {
    return activeConversation ? activeConversation.messages : [];
  }, [activeConversation]);

  // --- Start new chat ---
  const handleNewChat = useCallback(() => {
    // If active chat exists and is already empty, just focus input without creating duplicate ghost
    if (activeConversation && activeConversation.messages.length === 0) {
      setInput("");
      setAttachedFile(null);
      setImagePreview(null);
      chatInputRef.current?.focus();
      return;
    }
    const newId = generateChatId();
    const newChat: Conversation = {
      id: newId,
      title: `${t.newChat} ${conversations.length + 1}`,
      timestamp: getNow(),
      messages: []
    };
    const updated = [newChat, ...conversations];
    saveChats(updated);
    setActiveId(newId);
    setAttachedFile(null);
    setImagePreview(null);
    queueMicrotask(() => chatInputRef.current?.focus());
  }, [activeConversation, conversations, saveChats, t.newChat]);

  const handleNewChatRef = useRef(handleNewChat);
  useEffect(() => {
    handleNewChatRef.current = handleNewChat;
  }, [handleNewChat]);

  // --- Global Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Focus chat input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        chatInputRef.current?.focus();
      }
      // Ctrl+\ or Cmd+\: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && (e.key === "\\" || e.key === "|")) {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Ctrl+N or Cmd+N: New chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewChatRef.current();
      }
      // Escape: Close any open dropdowns or mobile sidebar
      if (e.key === "Escape") {
        setModelDropdownOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Delete chat ---
  const handleDeleteChat = useCallback((id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    saveChats(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
      } else {
        setActiveId(null);
      }
    }
  }, [conversations, activeId, saveChats]);

  // --- Clear all chats ---
  const handleClearAll = useCallback(() => {
    saveChats([]);
    setActiveId(null);
    setAttachedFile(null);
    setImagePreview(null);
  }, [saveChats]);

  // --- Select chat ---
  const handleSelectChat = useCallback((id: string) => {
    setActiveId(id);
    setAttachedFile(null);
    setImagePreview(null);
    queueMicrotask(() => chatInputRef.current?.focus());
  }, []);

  // --- Rename chat ---
  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    const updated = conversations.map((c) => {
      if (c.id === id) {
        return { ...c, title: newTitle };
      }
      return c;
    });
    saveChats(updated);
  }, [conversations, saveChats]);

  // --- File Uploading Helpers ---
  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processFile = useCallback((fileObj: File) => {
    if (!fileObj) return;

    if (fileObj.size > 5 * 1024 * 1024) {
      addToast("error", "File size exceeds 5MB limit.");
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
      addToast("error", t.unsupportedFile || "Unsupported file format.");
    }
  }, [addToast, t.unsupportedFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj) processFile(fileObj);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const fileObj = e.dataTransfer.files?.[0];
    if (fileObj) processFile(fileObj);
  }, [processFile]);

  const removeAttachment = useCallback(() => {
    setAttachedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // --- Voice Dictation (Speech to Text) ---
  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;

    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognition = 
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast("error", t.speechNotSupported || "Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    const langMap: Record<string, string> = {
      hi: "hi-IN",
      bho: "bho-IN",
      ur: "ur-IN",
      ar: "ar-SA",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      pa: "pa-IN",
      or: "or-IN",
      as: "as-IN",
      sa: "sa-IN",
      zh: "zh-CN",
      ja: "ja-JP",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      pt: "pt-BR",
      it: "it-IT",
      en: "en-US",
    };
    recognition.lang = langMap[language] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error: ", event.error);
      if (event.error === "not-allowed") {
        addToast("error", t.micAccessDenied || "Microphone access denied.");
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
      addToast("error", "Text-to-speech is not supported in this browser.");
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
    addToast("success", `Chat exported as .${format}`);
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
      addToast("success", t.feedbackGood || "Thank you for your feedback!");
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

  // --- Helpers for O(1) Conversation Updates ---
  const updateChatMessages = useCallback((chatId: string, newMessages: Message[], newTitle?: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            title: newTitle !== undefined ? newTitle : c.title,
            messages: newMessages,
          };
        }
        return c;
      });
      conversationsRef.current = updated;
      safeStorage.setItem("lemur-chats", JSON.stringify(updated), true);
      return updated;
    });
  }, []);

  const updateLastAssistantMessage = useCallback((chatId: string, content: string, modelName?: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === chatId) {
          const msgs = [...c.messages];
          if (msgs.length > 0) {
            const lastIdx = msgs.length - 1;
            msgs[lastIdx] = {
              ...msgs[lastIdx],
              content,
              model: modelName || msgs[lastIdx].model,
            };
          }
          return { ...c, messages: msgs };
        }
        return c;
      });
      conversationsRef.current = updated;
      return updated;
    });
  }, []);

  // --- Real-time SSE Stream Consumer (Smooth motion, O(1) streaming) ---
  const streamChatResponse = async (
    chatId: string,
    existingMessages: Message[],
    payloadMessages: ChatPayloadMessage[],
    fileObj?: AttachedFilePayload | null
  ) => {
    setLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Append initial assistant placeholder
    const placeholderMessage: Message = {
      role: "assistant",
      content: "",
      model: "Lemur AI",
      timestamp: getNow(),
    };

    const messagesWithAssistant = [...existingMessages, placeholderMessage];
    updateChatMessages(chatId, messagesWithAssistant);
    setTimeout(scrollToBottom, 50);

    let accumulatedText = "";
    let activeModelName = "Lemur AI";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          model,
          language,
          file: fileObj || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${res.status})`);
      }

      if (!res.body) {
        throw new Error("No response stream received from the server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let hasNewTokens = false;

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.slice(6).trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.type === "meta") {
              if (data.model) activeModelName = data.model;
              hasNewTokens = true;
            } else if (data.type === "chunk") {
              accumulatedText += data.text;
              hasNewTokens = true;
            } else if (data.type === "warning") {
              if (data.model) activeModelName = data.model;
              hasNewTokens = true;
            } else if (data.type === "ping") {
              // Heartbeat ping keeping connection alive during deep reasoning / long answer queues
              continue;
            } else if (data.type === "error") {
              if (!accumulatedText) {
                throw new Error(data.error || "Streaming error from model.");
              } else {
                accumulatedText += `\n\n> ⚠️ *Generation paused (${data.error || "provider limit"}). You can continue by clicking regenerate.*`;
                hasNewTokens = true;
              }
            }
          } catch (e: unknown) {
            const err = e as { message?: string };
            if (err?.message && !err.message.includes("Unexpected end of JSON")) {
              throw e;
            }
          }
        }

        if (hasNewTokens) {
          updateLastAssistantMessage(chatId, accumulatedText, activeModelName);
          autoScrollToBottom();
        }
      }

      // Handle any trailing buffer
      if (buffer.startsWith("data: ")) {
        try {
          const data = JSON.parse(buffer.slice(6).trim());
          if (data.type === "chunk") {
            accumulatedText += data.text;
            updateLastAssistantMessage(chatId, accumulatedText, activeModelName);
          }
        } catch {}
      }

      // Final save to storage directly from conversationsRef
      safeStorage.setItem("lemur-chats", JSON.stringify(conversationsRef.current), true);
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (errorObj?.name === "AbortError") {
        console.log("Response generation cancelled by user.");
        safeStorage.setItem("lemur-chats", JSON.stringify(conversationsRef.current), true);
        return;
      }

      console.error("[Lemur AI] Stream error:", err);
      const errorContent = accumulatedText
        ? `${accumulatedText}\n\n> ⚠️ *Connection interrupted (${errorObj?.message || "timeout"}). Click regenerate to continue.*`
        : `⚠️ Error: ${errorObj?.message || "Failed to generate response."}`;

      updateLastAssistantMessage(chatId, errorContent, activeModelName);
      safeStorage.setItem("lemur-chats", JSON.stringify(conversationsRef.current), true);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // --- Main Submit Handler ---
  const handleSubmit = async (e?: React.FormEvent | null, customPrompt?: string) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() && !attachedFile) return;

    let currentChatId = activeId;
    let currentChat = conversations.find((c) => c.id === currentChatId);

    if (!currentChatId || !currentChat) {
      const newId = generateChatId();
      currentChatId = newId;
      const newChat: Conversation = {
        id: newId,
        title: promptToSend.substring(0, 26) || "New Conversation",
        timestamp: getNow(),
        messages: [],
      };
      setConversations((prev) => [newChat, ...prev]);
      setActiveId(newId);
      currentChat = newChat;
    }

    const userMessage: Message = {
      role: "user",
      content: promptToSend,
      timestamp: getNow(),
    };

    const promptWithAttachedText = attachedFile && attachedFile.content
      ? `[Attached Document: ${attachedFile.name}]\n\n${promptToSend}`
      : promptToSend;

    const displayUserMsg: Message = {
      ...userMessage,
      content: attachedFile
        ? `${t.fileUploaded} ${attachedFile.name}\n\n${promptToSend}`
        : promptToSend,
    };

    const updatedMessages = [...currentChat.messages, displayUserMsg];
    let newTitle = currentChat.title;
    if (currentChat.messages.length === 0) {
      newTitle = promptToSend.substring(0, 30) + (promptToSend.length > 30 ? "..." : "");
    }

    updateChatMessages(currentChatId, updatedMessages, newTitle);

    const payloadMessages = currentChat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    payloadMessages.push({
      role: "user",
      content: promptWithAttachedText,
    });

    const fileToUpload = attachedFile
      ? {
          name: attachedFile.name,
          type: attachedFile.type,
          data: attachedFile.data,
          content: attachedFile.content,
        }
      : null;

    setInput("");
    removeAttachment();
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
    }

    await streamChatResponse(currentChatId, updatedMessages, payloadMessages, fileToUpload);
  };

  // --- Message Edit & Resubmit ---
  const handleEditUserMessage = async (msgIdx: number, newContent: string) => {
    if (!activeId) return;

    // Abort any ongoing stream before initiating edited response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }

    const currentChat =
      conversationsRef.current.find((c) => c.id === activeId) ||
      conversations.find((c) => c.id === activeId);
    if (!currentChat) return;

    if (msgIdx < 0 || msgIdx >= currentChat.messages.length) return;

    const prefixMessages = currentChat.messages.slice(0, msgIdx);
    const editedUserMsg: Message = {
      role: "user",
      content: newContent,
      timestamp: getNow(),
    };

    const updatedMessages = [...prefixMessages, editedUserMsg];

    // If first message in conversation was edited, update title to match
    let newTitle = currentChat.title;
    if (msgIdx === 0) {
      newTitle = newContent.substring(0, 30) + (newContent.length > 30 ? "..." : "");
    }

    updateChatMessages(activeId, updatedMessages, newTitle);

    const payloadMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    scrollToBottom("smooth");
    await streamChatResponse(activeId, updatedMessages, payloadMessages);
  };

  // --- Message Regeneration ---
  const handleRegenerate = async () => {
    if (!activeId) return;

    // Abort any ongoing stream before regenerating
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }

    const currentChat =
      conversationsRef.current.find((c) => c.id === activeId) ||
      conversations.find((c) => c.id === activeId);
    if (!currentChat || currentChat.messages.length < 2) return;

    const poppedMessages = [...currentChat.messages];
    poppedMessages.pop(); // Remove last assistant message

    updateChatMessages(activeId, poppedMessages);

    const payloadMessages = poppedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    scrollToBottom("smooth");
    await streamChatResponse(activeId, poppedMessages, payloadMessages);
  };

  // --- Auto-grow textarea (rAF batched to eliminate layout thrash) ---
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const textarea = e.target;
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex h-dvh-screen max-h-[100dvh] w-full items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl ios-glass flex items-center justify-center shadow-lg">
          <LemurLogo className="w-7 h-7 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh-screen max-h-[100dvh] w-full overflow-hidden relative" onDragOver={handleDragOver} onDrop={handleDrop}>
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
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background/70 min-w-0 relative">
        
        {/* Application Header Panel */}
        <header className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-black/[0.07] dark:border-white/10 select-none bg-[#eaedf5]/85 dark:bg-background/50 backdrop-blur-2xl z-10 safe-top safe-left safe-right shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Sidebar toggle for mobile & tablet */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="touch-target flex items-center justify-center p-2 rounded-xl lg:hidden hover:bg-black/[0.06] dark:hover:bg-white/10 text-foreground transition-all duration-150 active:scale-95 flex-shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Desktop Sidebar Expand toggle when minimized */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/10 text-foreground apple-spring active:scale-95 flex-shrink-0 shadow-sm"
                title="Expand Sidebar (⌘\)"
              >
                <PanelLeft className="w-4 h-4 stroke-[1.75]" />
              </button>
            )}

            {/* Custom Modern Model Selector Dropdown */}
            <div className="relative min-w-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="group flex items-center gap-2 text-xs sm:text-sm font-semibold bg-black/[0.03] dark:bg-[#131625] hover:bg-black/[0.06] dark:hover:bg-[#1a1f33] border border-black/[0.08] dark:border-white/12 hover:dark:border-indigo-400/30 px-3 py-1.5 rounded-xl cursor-pointer apple-spring text-foreground max-w-[200px] sm:max-w-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98]"
              >
                {model === "smart-router" && (
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0" />
                )}
                {model === "gemini-flash" && <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />}
                {model === "gemini-lite" && <Cpu className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 flex-shrink-0" />}
                {model === "nemotron-lightning" && <Brain className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />}
                {model === "minimax-m3" && <Compass className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />}
                {model === "gemma-26b" && <PenTool className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0" />}
                {model === "nemotron-ultra" && <Calculator className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />}
                
                <span className="font-sans font-semibold tracking-tight truncate">{
                  model === "smart-router" ? t.smartRouter :
                  model === "gemini-flash" ? "Gemini 2.5 Flash" :
                  model === "gemini-lite" ? "Gemini 3.5 Lite" :
                  model === "nemotron-lightning" ? "Nemotron 3.5" :
                  model === "minimax-m3" ? "MiniMax M3" :
                  model === "gemma-26b" ? "Gemma 4 26B" :
                  model === "nemotron-ultra" ? "Nemotron 550B" : model
                }</span>
                
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0 ml-0.5 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>

              {/* Dropdown Options List */}
              {modelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl ios-glass border border-black/[0.08] dark:border-white/15 p-2 flex flex-col gap-1 msg-enter max-h-96 overflow-y-auto scrollbar-thin z-40 shadow-2xl">
                  {[
                    {
                      id: "smart-router",
                      name: t.smartRouter,
                      badge: "Auto",
                      desc: "Auto-routes to the optimal model for your prompt",
                      icon: BrainCircuit,
                      color: "from-indigo-500/20 via-sky-500/20 to-cyan-400/20 text-indigo-500 dark:text-cyan-400 border-indigo-500/30",
                    },
                    {
                      id: "gemini-flash",
                      name: "Gemini 2.5 Flash",
                      desc: "Ultra-fast Google SOTA, vision & multimodal",
                      icon: Sparkles,
                      color: "from-indigo-500/20 to-violet-500/20 text-indigo-500 dark:text-indigo-400 border-indigo-500/30",
                    },
                    {
                      id: "gemini-lite",
                      name: "Gemini 3.5 Flash Lite",
                      desc: "Sub-second instant latency for fast summaries",
                      icon: Cpu,
                      color: "from-sky-500/20 to-blue-500/20 text-sky-500 dark:text-sky-400 border-sky-500/30",
                    },
                    {
                      id: "nemotron-lightning",
                      name: "Nemotron 3.5 Lightning",
                      desc: "1M context, rapid reasoning & math logic",
                      icon: Brain,
                      color: "from-cyan-500/20 to-teal-500/20 text-cyan-500 dark:text-cyan-400 border-cyan-500/30",
                    },
                    {
                      id: "minimax-m3",
                      name: "MiniMax M3",
                      desc: "1M context, multilingual & long essays",
                      icon: Compass,
                      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/30",
                    },
                    {
                      id: "gemma-26b",
                      name: "Gemma 4 26B",
                      desc: "Google latest open instruction-following model",
                      icon: PenTool,
                      color: "from-rose-500/20 to-pink-500/20 text-rose-500 dark:text-rose-400 border-rose-500/30",
                    },
                    {
                      id: "nemotron-ultra",
                      name: "Nemotron 3 Ultra 550B",
                      desc: "Massive 550B parameters for deep analysis",
                      icon: Calculator,
                      color: "from-amber-500/20 to-orange-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30",
                    },
                  ].map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = model === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setModel(opt.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`group flex items-center justify-between w-full p-2.5 rounded-xl text-left apple-spring transition-all ${
                          isSelected
                            ? "bg-indigo-500/10 dark:bg-white/10 text-foreground font-semibold border border-indigo-500/25 dark:border-white/15 shadow-sm"
                            : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-foreground border border-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${opt.color} border flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200`}>
                            <IconComp className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold truncate">{opt.name}</p>
                              {opt.badge && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/25 uppercase tracking-wide">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5 line-clamp-1">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 ml-2 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleNewChat}
              className="group w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.04] dark:bg-[#131625] hover:bg-black/[0.08] dark:hover:bg-[#1a1f33] border border-black/[0.08] dark:border-white/12 hover:dark:border-indigo-400/40 text-foreground apple-spring shadow-sm active:scale-95"
              title={`${t.newChat} (⌘N)`}
              aria-label={t.newChat}
            >
              <SquarePen className="w-4 h-4 text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 stroke-[2]" />
            </button>
            <div className="h-4 w-[1px] bg-black/[0.08] dark:bg-white/10 mx-0.5" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </header>

        {/* Conversation Box */}
        <div 
          ref={chatContainerRef}
          className={`flex-1 ${
            messages.length === 0
              ? "overflow-hidden flex flex-col justify-center items-center p-2 sm:p-4 no-scrollbar"
              : "overflow-y-auto p-2.5 sm:p-4 md:p-6 2xl:p-8 space-y-4 sm:space-y-6 scrollbar-thin hardware-scroll"
          } safe-left safe-right`}
        >
          {messages.length === 0 ? (
            /* Empty Chat State - Modern Minimalist Hero (Fits Viewport Perfectly) */
            <div className="max-w-2xl 2xl:max-w-3xl mx-auto flex flex-col items-center text-center space-y-3 sm:space-y-4 select-none msg-enter px-2 w-full my-auto">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl ios-glass-card flex items-center justify-center shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform duration-300">
                <LemurLogo className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
                  {t.suggestHeading}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto font-normal leading-relaxed">
                  {t.suggestSub}
                </p>
              </div>

              {/* Grid Suggestions cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-xl mt-2">
                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescCoding)}
                  className="ios-glass-card p-3 sm:p-3.5 rounded-2xl cursor-pointer text-left apple-spring group active:scale-[0.99] hover:translate-y-[-2px] hover:border-primary/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/20 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors font-sans tracking-tight">
                        {t.suggestTitleCoding}
                      </h3>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {t.suggestDescCoding}
                  </p>
                </div>

                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescMath)}
                  className="ios-glass-card p-3 sm:p-3.5 rounded-2xl cursor-pointer text-left apple-spring group active:scale-[0.99] hover:translate-y-[-2px] hover:border-emerald-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <Calculator className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-500 transition-colors font-sans tracking-tight">
                        {t.suggestTitleMath}
                      </h3>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {t.suggestDescMath}
                  </p>
                </div>

                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescCreative)}
                  className="ios-glass-card p-3 sm:p-3.5 rounded-2xl cursor-pointer text-left apple-spring group active:scale-[0.99] hover:translate-y-[-2px] hover:border-rose-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/20 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <PenTool className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-500 transition-colors font-sans tracking-tight">
                        {t.suggestTitleCreative}
                      </h3>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {t.suggestDescCreative}
                  </p>
                </div>

                <div 
                  onClick={(e) => handleSubmit(e, t.suggestDescExplain)}
                  className="ios-glass-card p-3 sm:p-3.5 rounded-2xl cursor-pointer text-left apple-spring group active:scale-[0.99] hover:translate-y-[-2px] hover:border-indigo-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/20 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-500 transition-colors font-sans tracking-tight">
                        {t.suggestTitleExplain}
                      </h3>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {t.suggestDescExplain}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Rendered Messages list */
            <div className="max-w-3xl 2xl:max-w-5xl mx-auto space-y-4 sm:space-y-6 w-full">
              {messages.map((msg, idx) => {
                const isCurrentAssistantGenerating =
                  loading &&
                  idx === messages.length - 1 &&
                  msg.role === "assistant";

                return (
                  <ChatMessage
                    key={`${msg.timestamp}-${idx}`}
                    idx={idx}
                    message={msg}
                    onRegenerate={idx === messages.length - 1 ? handleRegenerate : undefined}
                    onFeedback={(type) => handleFeedback(idx, type)}
                    onEdit={(newContent) => handleEditUserMessage(idx, newContent)}
                    onSelectQuestion={(q) => handleSubmit(null, q)}
                    isSpeaking={speakingIdx === idx}
                    onToggleSpeech={() => handleToggleSpeech(idx, msg.content)}
                    isLast={idx === messages.length - 1}
                    isGenerating={isCurrentAssistantGenerating}
                  />
                );
              })}

              {/* Initial thinking state fallback before assistant message mounts */}
              {loading && messages.length > 0 && messages[messages.length - 1].role !== "assistant" && (
                <div className="flex w-full gap-3 sm:gap-4 py-4 px-3 sm:py-5 sm:px-5 rounded-2xl sm:rounded-3xl ios-glass-card select-none msg-enter">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-violet-500 text-white shadow-md shadow-primary/25 border border-white/20">
                    <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse text-white" />
                  </div>
                  <div className="flex flex-col gap-2 w-full justify-center">
                    <span className="text-xs sm:text-sm text-primary font-semibold tracking-tight flex items-center gap-2 font-sans">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      Lemur AI is reasoning and preparing response...
                    </span>
                    <div className="flex items-center gap-1.5 py-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Text Form Area */}
        <footer className="px-3 py-2 sm:px-4 sm:py-3 bg-transparent relative safe-bottom safe-left safe-right transition-all duration-200">
          
          {/* Scroll to bottom floating action button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full ios-glass text-foreground hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all duration-150 shadow-lg active:scale-95 z-30"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-3.5 h-3.5 text-primary" />
            </button>
          )}

          <div className="max-w-3xl 2xl:max-w-4xl mx-auto relative w-full">
            
            {/* File Upload Preview bar */}
            {attachedFile && (
              <div className="mb-2.5 px-3 py-2 rounded-2xl ios-glass border border-black/[0.08] dark:border-white/15 flex items-center justify-between shadow-lg z-20 animate-slide-up">
                <div className="flex items-center gap-2.5 min-w-0">
                  {imagePreview ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0 border border-black/[0.08] dark:border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Upload preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-mono">{attachedFile.type || "File"}</p>
                  </div>
                </div>
                <button
                  onClick={removeAttachment}
                  className="p-1 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Apple iPhone Floating Action Dock Capsule */}
            <form 
              onSubmit={handleSubmit}
              className="ios-glass-dock relative flex flex-col rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 transition-all duration-200"
            >
              {/* Top: Auto-growing Textarea */}
              <div className="w-full px-2 pt-1 pb-1">
                <textarea
                  ref={chatInputRef}
                  rows={1}
                  value={input}
                  onChange={handleTextAreaChange}
                  onKeyDown={handleKeyPress}
                  placeholder={t.placeholder}
                  maxLength={4000}
                  className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-neutral-500 dark:placeholder:text-neutral-400 border-0 outline-none ring-0 resize-none min-h-[40px] max-h-[160px] leading-relaxed font-sans block shadow-none focus:outline-none focus:ring-0"
                />
              </div>

              {/* Bottom Toolbar: Attachment, Model Badge, Voice Dictation, Character Gauge, Send Button */}
              <div className="flex items-center justify-between pt-1 px-1">
                {/* Left: Attachment & Model Badge */}
                <div className="flex items-center gap-1">
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
                    className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all duration-150 border-0 outline-none"
                    title={t.uploadFile}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.03] dark:bg-[#131625] border border-black/[0.08] dark:border-white/10 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    {model === "smart-router" ? (
                      <BrainCircuit className="w-3 h-3 text-indigo-500 dark:text-cyan-400 flex-shrink-0" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                    )}
                    <span className="truncate">{
                      model === "smart-router" ? "Smart Router (Auto)" :
                      model === "gemini-flash" ? "Gemini 2.5 Flash" :
                      model === "gemini-lite" ? "Gemini Lite" :
                      model === "nemotron-lightning" ? "Nemotron 3.5" :
                      model === "minimax-m3" ? "MiniMax M3" :
                      model === "gemma-26b" ? "Gemma 4" :
                      model === "nemotron-ultra" ? "Nemotron 550B" : model
                    }</span>
                  </div>
                </div>

                {/* Right: Char count, Voice, Send/Cancel */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {input.length > 150 && (
                    <span className="hidden sm:inline-block text-[10px] text-neutral-500 dark:text-neutral-400 font-mono select-none px-1">
                      {input.length}/4000
                    </span>
                  )}

                  {/* Voice Dictation */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-xl transition-all duration-150 border-0 outline-none ${
                      isListening 
                        ? "text-red-500 bg-red-500/15 shadow-sm" 
                        : "text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95"
                    }`}
                    title={t.voiceInput}
                  >
                    {isListening ? (
                      <div className="flex items-center gap-1">
                        <Mic className="w-4 h-4 animate-pulse text-red-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      </div>
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>

                  {/* Submit / Cancel toggler */}
                  {loading ? (
                    <button
                      type="button"
                      onClick={handleCancelResponse}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all duration-150 border-0 outline-none shadow-sm"
                      title="Stop generating"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={(!input.trim() && !attachedFile) || loading}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 border-0 outline-none ${
                        input.trim() || attachedFile
                          ? "bg-primary hover:bg-primary/90 text-white shadow-[0_2px_12px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-95"
                          : "bg-black/[0.06] dark:bg-white/[0.08] text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            </form>

            <p className="text-[11px] text-center text-neutral-500 dark:text-neutral-400 mt-2.5 select-none font-sans">
              Lemur AI can make mistakes. Verify critical information.
            </p>
          </div>
        </footer>
      </main>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
