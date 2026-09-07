"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Globe, Sun, Moon, Download, Search, X, MessageSquare, Edit3 } from "lucide-react";
import { translations } from "../utils/translations";
import { triggerConfetti } from "../utils/confetti";
import LemurLogo from "./LemurLogo";

interface Conversation {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClearAll: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onExport: (format: "md" | "txt" | "pdf") => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "zh", name: "Chinese", native: "简体中文" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "it", name: "Italian", native: "Italiano" },
];

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDeleteChat,
  onClearAll,
  onRenameChat,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onExport,
  isOpen,
  onClose,
}: SidebarProps) {
  const t = translations[language] || translations.en;
  
  // --- States ---
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input on activation
  useEffect(() => {
    if (editingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [editingId]);

  const handleClearAll = () => {
    if (window.confirm(t.clearConfirm)) {
      onClearAll();
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirm)) {
      onDeleteChat(id);
    }
  };

  // --- Renaming Handlers ---
  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const submitRename = () => {
    if (editingId && editingTitle.trim()) {
      onRenameChat(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitRename();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  // --- Export Wrapper with Confetti ---
  const handleExportClick = (e: React.MouseEvent, format: "md" | "txt" | "pdf") => {
    triggerConfetti(e.clientX, e.clientY);
    onExport(format);
    setShowExportMenu(false);
  };

  // --- Filters conversations based on search query ---
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[85vw] max-w-xs sm:w-80 lg:w-72 2xl:w-80 h-dvh-screen max-h-[100dvh] glass-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 safe-top safe-left select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 sm:h-15 px-4 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <LemurLogo className="w-7 h-7" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white font-jakarta">
                {t.appName}
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold font-mono bg-black/[0.05] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                PRO
              </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl lg:hidden hover:bg-black/5 dark:hover:bg-white/5 text-neutral-400 hover:text-foreground transition-all duration-150 active:scale-95 flex items-center justify-center border-0 outline-none"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat & Search */}
        <div className="px-3 py-3 space-y-2 border-b border-black/[0.05] dark:border-white/[0.06]">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 active:scale-[0.98] transition-all duration-150 border-0 outline-none shadow-sm text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{t.newChat}</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/10 select-none">
              ⌘N
            </kbd>
          </button>

          {/* Search bar for Filtering conversations */}
          <div className="relative flex items-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] focus-within:border-black/[0.12] dark:focus-within:border-white/[0.12] transition-all duration-150">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-transparent border-0 outline-none ring-0 text-foreground placeholder-neutral-400 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">
              {t.chatHistory}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 select-none">
              {filteredConversations.length}
            </span>
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400 dark:text-neutral-600 text-center select-none space-y-2">
              <MessageSquare className="w-7 h-7 opacity-30" />
              <span className="text-xs font-medium">{t.noHistory}</span>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = chat.id === activeId;
              const isEditing = chat.id === editingId;
              return (
                <div
                  key={chat.id}
                  onClick={() => !isEditing && onSelect(chat.id)}
                  onDoubleClick={() => startRename(chat.id, chat.title)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-150 border-0 ${
                    isActive
                      ? "bg-black/[0.06] dark:bg-white/[0.08] text-foreground font-medium shadow-sm"
                      : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                >
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-40 group-hover:opacity-80" />
                  )}
                  
                  {isEditing ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={handleRenameKeyDown}
                      className="flex-1 text-xs bg-white dark:bg-neutral-900 border-0 ring-1 ring-primary text-foreground outline-none px-2 rounded-lg py-1 shadow-sm"
                    />
                  ) : (
                    <span className="flex-1 truncate text-xs sm:text-sm leading-5 pr-10 font-sans">
                      {chat.title}
                    </span>
                  )}
                  
                  {/* Action cluster on hover */}
                  {!isEditing && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(chat.id, chat.title);
                        }}
                        className="hover:text-primary p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 transition-colors border-0 outline-none"
                        title="Rename Chat"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="hover:text-rose-500 p-1 rounded-lg hover:bg-rose-500/10 text-neutral-400 transition-colors border-0 outline-none"
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Settings Footer Panel */}
        <div className="p-3 sm:p-3.5 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2 bg-black/[0.015] dark:bg-black/25 safe-bottom">
          {/* Language Selector Capsule */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors border-0">
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{t.language}</span>
            </span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="text-xs font-semibold bg-transparent border-0 outline-none ring-0 cursor-pointer text-foreground text-right max-w-[150px] truncate"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code} className="bg-neutral-100 dark:bg-neutral-900 text-foreground py-1">
                  {opt.native} ({opt.name})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggler Capsule */}
          <div 
            onClick={onThemeToggle}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer border-0"
          >
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-secondary flex-shrink-0" /> : <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              <span>{t.theme}</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
              <span>{theme === "dark" ? t.dark : t.light}</span>
            </div>
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={conversations.length === 0}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border-0 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium text-foreground transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportChat}</span>
            </button>

            {showExportMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-0 shadow-2xl z-30 flex flex-col gap-0.5">
                <button
                  onClick={(e) => handleExportClick(e, "md")}
                  className="w-full text-left text-xs px-2.5 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors border-0"
                >
                  {t.exportMarkdown}
                </button>
                <button
                  onClick={(e) => handleExportClick(e, "txt")}
                  className="w-full text-left text-xs px-2.5 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors border-0"
                >
                  {t.exportText}
                </button>
                <button
                  onClick={(e) => handleExportClick(e, "pdf")}
                  className="w-full text-left text-xs px-2.5 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors border-0"
                >
                  {t.exportPDF}
                </button>
              </div>
            )}
          </div>

          {/* Clear History Button */}
          {conversations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl active:scale-95 transition-all duration-200 border-0"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.clearHistory}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
