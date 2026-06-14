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
    // Spawns confetti around the click coordinates
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 glass-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-glass-border">
          <div className="flex items-center gap-2 select-none">
            <LemurLogo className="w-8 h-8 drop-shadow-[0_0_8px_var(--primary-glow)]" />
            <span className="text-xl font-extrabold text-foreground tracking-wide font-sans">
              {t.appName}
            </span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg lg:hidden hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-foreground transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="px-4 py-3 space-y-2 border-b border-glass-border">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-semibold shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newChat}</span>
          </button>

          {/* Search bar for Filtering conversations */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-glass-border focus:outline-none focus:border-primary text-foreground placeholder-neutral-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 select-none">
            {t.chatHistory}
          </h3>
          
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-500 text-center select-none">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
              <span className="text-xs">{t.noHistory}</span>
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
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 border border-primary/20 text-primary dark:text-violet-300 font-medium"
                      : "hover:bg-white/5 dark:hover:bg-white/5 border border-transparent text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  
                  {isEditing ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={handleRenameKeyDown}
                      className="flex-1 text-sm bg-neutral-100 dark:bg-neutral-900 border border-primary text-foreground outline-none px-1 rounded py-0.5"
                    />
                  ) : (
                    <span className="flex-1 truncate text-sm leading-5 pr-12">
                      {chat.title}
                    </span>
                  )}
                  
                  {/* Action cluster on hover */}
                  {!isEditing && (
                    <div className="absolute right-2.5 hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(chat.id, chat.title);
                        }}
                        className="hover:text-primary p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200"
                        title="Rename Chat"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="hover:text-rose-500 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200"
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Settings Footer Panel */}
        <div className="p-4 border-t border-glass-border space-y-3 bg-black/10 dark:bg-black/20">
          {/* Language Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {t.language}
            </span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 border border-glass-border px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-primary text-foreground"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">简体中文</option>
              <option value="ja">日本語</option>
              <option value="pt">Português</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          {/* Theme Toggler */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              {theme === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {t.theme}
            </span>
            <button
              onClick={onThemeToggle}
              className="flex items-center gap-1.5 text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 border border-glass-border px-2.5 py-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 active:scale-95 transition-all duration-200 text-foreground"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-secondary" />
                  <span>{t.dark}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.light}</span>
                </>
              )}
            </button>
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={conversations.length === 0}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-glass-border hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportChat}</span>
            </button>

            {showExportMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-glass-border shadow-xl z-30 flex flex-col gap-1">
                <button
                  onClick={(e) => handleExportClick(e, "md")}
                  className="w-full text-left text-xs p-2 rounded hover:bg-white/5 transition-colors"
                >
                  {t.exportMarkdown}
                </button>
                <button
                  onClick={(e) => handleExportClick(e, "txt")}
                  className="w-full text-left text-xs p-2 rounded hover:bg-white/5 transition-colors"
                >
                  {t.exportText}
                </button>
                <button
                  onClick={(e) => handleExportClick(e, "pdf")}
                  className="w-full text-left text-xs p-2 rounded hover:bg-white/5 transition-colors"
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
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-lg active:scale-95 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearHistory}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
