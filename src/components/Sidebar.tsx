"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { SquarePen, Trash2, Globe, Sun, Moon, Download, Search, X, MessageSquare, Edit3, PanelLeftClose, Check, FileSpreadsheet } from "lucide-react";
import { translations } from "../utils/translations";
import { triggerConfetti } from "../utils/confetti";
import LemurLogo from "./LemurLogo";
import ConfirmDialog from "./ConfirmDialog";

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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenPdf?: () => void;
}

export const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bho", name: "Bhojpuri", native: "भोजपुरी" },
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
  isCollapsed = false,
  onToggleCollapse,
  onOpenPdf,
}: SidebarProps) {
  const t = translations[language] || translations.en;
  
  // --- States ---
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // --- Custom Language & Export Dropup State ---
  const [languageDropupOpen, setLanguageDropupOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close language and export dropups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setLanguageDropupOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguageObj = useMemo(() => {
    return LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];
  }, [language]);

  // --- Touch Swipe Left to Close on Mobile ---
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs((touchStartYRef.current || 0) - e.changedTouches[0].clientY);
    // Swiped left by at least 45px and predominantly horizontal
    if (deltaX > 45 && deltaX > deltaY) {
      onClose();
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input on activation
  useEffect(() => {
    if (editingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [editingId]);

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPendingDeleteId(id);
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[85vw] max-w-xs sm:w-80 lg:w-72 2xl:w-80 h-dvh-screen max-h-[100dvh] glass-sidebar transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) safe-top safe-left select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed
            ? "lg:-translate-x-full lg:w-0 lg:max-w-0 lg:p-0 lg:opacity-0 lg:pointer-events-none lg:overflow-hidden lg:border-r-0"
            : "lg:static lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-5 border-b border-black/[0.06] dark:border-white/10">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-xl ios-glass flex items-center justify-center shadow-sm">
              <LemurLogo className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
                {t.appName}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-primary/15 text-primary border border-primary/25 uppercase tracking-wide">
                v2.5 Pro
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground apple-spring active:scale-95 border-0 outline-none"
                title="Minimize Sidebar (⌘\)"
              >
                <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
              </button>
            )}

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl lg:hidden hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground apple-spring active:scale-95 flex items-center justify-center border-0 outline-none"
              title="Close navigation"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* Action Bar: Unified Search + New Chat (Icon Only) */}
        <div className="px-3.5 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            {/* Search bar for Filtering conversations */}
            <div className="relative flex-1 flex items-center h-9 rounded-xl bg-white/75 dark:bg-white/[0.05] hover:bg-white/90 dark:hover:bg-white/[0.08] focus-within:bg-white dark:focus-within:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] focus-within:border-primary/50 dark:focus-within:border-primary/50 transition-all duration-150 shadow-xs">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-transparent border-0 outline-none ring-0 text-foreground placeholder-neutral-500 dark:placeholder-neutral-400 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 p-0.5 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Professional Stored PDF Reference Button */}
            {onOpenPdf && (
              <button
                type="button"
                onClick={onOpenPdf}
                title="Excel Shortcuts & Reference Guide (Alt+P)"
                aria-label="Excel Shortcuts Guide"
                className="group relative w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-500/30 shadow-xs active:scale-95 apple-spring transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 stroke-[2] transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </button>
            )}

            {/* Icon-Only New Chat Button */}
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              title="New Chat (⌘N)"
              aria-label="New Chat"
              className="group w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-gradient-to-tr dark:from-[#1e2338] dark:to-[#161a2c] dark:hover:from-[#282f4c] dark:hover:to-[#1e2338] text-white shadow-xs dark:shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] border border-black/10 dark:border-white/12 active:scale-95 apple-spring transition-all"
            >
              <SquarePen className="w-4 h-4 stroke-[2.2] text-white dark:text-indigo-300 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 hardware-scroll scrollbar-thin overscroll-contain">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 select-none">
              {t.chatHistory}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 select-none">
              {filteredConversations.length}
            </span>
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-500 dark:text-neutral-500 text-center select-none space-y-2">
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
                  className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none apple-spring transition-all duration-150 ${
                    isActive
                      ? "bg-white dark:bg-white/[0.08] text-foreground font-semibold shadow-[0_1px_4px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] border border-black/[0.06] dark:border-transparent"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 hover:text-foreground border border-transparent"
                  }`}
                >
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_8px_var(--primary)]" />
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
                      className="flex-1 text-xs bg-white dark:bg-neutral-900 border border-primary text-foreground outline-none px-2 rounded-lg py-1 shadow-sm font-sans"
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
                        className="hover:text-primary p-1 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 transition-colors border-0 outline-none"
                        title="Rename Chat"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/15 text-neutral-500 dark:text-neutral-400 transition-colors border-0 outline-none"
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

        {/* Sleek Minimalist Footer Action Dock */}
        <div className="p-3 sm:p-3.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2 bg-black/[0.02] dark:bg-black/20 backdrop-blur-xl safe-bottom">
          {/* Unified Glass Utility Action Bar */}
          <div className="flex items-center justify-around p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            
            {/* Language Icon Trigger */}
            <div className="relative" ref={languageRef}>
              <button
                type="button"
                onClick={() => setLanguageDropupOpen((prev) => !prev)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl apple-spring ${
                  languageDropupOpen
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                } active:scale-95 border-0 outline-none`}
                title={`${t.language}: ${currentLanguageObj.native}`}
              >
                <Globe className="w-4 h-4 stroke-[1.75]" />
                <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold uppercase text-primary tracking-tighter leading-none">
                  {currentLanguageObj.code}
                </span>
              </button>

              {/* Floating Language Dropup Menu */}
              {languageDropupOpen && (
                <div className="absolute bottom-full left-0 mb-3 w-56 p-1.5 rounded-2xl ios-glass border border-black/[0.08] dark:border-white/15 shadow-2xl z-50 flex flex-col gap-0.5 msg-enter max-h-72">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 select-none border-b border-black/[0.06] dark:border-white/10">
                    {t.language}
                  </div>
                  <div className="overflow-y-auto max-h-56 space-y-0.5 pr-0.5 scrollbar-thin hardware-scroll mt-1">
                    {LANGUAGE_OPTIONS.map((opt) => {
                      const isSelected = opt.code === language;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            onLanguageChange(opt.code);
                            setLanguageDropupOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs apple-spring text-left border-0 ${
                            isSelected
                              ? "bg-primary/20 text-primary font-semibold"
                              : "hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:text-foreground dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold font-sans">{opt.native}</span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal truncate font-sans">({opt.name})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Icon Trigger */}
            <button
              type="button"
              onClick={onThemeToggle}
              className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground apple-spring active:scale-95 border-0 outline-none"
              title={`${t.theme}: ${theme === "dark" ? t.dark : t.light}`}
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-indigo-400 stroke-[1.75] transition-transform duration-300 group-hover:-rotate-12" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 stroke-[1.75] transition-transform duration-300 group-hover:rotate-45" />
              )}
            </button>

            {/* Stored PDF Reference Trigger */}
            {onOpenPdf && (
              <button
                type="button"
                onClick={onOpenPdf}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-emerald-500/15 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 apple-spring active:scale-95 border-0 outline-none"
                title="Excel Shortcuts & Reference PDF (Alt+P)"
              >
                <FileSpreadsheet className="w-4 h-4 stroke-[1.75] transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-tighter leading-none">
                  PDF
                </span>
              </button>
            )}

            {/* Export Menu Icon Trigger */}
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={conversations.length === 0}
                className={`flex items-center justify-center w-10 h-10 rounded-xl apple-spring ${
                  showExportMenu
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground disabled:opacity-25 disabled:pointer-events-none"
                } active:scale-95 border-0 outline-none`}
                title={t.exportChat}
              >
                <Download className="w-4 h-4 stroke-[1.75]" />
              </button>

              {showExportMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-44 p-1.5 rounded-2xl ios-glass border border-black/[0.08] dark:border-white/15 shadow-2xl z-50 flex flex-col gap-0.5 msg-enter">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 select-none border-b border-black/[0.06] dark:border-white/10">
                    {t.exportChat}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleExportClick(e, "md")}
                    className="w-full text-left text-xs px-2.5 py-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors border-0 font-sans mt-0.5"
                  >
                    {t.exportMarkdown}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportClick(e, "txt")}
                    className="w-full text-left text-xs px-2.5 py-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors border-0 font-sans"
                  >
                    {t.exportText}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportClick(e, "pdf")}
                    className="w-full text-left text-xs px-2.5 py-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors border-0 font-sans"
                  >
                    {t.exportPDF}
                  </button>
                </div>
              )}
            </div>

            {/* Clear History Icon Trigger */}
            <button
              type="button"
              onClick={handleClearAll}
              disabled={conversations.length === 0}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-rose-500/15 text-neutral-600 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-25 disabled:pointer-events-none apple-spring active:scale-95 border-0 outline-none"
              title={t.clearHistory}
            >
              <Trash2 className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Subdued Executive Status Signature */}
          <div className="flex items-center justify-between px-1.5 pt-0.5 select-none text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="font-sans font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Lemurs AI Pro
            </span>
            <span className="font-mono text-[10px] opacity-75">v2.5</span>
          </div>
        </div>
      </aside>

      {/* Confirmation Modals */}
      <ConfirmDialog
        open={!!pendingDeleteId}
        title={t.deleteChat || "Delete Chat"}
        message={t.deleteConfirm || "Are you sure you want to delete this chat?"}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (pendingDeleteId) {
            onDeleteChat(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ConfirmDialog
        open={showClearConfirm}
        title={t.clearHistory || "Clear All Chats"}
        message={t.clearConfirm || "Are you sure you want to delete all conversations?"}
        confirmLabel="Clear All"
        variant="danger"
        onConfirm={() => {
          onClearAll();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}
