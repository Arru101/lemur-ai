"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  X, 
  Download, 
  ExternalLink, 
  Search, 
  Maximize2, 
  Minimize2, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  TableProperties,
  ArrowRight
} from "lucide-react";
import { triggerConfetti } from "../utils/confetti";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  shortcut: string;
  action: string;
  category: string;
  level?: number;
}

const EXCEL_SHORTCUTS_DATA: ShortcutItem[] = [
  // 1. Essential Everyday Shortcuts
  { category: "Essential Everyday", shortcut: "Ctrl + N", action: "New workbook", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + O", action: "Open workbook", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + S", action: "Save workbook", level: 1 },
  { category: "Essential Everyday", shortcut: "F12", action: "Save As", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + P", action: "Print", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + W", action: "Close workbook", level: 1 },
  { category: "Essential Everyday", shortcut: "Alt + F4", action: "Close Excel", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + Z", action: "Undo", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + Y", action: "Redo / Repeat", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + C", action: "Copy", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + X", action: "Cut", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + V", action: "Paste", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + Alt + V", action: "Paste Special", level: 1 },
  { category: "Essential Everyday", shortcut: "Delete", action: "Clear cell contents", level: 1 },
  { category: "Essential Everyday", shortcut: "Esc", action: "Cancel current action / edit", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + F", action: "Find", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + H", action: "Find and Replace", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + K", action: "Insert hyperlink", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + A", action: "Select current data region / all", level: 1 },
  { category: "Essential Everyday", shortcut: "Ctrl + Shift + S", action: "Save As in some Excel versions / Windows conventions", level: 1 },

  // 2. Navigation & Selection
  { category: "Navigation & Selection", shortcut: "Arrow Keys", action: "Move one cell", level: 1 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Arrow", action: "Jump to edge of current data region", level: 1 },
  { category: "Navigation & Selection", shortcut: "Home", action: "Go to beginning of row", level: 1 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Home", action: "Go to cell A1", level: 1 },
  { category: "Navigation & Selection", shortcut: "Ctrl + End", action: "Go to last used cell", level: 1 },
  { category: "Navigation & Selection", shortcut: "Page Up / Page Down", action: "Move one screen up/down", level: 1 },
  { category: "Navigation & Selection", shortcut: "Alt + Page Up / Page Down", action: "Move one screen left/right", level: 1 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Page Up", action: "Previous worksheet", level: 1 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Page Down", action: "Next worksheet", level: 1 },
  { category: "Navigation & Selection", shortcut: "Shift + Arrow", action: "Extend selection by one cell", level: 2 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Shift + Arrow", action: "Extend selection to edge of data region", level: 2 },
  { category: "Navigation & Selection", shortcut: "Shift + Space", action: "Select entire row", level: 2 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Space", action: "Select entire column", level: 2 },
  { category: "Navigation & Selection", shortcut: "Ctrl + Shift + Space", action: "Select current region / all cells", level: 2 },
  { category: "Navigation & Selection", shortcut: "F5 / Ctrl + G", action: "Go To dialog", level: 2 },
  { category: "Navigation & Selection", shortcut: "Alt + ;", action: "Select visible cells only", level: 2 },

  // 3. Data Entry & Editing
  { category: "Data Entry & Editing", shortcut: "F2", action: "Edit active cell", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Alt + Enter", action: "Insert line break inside a cell", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + Enter", action: "Fill selected cells with current entry", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + D", action: "Fill Down", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + R", action: "Fill Right", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + '", action: "Copy formula from cell above", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + Shift + \"", action: "Copy value from cell above", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + ;", action: "Enter current date", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + Shift + ;", action: "Enter current time", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + E", action: "Flash Fill (AI Data Pattern Fill)", level: 2 },
  { category: "Data Entry & Editing", shortcut: "Ctrl + Shift + Enter", action: "Legacy array formula entry", level: 3 },

  // 4. Formatting
  { category: "Formatting", shortcut: "Ctrl + 1", action: "Format Cells dialog", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + B", action: "Bold text/cells", level: 1 },
  { category: "Formatting", shortcut: "Ctrl + I", action: "Italic", level: 1 },
  { category: "Formatting", shortcut: "Ctrl + U", action: "Underline", level: 1 },
  { category: "Formatting", shortcut: "Ctrl + 5", action: "Strikethrough", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + ~", action: "General format", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + $", action: "Currency format ($)", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + %", action: "Percentage format (%)", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + ^", action: "Scientific format", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + #", action: "Date format", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + @", action: "Time format", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + !", action: "Number format with separators", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + &", action: "Apply outline border", level: 2 },
  { category: "Formatting", shortcut: "Ctrl + Shift + _", action: "Remove outline border", level: 2 },
  { category: "Formatting", shortcut: "Alt + H, O, I", action: "AutoFit column width", level: 3 },
  { category: "Formatting", shortcut: "Alt + H, O, A", action: "AutoFit row height", level: 3 },
  { category: "Formatting", shortcut: "Alt + H, H", action: "Fill Color menu", level: 2 },
  { category: "Formatting", shortcut: "Alt + H, B", action: "Borders menu", level: 2 },

  // 5. Rows, Columns & Cells
  { category: "Rows, Columns & Cells", shortcut: "Ctrl + +", action: "Insert cells/rows/columns", level: 2 },
  { category: "Rows, Columns & Cells", shortcut: "Ctrl + -", action: "Delete cells/rows/columns", level: 2 },
  { category: "Rows, Columns & Cells", shortcut: "Ctrl + 9", action: "Hide selected rows", level: 2 },
  { category: "Rows, Columns & Cells", shortcut: "Ctrl + Shift + 9", action: "Unhide rows", level: 2 },
  { category: "Rows, Columns & Cells", shortcut: "Ctrl + 0", action: "Hide selected columns", level: 2 },
  { category: "Rows, Columns & Cells", shortcut: "Ctrl + Shift + 0", action: "Unhide columns", level: 2 },
  { category: "Rows, Columns & Cells", shortcut: "Alt + H, O, R", action: "Rename selected sheet", level: 3 },
  { category: "Rows, Columns & Cells", shortcut: "Alt + H, O, W", action: "Column Width dialog", level: 3 },
  { category: "Rows, Columns & Cells", shortcut: "Alt + H, O, H", action: "Row Height dialog", level: 3 },

  // 7. Formulas & Calculation
  { category: "Formulas & Calculation", shortcut: "=", action: "Start a formula", level: 1 },
  { category: "Formulas & Calculation", shortcut: "F4", action: "Toggle absolute/relative references ($A$1)", level: 2 },
  { category: "Formulas & Calculation", shortcut: "Shift + F3", action: "Insert Function dialog", level: 2 },
  { category: "Formulas & Calculation", shortcut: "Ctrl + `", action: "Show / Hide all formulas", level: 2 },
  { category: "Formulas & Calculation", shortcut: "Alt + =", action: "AutoSum formula", level: 2 },
  { category: "Formulas & Calculation", shortcut: "F9", action: "Calculate all open workbooks (or evaluate part of formula)", level: 3 },
  { category: "Formulas & Calculation", shortcut: "Ctrl + Shift + U", action: "Expand / Collapse formula bar", level: 2 },
  { category: "Formulas & Calculation", shortcut: "Ctrl + [", action: "Select cells referenced directly by formula", level: 3 },
  { category: "Formulas & Calculation", shortcut: "Ctrl + ]", action: "Select formulas that reference active cell", level: 3 },

  // 8. Tables, Filters & Data
  { category: "Tables & Data", shortcut: "Ctrl + T", action: "Create Table (Format as Table)", level: 2 },
  { category: "Tables & Data", shortcut: "Ctrl + Shift + L", action: "Toggle AutoFilter on/off", level: 2 },
  { category: "Tables & Data", shortcut: "Alt + Down Arrow", action: "Open filter/drop-down list in header", level: 2 },
  { category: "Tables & Data", shortcut: "Alt + A, S, A", action: "Sort ascending (A-Z)", level: 3 },
  { category: "Tables & Data", shortcut: "Alt + A, S, D", action: "Sort descending (Z-A)", level: 3 },
  { category: "Tables & Data", shortcut: "Alt + A, M", action: "Remove Duplicates dialog", level: 3 },
  { category: "Tables & Data", shortcut: "Alt + A, E", action: "Text to Columns wizard", level: 3 },

  // 9. PivotTables & Analysis
  { category: "PivotTables & Analysis", shortcut: "Alt + N, V", action: "Insert PivotTable", level: 3 },
  { category: "PivotTables & Analysis", shortcut: "Alt + F5", action: "Refresh PivotTable / selected data", level: 3 },
  { category: "PivotTables & Analysis", shortcut: "Ctrl + Alt + F5", action: "Refresh all data connections", level: 3 },
  { category: "PivotTables & Analysis", shortcut: "Alt + F1", action: "Create embedded chart from data", level: 3 },
  { category: "PivotTables & Analysis", shortcut: "F11", action: "Create chart on new chart sheet", level: 3 },

  // 12. View, Freeze & Display
  { category: "View & Display", shortcut: "Ctrl + F1", action: "Show / Hide Ribbon toolbar", level: 2 },
  { category: "View & Display", shortcut: "Alt + W, F, F", action: "Freeze Panes at current cell", level: 3 },
  { category: "View & Display", shortcut: "Alt + W, F, R", action: "Freeze Top Row", level: 3 },
  { category: "View & Display", shortcut: "Alt + W, F, C", action: "Freeze First Column", level: 3 },
  { category: "View & Display", shortcut: "Ctrl + Mouse Wheel", action: "Zoom in / Zoom out", level: 1 },
  { category: "View & Display", shortcut: "Alt + W, Q", action: "Zoom dialog", level: 2 },

  // 17. Windows & Workbooks
  { category: "Windows & Workbooks", shortcut: "Ctrl + F6", action: "Switch between open Excel windows", level: 2 },
  { category: "Windows & Workbooks", shortcut: "Ctrl + Tab", action: "Switch to next workbook window", level: 2 },
];

export default function PdfViewerModal({ isOpen, onClose }: PdfViewerModalProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "cheatsheet">("pdf");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom uploaded PDF state with local persistence
  const [storedPdfUrl, setStoredPdfUrl] = useState<string>("/excel-shortcuts-guide.pdf");
  const [storedPdfName, setStoredPdfName] = useState<string>("Microsoft Excel Shortcut Keys & Reference Guide");
  const [isCustomPdf, setIsCustomPdf] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom stored PDF if available
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const customData = localStorage.getItem("lemurs-stored-pdf-data");
        const customName = localStorage.getItem("lemurs-stored-pdf-name");
        if (customData && customName) {
          setStoredPdfUrl(customData);
          setStoredPdfName(customName);
          setIsCustomPdf(true);
        }
      } catch (e) {
        console.warn("Could not read stored PDF from localStorage", e);
      }
    });
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Custom PDF File Upload
  const handleUploadCustomPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("PDF size exceeds 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStoredPdfUrl(dataUrl);
      setStoredPdfName(file.name);
      setIsCustomPdf(true);

      try {
        localStorage.setItem("lemurs-stored-pdf-data", dataUrl);
        localStorage.setItem("lemurs-stored-pdf-name", file.name);
      } catch (err) {
        console.warn("Storage quota exceeded, PDF will remain active in current session only.", err);
      }
      setActiveTab("pdf");
    };
    reader.readAsDataURL(file);
  };

  // Reset to original attached Excel PDF
  const handleResetDefault = () => {
    setStoredPdfUrl("/excel-shortcuts-guide.pdf");
    setStoredPdfName("Microsoft Excel Shortcut Keys & Reference Guide");
    setIsCustomPdf(false);
    try {
      localStorage.removeItem("lemurs-stored-pdf-data");
      localStorage.removeItem("lemurs-stored-pdf-name");
    } catch (e) {
      console.warn("Error removing custom PDF", e);
    }
  };

  // Copy shortcut text to clipboard
  const handleCopyShortcut = (e: React.MouseEvent, shortcut: string) => {
    triggerConfetti(e.clientX, e.clientY);
    navigator.clipboard.writeText(shortcut);
    setCopiedKey(shortcut);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Categories for interactive filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    EXCEL_SHORTCUTS_DATA.forEach((item) => set.add(item.category));
    return ["All", ...Array.from(set)];
  }, []);

  // Filtered shortcuts
  const filteredShortcuts = useMemo(() => {
    return EXCEL_SHORTCUTS_DATA.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.shortcut.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/70 backdrop-blur-md transition-all duration-300 select-none"
      onClick={onClose}
    >
      {/* Hidden File Input for uploading custom PDF */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="application/pdf" 
        onChange={handleUploadCustomPdf} 
        className="hidden" 
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex flex-col bg-[#fbfbfd] dark:bg-[#0e111d] border border-black/[0.1] dark:border-white/15 shadow-2xl overflow-hidden transition-all duration-300 apple-spring ${
          isFullscreen 
            ? "w-full h-full rounded-none" 
            : "w-full max-w-5xl h-[92vh] max-h-[950px] rounded-3xl"
        }`}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-black/[0.08] dark:border-white/10 bg-white/75 dark:bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-sm">
              <FileSpreadsheet className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate font-sans tracking-tight">
                  {storedPdfName}
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                  {isCustomPdf ? "Custom PDF" : "Official Guide"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {isCustomPdf 
                  ? "User stored PDF document • Accessible anywhere across app" 
                  : "Microsoft Excel Windows Desktop Reference • 9 Pages • 18 Sections"
                }
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {/* View Tab Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] border border-black/[0.06] dark:border-white/10 mr-1">
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "pdf"
                    ? "bg-white dark:bg-[#1a1f33] text-foreground shadow-xs"
                    : "text-neutral-500 hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cheatsheet")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "cheatsheet"
                    ? "bg-white dark:bg-[#1a1f33] text-foreground shadow-xs"
                    : "text-neutral-500 hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cheatsheet</span>
              </button>
            </div>

            {/* Upload / Replace Stored PDF */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-foreground apple-spring active:scale-95 border-0 outline-none flex items-center justify-center"
              title="Store / Replace with another PDF"
            >
              <Upload className="w-4 h-4 stroke-[1.8]" />
            </button>

            {/* Reset to default if custom */}
            {isCustomPdf && (
              <button
                type="button"
                onClick={handleResetDefault}
                className="p-2 rounded-xl hover:bg-rose-500/15 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 apple-spring active:scale-95 border-0 outline-none flex items-center justify-center"
                title="Reset to original Excel Guide"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.8]" />
              </button>
            )}

            {/* Open in New Tab Button */}
            <a
              href={storedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-foreground apple-spring active:scale-95 border-0 outline-none flex items-center justify-center"
              title="Open PDF in New Browser Tab (Anywhere)"
            >
              <ExternalLink className="w-4 h-4 stroke-[1.8]" />
            </a>

            {/* Download Button */}
            <a
              href={storedPdfUrl}
              download={isCustomPdf ? storedPdfName : "excel-shortcuts-guide.pdf"}
              className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-foreground apple-spring active:scale-95 border-0 outline-none flex items-center justify-center"
              title="Download PDF File"
            >
              <Download className="w-4 h-4 stroke-[1.8]" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-foreground apple-spring active:scale-95 border-0 outline-none items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 stroke-[1.8]" />
              ) : (
                <Maximize2 className="w-4 h-4 stroke-[1.8]" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-foreground apple-spring active:scale-95 border-0 outline-none flex items-center justify-center ml-1"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-neutral-100/50 dark:bg-neutral-950/40">
          {activeTab === "pdf" ? (
            <div className="flex-1 w-full h-full flex flex-col relative">
              {/* Native PDF Iframe */}
              <iframe
                src={`${storedPdfUrl}#toolbar=1&navpanes=1`}
                className="w-full flex-1 border-0 bg-neutral-900"
                title={storedPdfName}
              />

              {/* Bottom Quick Help Bar */}
              <div className="px-4 py-2 bg-white/80 dark:bg-black/60 border-t border-black/[0.06] dark:border-white/10 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between backdrop-blur-md">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  PDF is saved locally in the app. Click the ↗ button to pop it out into any window.
                </span>
                <div className="hidden sm:flex items-center gap-3">
                  <a
                    href={storedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Open in separate tab <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Searchable Interactive Cheatsheet View */
            <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-5 gap-3.5">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md flex items-center h-10 rounded-2xl bg-white dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/12 shadow-xs focus-within:border-emerald-500/50">
                  <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 100+ Excel shortcuts (e.g. PivotTable, AutoFit, Freeze, Flash Fill)..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-transparent border-0 outline-none text-foreground placeholder-neutral-400 font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 p-1 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-400 hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-white/80 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] text-neutral-600 dark:text-neutral-300 border border-black/[0.06] dark:border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shortcuts Table / Cards */}
              <div className="flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 shadow-xs hardware-scroll scrollbar-thin">
                {filteredShortcuts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-neutral-400 text-center">
                    <TableProperties className="w-10 h-10 opacity-30 mb-2" />
                    <p className="text-sm font-medium">No shortcuts found matching &quot;{searchQuery}&quot;</p>
                    <p className="text-xs text-neutral-500 mt-1">Try searching for formula, copy, autofit, or date.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-neutral-50 dark:bg-[#151928] border-b border-black/[0.08] dark:border-white/10 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider z-10">
                      <tr>
                        <th className="py-2.5 px-4">Shortcut Key</th>
                        <th className="py-2.5 px-4">Action</th>
                        <th className="py-2.5 px-4 hidden sm:table-cell">Category</th>
                        <th className="py-2.5 px-3 text-right">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs sm:text-sm">
                      {filteredShortcuts.map((item, idx) => {
                        const isCopied = copiedKey === item.shortcut;
                        return (
                          <tr 
                            key={idx} 
                            className="hover:bg-emerald-500/[0.04] dark:hover:bg-emerald-500/[0.08] transition-colors group"
                          >
                            <td className="py-2.5 px-4 font-mono font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                              <kbd className="px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] border border-black/10 dark:border-white/15 text-emerald-700 dark:text-emerald-300 font-mono shadow-[0_1px_1px_rgba(0,0,0,0.06)] text-xs">
                                {item.shortcut}
                              </kbd>
                            </td>
                            <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300 font-sans">
                              {item.action}
                            </td>
                            <td className="py-2.5 px-4 text-neutral-500 dark:text-neutral-400 text-xs hidden sm:table-cell">
                              <span className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/10">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => handleCopyShortcut(e, item.shortcut)}
                                className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                title="Copy shortcut"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
