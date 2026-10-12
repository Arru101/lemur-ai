"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  BookOpen,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Layers,
  Code2,
  TableProperties,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { triggerConfetti } from "../utils/confetti";

interface ExcelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStudySession?: (initialPrompt: string, title?: string) => void;
}

interface ChapterItem {
  id: string;
  part: number | string;
  title: string;
  category: "Foundations" | "Formulas" | "Cleaning" | "Lookups" | "Analysis" | "Automation" | "Projects" | "Career";
  pages: string;
  summary: string;
  keyFormulas?: string[];
  syntaxExample?: string;
  commonMistake?: string;
  practicePrompt: string;
  aiStudyQuestion: string;
  highlights: string[];
}

const EXCEL_GUIDE_CHAPTERS: ChapterItem[] = [
  {
    id: "part-1",
    part: 1,
    title: "Excel Interface & Cell Referencing",
    category: "Foundations",
    pages: "Page 2",
    summary: "Understand the grid, row numbers, and column letters. Master the Golden Rule of Referencing ($) using F4: Relative (A1), Absolute ($A$1), Mixed Row Lock (A$1), and Mixed Col Lock ($A1).",
    keyFormulas: [
      "=B2*$E$1",
      "=B2+C2",
      "F4 (Cycle Locks)",
    ],
    syntaxExample: "=B2*$E$1 // Keeps $E$1 (bonus % 15%) locked while B2 moves row by row",
    commonMistake: "#VALUE! error occurs when one of your cells contains text instead of a number, or if numbers were typed with spaces.",
    practicePrompt: "Calculate employee bonuses in Column C where base salary is in B and company-wide bonus (15%) is stored in cell E1.",
    aiStudyQuestion: "Teach me Part 1 of the workbook: how does cell referencing with $ work and when do I use relative vs absolute?",
    highlights: [
      "Excel shifts row numbers (A1 -> A2) when dragged down, and column letters (A1 -> B1) when dragged right",
      "The $ symbol locks the row or column; press F4 to cycle locks",
      "Relative (A1), Absolute ($A$1), Row Lock (A$1), Column Lock ($A1)",
      "Common Error: #VALUE! happens when multiplying numbers stored as text",
    ],
  },
  {
    id: "part-2",
    part: 2,
    title: "Custom Formatting & Data Types",
    category: "Foundations",
    pages: "Page 3",
    summary: "Excel stores value and format separately. Master Essential Custom Number Formats (Ctrl+1): Indian Comma System (Lakhs/Crores), adding text without breaking math, hiding zeroes, and leading zeroes.",
    keyFormulas: [
      "##\\,##\\,##0 (Indian Comma Format)",
      '0 "Boxes" (Text without breaking math)',
      "0;-0;;@ (Hide Zeroes)",
      "+91-00000 00000 (Phone Format)",
      "00000 (Force 5-digit ID with leading zeroes)",
      "Ctrl + Shift + # (Date Shortcut)",
      "Ctrl + Shift + $ (Currency Shortcut)",
    ],
    syntaxExample: "##\\,##\\,##0 // Displays 1250000 as 12,50,000",
    commonMistake: "Typing text like 'Cr' or 'Boxes' manually into the cell; Excel treats it as text and your SUM formulas will fail.",
    practicePrompt: "Clean a bank statement: convert number '45210' to '11-Oct-2023', amounts to ₹5,001, and preserve leading zeros on 5-digit Employee IDs.",
    aiStudyQuestion: "Explain Custom Number Formats from Part 2: how do I display Lakhs/Crores and add units without breaking math?",
    highlights: [
      "Indian Comma System: ##\\,##\\,##0 converts 1250000 into 12,50,000",
      "Units without breaking formulas: 0 \"Boxes\" keeps mathematical number 1250000",
      "Hiding zeroes: 0;-0;;@ leaves cell visually blank if value is 0",
      "5-Digit Employee IDs: format as 00000 or type apostrophe ('00123)",
    ],
  },
  {
    id: "part-3",
    part: 3,
    title: "Logical Functions (IF, AND, OR, IFS)",
    category: "Formulas",
    pages: "Page 4",
    summary: "Make automated decisions with logic. Combine conditions using AND() (all must be met), OR() (any can be met), and modern IFS() for tiered commissions and multi-level grading.",
    keyFormulas: [
      '=IF(B2>=40, "Pass", "Fail")',
      '=IF(AND(B2>=40, C2="Yes"), "Pass", "Fail")',
      '=IF(OR(B2="Manager", B2="Director"), "Approve", "Reject")',
      '=IFS(B2>200000, 10%, B2>100000, 5%, TRUE, 2%)',
    ],
    syntaxExample: "=IFS(condition1, result1, condition2, result2, TRUE, catch_all_result)",
    commonMistake: "In IFS(), placing lower thresholds first. Always put the highest/strictest condition first because IFS evaluates from left to right.",
    practicePrompt: "Build sales commission logic: basic bonus if Revenue > 1,00,000, Super Bonus if Revenue > 1L AND New Client, and tiered rates via IFS.",
    aiStudyQuestion: "Quiz me on nested IF, AND, OR, and modern IFS functions from Part 3 with realistic workplace scenarios.",
    highlights: [
      "AND() requires every condition to be true; OR() requires at least one",
      "IFS() replaces nested IF statements (Office 2019+ / Microsoft 365)",
      "Always set TRUE as the final condition in IFS to catch all remaining values",
      "Golden Rule: Order IFS conditions from strictest to loosest",
    ],
  },
  {
    id: "part-4",
    part: 4,
    title: "Conditional Math (SUMIFS, COUNTIFS)",
    category: "Formulas",
    pages: "Page 5",
    summary: "The backbone of MIS reporting. Always use the plural version (SUMIFS instead of SUMIF). Aggregate metrics effortlessly by region, product, and mathematical operators.",
    keyFormulas: [
      '=SUMIFS(E2:E7, B2:B7, "West")',
      '=SUMIFS(E2:E7, B2:B7, "West", C2:C7, "Laptop")',
      '=COUNTIFS(E2:E7, ">90000")',
      '=SUMIFS(E2:E7, B2:B7, G2)',
    ],
    syntaxExample: "=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2]...)",
    commonMistake: "Forgetting quotes around mathematical operators like '>90000', or reversing sum_range and criteria_range.",
    practicePrompt: "Analyze regional sales: calculate West revenue, West Laptop sales, count orders > ₹90,000, and make criteria dynamic using cell reference G2.",
    aiStudyQuestion: "How do SUMIFS and COUNTIFS work in Part 4, and why should I always use SUMIFS instead of single SUMIF?",
    highlights: [
      "SUMIFS handles both single and multiple criteria seamlessly",
      "Mathematical operators must be quoted in formulas: \">90000\"",
      "Use cell references (G2) instead of hardcoding text to create dynamic reports",
      "COUNTIFS counts occurrences matching one or more conditions",
    ],
  },
  {
    id: "part-5",
    part: 5,
    title: "Lookup Functions (VLOOKUP Deep Dive)",
    category: "Lookups",
    pages: "Page 6",
    summary: "VLOOKUP searches for a unique ID in the first column of a table and returns data from that row. Understand all 4 arguments and the top 3 causes of #N/A errors.",
    keyFormulas: [
      '=VLOOKUP(A2, Sheet2!$A$1:$D$5, 2, 0)',
      '=VLOOKUP(A2, Sheet2!$A$1:$D$5, 4, 0)',
      '=TRIM(A2)',
    ],
    syntaxExample: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
    commonMistake: "Forgetting $ on table_array ($A$1:$D$5), extra trailing spaces ('P003 '), or searching for a column to the left of the lookup column.",
    practicePrompt: "Build an invoice form: type Product Code 'P003' in cell A2 and write VLOOKUP formulas in B2 and C2 to fetch Product Name and Price.",
    aiStudyQuestion: "Explain the 4 arguments of VLOOKUP and how to debug #N/A errors based on Part 5.",
    highlights: [
      "lookup_value MUST be in the far left column of the table_array",
      "col_index_num counts from 1 starting at the leftmost column",
      "range_lookup = 0 (or FALSE) specifies an Exact Match (used 99% of the time)",
      "Top 3 #N/A reasons: no locking ($), trailing spaces (fix with TRIM), and searching leftward",
    ],
  },
  {
    id: "part-6",
    part: 6,
    title: "Advanced Lookups (Approximate & Two-Way)",
    category: "Lookups",
    pages: "Page 7",
    summary: "Master Approximate Match VLOOKUP (range_lookup = 1) for tiered tax/grade tables, INDEX & MATCH to search leftward, and modern XLOOKUP.",
    keyFormulas: [
      '=VLOOKUP(A2, $G$1:$H$5, 2, 1)',
      '=INDEX(A1:A4, MATCH(F2, B1:B4, 0))',
      '=XLOOKUP(F2, B1:B4, A1:A4, "Not Found")',
    ],
    syntaxExample: "=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])",
    commonMistake: "Using approximate match on an unsorted list. The lookup column MUST be sorted in ascending order (smallest to largest).",
    practicePrompt: "Implement a student grading system with approximate VLOOKUP, and look up Department to the left of EmpID using INDEX/MATCH and XLOOKUP.",
    aiStudyQuestion: "Compare XLOOKUP with VLOOKUP and INDEX/MATCH: why is XLOOKUP the modern standard?",
    highlights: [
      "Approximate VLOOKUP drops back to the previous tier when an exact match isn't found",
      "INDEX & MATCH overcomes VLOOKUP's left-lookup limitation",
      "MATCH finds the row number; INDEX retrieves the value",
      "XLOOKUP is simpler, safer, searches in any direction, and handles missing data natively",
    ],
  },
  {
    id: "part-7",
    part: 7,
    title: "Text Functions & Data Cleaning Workshop",
    category: "Cleaning",
    pages: "Page 8",
    summary: "Data Analysts spend 70% of their time cleaning text. Extract and clean data with LEFT, RIGHT, MID, LEN, LOWER, TRIM, SUBSTITUTE, and modern TEXTBEFORE.",
    keyFormulas: [
      '=LEFT(A2, 3)',
      '=RIGHT(A2, 2)',
      '=MID(A2, 5, 4)',
      '=LEN(A2)',
      '=LOWER(TRIM(A2))',
      '=SUBSTITUTE(A3, "_", "-")',
      '=TEXTBEFORE(A4, ",")',
      '=VALUE(A2)',
    ],
    syntaxExample: '=TEXTBEFORE(A4, ",") // Extracts city from "Mumbai, Maharashtra"',
    commonMistake: "Numbers stored as text causing =SUM() to return 0. Fix with warning dropdown 'Convert to Number', Text to Columns, or =VALUE().",
    practicePrompt: "Clean an email address with spaces, replace underscores in transaction codes, extract city names before commas, and convert text numbers.",
    aiStudyQuestion: "How do I clean enterprise ERP data using text extractors and fix numbers stored as text in Excel?",
    highlights: [
      "LEFT, RIGHT, and MID extract characters from start, end, and middle",
      "LOWER(TRIM(A2)) strips spaces and standardizes casing in one formula",
      "SUBSTITUTE replaces specific characters throughout text strings",
      "Fix text numbers using Text to Columns, multiplying by 1, or VALUE(A2)",
    ],
  },
  {
    id: "part-8",
    part: 8,
    title: "Date Math & Deadlines Workshop",
    category: "Formulas",
    pages: "Page 9",
    summary: "Excel dates are serial numbers representing days since Jan 1, 1900. Calculate due dates, invoice aging, tenure using DATEDIF, and business deadlines skipping weekends.",
    keyFormulas: [
      '=TODAY()',
      '=EOMONTH("15-Jan-2023", 0)',
      '=EDATE("15-Jan-2023", 1)',
      '=NETWORKDAYS(start, end, [holidays])',
      '=A2 + 45 (Due Date)',
      '=TODAY() - (A2 + 45) (Days Overdue)',
      '=DATEDIF(B2, TODAY(), "Y")',
      '=WORKDAY(C2, 5)',
    ],
    syntaxExample: '=WORKDAY(C2, 5) // Skips weekends (Sat/Sun) to compute 5-day SLA deadline',
    commonMistake: "Treating dates as text strings so mathematical addition fails, or calculating SLA deadlines without WORKDAY (which wrongly counts weekends).",
    practicePrompt: "Build HR and Finance trackers: calculate 45-day invoice due dates, days overdue, employee tenure in years, and 5-working-day SLA resolution dates.",
    aiStudyQuestion: "Teach me Part 8 date functions: how do EOMONTH, NETWORKDAYS, WORKDAY, and DATEDIF work in corporate reporting?",
    highlights: [
      "Dates can be added directly: Date + 30 = New Date",
      "DATEDIF is a hidden function in Excel: use 'Y' for Years, 'M' for Months, 'D' for Days",
      "EOMONTH finds month-end dates; EDATE jumps exact months",
      "WORKDAY automatically skips weekends for true business turnaround deadlines",
    ],
  },
  {
    id: "part-9",
    part: 9,
    title: "Excel Tables & Data Validation",
    category: "Foundations",
    pages: "Page 10",
    summary: "Never work with raw grids. Use Excel Tables (Ctrl+T) for auto-formatting, expanding ranges, auto-filling formulas, and Total Rows. Build bulletproof dropdowns with Data Validation.",
    keyFormulas: [
      "Ctrl + T (Convert to Table)",
      "Data > Data Validation > List",
      "Allow: Date, Less than: =TODAY()",
      "Error Alert: Custom Invalid Date Warning",
    ],
    syntaxExample: "Source: Mumbai, Delhi, Bengaluru, Chennai",
    commonMistake: "Letting users type raw city names resulting in typos like 'Mmbai' that corrupt formulas, or letting future dates into Date of Birth fields.",
    practicePrompt: "Create an official Excel Table, add a City dropdown list (B2:B100), restrict DOB to past dates using =TODAY(), and set custom error messages.",
    aiStudyQuestion: "Why should I always convert data to an Excel Table (Ctrl+T) and how do I configure Data Validation dropdowns?",
    highlights: [
      "Excel Tables automatically expand ranges when new rows are added",
      "Formulas typed in row 1 automatically copy down thousands of rows",
      "Data Validation prevents typos at entry time",
      "Custom error alerts guide end users with clear instructions",
    ],
  },
  {
    id: "part-10",
    part: 10,
    title: "Conditional Formatting Workshop",
    category: "Foundations",
    pages: "Page 11",
    summary: "Highlight exceptions automatically in dashboards and MIS trackers. Master duplicate values, top 10% rules, data bars, and advanced formula-based whole-row highlighting.",
    keyFormulas: [
      '=$D2="Complete"',
      "Highlight Cells Rules > Duplicate Values",
      "Top/Bottom Rules > Top 10%",
      "Data Bars > Blue",
    ],
    syntaxExample: '=$D2="Complete" // $ locks Column D so all row cells inspect D; row 2 shifts',
    commonMistake: "Locking the row number (=$D$2) instead of only the column (=$D2), which freezes evaluation for all rows, or misaligning 'Applies to' range.",
    practicePrompt: "Format an entire project tracker row (A2:E100) green when Column D status equals 'Complete' using a formula rule.",
    aiStudyQuestion: "Explain advanced formula-based conditional formatting: why must I use =$D2 instead of =$D$2 to color whole rows?",
    highlights: [
      "Standard rules format single cells; formula rules format entire rows",
      "The $ locks the evaluation column across the entire row width",
      "Unlocking the row number lets Excel evaluate row 2, row 3, row 4...",
      "Troubleshooting: check 'Applies to' range and ensure rule formula starts on active row",
    ],
  },
  {
    id: "part-11",
    part: 11,
    title: "PivotTables (The Analysis Engine)",
    category: "Analysis",
    pages: "Page 12",
    summary: "Summarize 500,000 rows in 3 seconds with zero formulas. The 4 golden rules of source data, cross-tabulation by Store, Show Values As % of Grand Total, date grouping, and Slicers.",
    keyFormulas: [
      "Rows: Category | Values: Sum of Profit",
      "Columns: Store (Matrix Cross-Tabulation)",
      "Show Values As > % of Grand Total",
      "Right-click Date > Group > Months and Years",
      "Insert Slicer (Interactive visual buttons)",
    ],
    syntaxExample: "Show Values As > % of Grand Total  // Converts raw rupees into percentage shares instantly",
    commonMistake: "Inserting PivotTables on data with blank column headers, merged cells, or raw subtotals in the source table.",
    practicePrompt: "Build a retail sales matrix, calculate percentage contributions, group daily sales into monthly/yearly summaries, and add a Region Slicer.",
    aiStudyQuestion: "Walk me through building and customizing PivotTables in Part 11: grouping dates, showing percentages, and adding Slicers.",
    highlights: [
      "Golden Rule: Every column must have a unique header, and data should be formatted as Ctrl+T Table",
      "No formulas required to compute % of Grand Total",
      "Right-click dates to group daily transactions into monthly or yearly rollups",
      "Slicers provide one-click visual filter buttons for interactive executive dashboards",
    ],
  },
  {
    id: "part-12",
    part: 12,
    title: "Advanced PivotTables & Charts",
    category: "Analysis",
    pages: "Page 13",
    summary: "Build formulas inside PivotTables using Calculated Fields. Choose the right visual: Line (trends), Horizontal Bar (ranked categories), Donut/Pie (≤5 categories), Combo (Actuals vs Targets).",
    keyFormulas: [
      "Calculated Field: =(Revenue - Cost) / Revenue",
      "Line Chart: Sales trending over 12 months",
      "Horizontal Bar Chart: Ranked sorted staircase",
      "Donut Chart: Category breakdown (≤5 slices)",
      "Combo Chart: Columns (Actuals) + Line with markers (Targets)",
    ],
    syntaxExample: "PivotTable Analyze > Fields, Items, & Sets > Calculated Field: =(Revenue - Cost) / Revenue",
    commonMistake: "Chart crimes: using 3D charts that distort perspective, cluttered legends on single metrics, or bar chart Y-axes starting above 0.",
    practicePrompt: "Add a Profit Margin calculated field inside a PivotTable and select the optimal chart type to visualize target vs actual revenue by store.",
    aiStudyQuestion: "What are Calculated Fields in PivotTables, and how do I avoid the 3 biggest chart crimes in executive presentations?",
    highlights: [
      "Never add formulas next to a PivotTable; always build Calculated Fields inside",
      "Horizontal bar charts should be sorted largest-to-smallest for clean staircase presentation",
      "Never use pie charts for more than 5 categories",
      "Combo charts: Actuals as columns and Targets as line with markers",
    ],
  },
  {
    id: "part-13",
    part: 13,
    title: "Power Query (Automating Data Cleaning)",
    category: "Automation",
    pages: "Page 14",
    summary: "The ultimate ETL tool built into Excel. Automate repetitive cleaning into 1 click using 'Get Data From Folder' to combine 12 CSV monthly files. Why Power Query beats VBA macros.",
    keyFormulas: [
      "Data > Get Data > From File > From Folder",
      "Combine & Transform Data",
      "Remove Unwanted Columns & Filter Nulls",
      "Close & Load",
      "Right-Click Table > Refresh",
    ],
    syntaxExample: "Folder Consolidation: Drop new monthly file into folder -> Right-click Table -> Refresh",
    commonMistake: "Writing fragile VBA macros for data cleaning when Power Query provides zero-code, anti-virus-safe, million-row scalability.",
    practicePrompt: "Consolidate 12 monthly sales CSV files from a folder into one master table, remove unwanted columns, filter blanks, and test refreshing new data.",
    aiStudyQuestion: "How does Power Query automate data cleaning and why is it superior to VBA macros for ETL tasks?",
    highlights: [
      "Automates hours of weekly copy-paste manual work into a single Refresh click",
      "Requires zero coding: all transformations use intuitive UI buttons",
      "Does not trigger corporate macro anti-virus security warnings",
      "Processes millions of rows without crashing Excel",
    ],
  },
  {
    id: "part-14",
    part: 14,
    title: "Macros and VBA Basics",
    category: "Automation",
    pages: "Page 15",
    summary: "Automate Excel interface actions: bold headers, yellow fill, filters, and freeze panes with recorded macros. Critical file extension rules (.xlsm) and ready-to-use snippets.",
    keyFormulas: [
      "Developer Tab > Record Macro (Ctrl+Shift+Q)",
      "File > Save As > Excel Macro-Enabled Workbook (*.xlsm)",
      "Alt + F11 (VBA Editor)",
      "Sub UnhideAllSheets() ... End Sub",
    ],
    syntaxExample: "For Each ws In ActiveWorkbook.Worksheets: ws.Visible = xlSheetVisible: Next ws",
    commonMistake: "Saving macro workbooks as standard .xlsx files, which permanently deletes all recorded macros without recovery. Always save as .xlsm.",
    practicePrompt: "Record a macro named FormatDailyReport to format daily headers, enable filters, and freeze the top row. Save as .xlsm and test the unhide sheets script.",
    aiStudyQuestion: "Teach me how to record macros, avoid losing code (.xlsm warning), and use the UnhideAllSheets VBA snippet from Part 14.",
    highlights: [
      "Macros handle interface automation; Power Query handles data cleaning",
      "Assign shortcuts like Ctrl+Shift+Q to run repetitive formatting routines",
      "Critical Warning: Standard .xlsx removes macros; MUST save as .xlsm",
      "VBA Editor (Alt+F11) allows pasting ready-to-use automation snippets",
    ],
  },
  {
    id: "part-15",
    part: 15,
    title: "Capstone Project - Interactive Sales Dashboard",
    category: "Projects",
    pages: "Page 16",
    summary: "Build an executive 1-page interactive dashboard. Professional 3-tab architecture: Tab 1 (Raw Data Table, hidden), Tab 2 (Calculations with 4 PivotTables), Tab 3 (Canvas with linked Slicers).",
    keyFormulas: [
      "Tab 1: Raw Data (Ctrl+T Table, hidden later)",
      "Tab 2: 4 PivotTables (Sales & Profit by Month, Region, Top 5 Reps, Category)",
      "Tab 3: Dashboard Canvas (Uncheck Gridlines + 4 PivotCharts)",
      "Slicers: Insert Year & Region Slicers -> Report Connections -> Check all 4 Pivots",
    ],
    syntaxExample: "Report Connections: Check all 4 PivotTables so clicking 'West' synchronizes all charts simultaneously",
    commonMistake: "Leaving gridlines visible on executive dashboard tabs, or forgetting to link Slicers to all PivotTables via Report Connections.",
    practicePrompt: "Build the complete 3-tab interactive sales dashboard from scratch, arrange 4 visual charts cleanly, and link Year and Region Slicers.",
    aiStudyQuestion: "Guide me through building the Part 15 Capstone Interactive Sales Dashboard step-by-step.",
    highlights: [
      "3-Tab Architecture separates raw storage, aggregation math, and executive presentation",
      "Dashboard tab: uncheck Gridlines for clean, software-like presentation",
      "4 core visuals: Line (trend), Donut (share), Bar (reps), Column (category)",
      "Report Connections connects slicers across multiple independent PivotTables",
    ],
  },
  {
    id: "part-16",
    part: 16,
    title: "Job Interview Preparation & Assessment",
    category: "Career",
    pages: "Page 17",
    summary: "Pass corporate timed 30-minute practical laptop tests: Task 1 (Text to Columns client splitting), Task 2 (10,000-row VLOOKUP), Task 3 (Conditional Formatting >1L), Task 4 (Bengaluru top sales pivot).",
    keyFormulas: [
      "Task 1: Data > Text to Columns (Delimited by _)",
      "Task 2: =VLOOKUP(B2, Sheet2!$A$1:$B$50, 2, 0)",
      "Task 3: Conditional Formatting > Greater Than 100000 -> Green Fill",
      "Task 4: PivotTable -> City Filter (Bengaluru) -> Sort Values Largest to Smallest",
      "=IFERROR(formula, 0) (Wrap calculations against #DIV/0!)",
    ],
    syntaxExample: "Top 3 Failures: Unlocked $ references, unformatted currency (1450394 vs ₹14,50,394), and unhandled #DIV/0! errors",
    commonMistake: "Panic on #DIV/0! errors when calculating year-over-year growth (wrap in =IFERROR(formula, 0)), or leaving raw unformatted numbers in pivot reports.",
    practicePrompt: "Simulate the timed 30-minute test: split client names from cities, look up employee names, highlight top sales, and identify Bengaluru's top performer.",
    aiStudyQuestion: "Coach me on the timed 30-minute practical Excel interview test and quiz me on the top 3 reasons candidates fail.",
    highlights: [
      "Practical tests assess speed and precision under timed conditions (30 minutes)",
      "Double-click fill handle to instantly populate formulas across 10,000 rows",
      "Presentation matters: always format raw numbers as currency (₹14,50,394)",
      "Wrap financial ratios in =IFERROR(formula, 0) to prevent unprofessional #DIV/0! errors",
    ],
  },
];

export default function ExcelGuideModal({
  isOpen,
  onClose,
  onStartStudySession,
}: ExcelGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"chapters" | "shortcuts" | "pdf">("chapters");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("part-1");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Categories
  const categories = useMemo(() => {
    return ["All", "Foundations", "Formulas", "Cleaning", "Lookups", "Analysis", "Automation", "Projects", "Career"];
  }, []);

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    return EXCEL_GUIDE_CHAPTERS.filter((chap) => {
      const matchesCategory = selectedCategory === "All" || chap.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        chap.title.toLowerCase().includes(q) ||
        chap.summary.toLowerCase().includes(q) ||
        (chap.keyFormulas && chap.keyFormulas.some((f) => f.toLowerCase().includes(q))) ||
        (chap.highlights && chap.highlights.some((h) => h.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeChapter = useMemo(() => {
    return EXCEL_GUIDE_CHAPTERS.find((c) => c.id === selectedChapterId) || EXCEL_GUIDE_CHAPTERS[0];
  }, [selectedChapterId]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } catch {}
    triggerConfetti(e.clientX, e.clientY);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleLaunchStudySession = (prompt: string, title?: string) => {
    if (onStartStudySession) {
      onStartStudySession(prompt, title);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="excel-guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Main Dialog Window */}
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] rounded-3xl ios-glass border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#0c101c]/95 shadow-2xl flex flex-col overflow-hidden z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-black/[0.08] dark:border-white/10 bg-neutral-50/80 dark:bg-[#111627]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="excel-guide-modal-title"
                  className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate font-sans tracking-tight"
                >
                  Microsoft Excel: Complete Practical Learning Workbook
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  17 Pages • Intensive Practice Edition
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-normal">
                A practical, example-first workbook from basics to workplace reporting & interview prep
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Start AI Study Session Trigger */}
            <button
              type="button"
              onClick={() =>
                handleLaunchStudySession(
                  "I want to study Microsoft Excel: The Complete Practical Learning Workbook (Intensive Practice Edition). Please act as my expert Excel coach. Start with an overview of the curriculum and recommend where I should begin based on my experience level.",
                  "Excel Job-Ready Guide Study Session"
                )
              }
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 apple-spring active:scale-95 transition-all"
              title="Start dedicated Excel AI coaching session"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Study Session with AI</span>
            </button>

            {/* Direct PDF Link */}
            <a
              href="/docs/excel-job-ready-learning-guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors apple-spring active:scale-95"
              title="Open raw PDF in new browser tab"
            >
              <ExternalLink className="w-4 h-4 stroke-[1.75]" />
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors apple-spring active:scale-95"
              title="Close Guide (Esc)"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-black/[0.06] dark:border-white/10 bg-neutral-100/50 dark:bg-[#14192b]/50">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("chapters")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "chapters"
                  ? "bg-white dark:bg-white/15 text-foreground shadow-xs border border-black/[0.06] dark:border-white/10"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Workbook & Chapters (17 Pages)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shortcuts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "shortcuts"
                  ? "bg-white dark:bg-white/15 text-foreground shadow-xs border border-black/[0.06] dark:border-white/10"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              }`}
            >
              <TableProperties className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Quick Revision & Shortcuts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "pdf"
                  ? "bg-white dark:bg-white/15 text-foreground shadow-xs border border-black/[0.06] dark:border-white/10"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Native PDF Document</span>
            </button>
          </div>

          <a
            href="/docs/excel-job-ready-learning-guide.pdf"
            download="excel-job-ready-learning-guide.pdf"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Download className="w-3 h-3" />
            <span>Download PDF</span>
          </a>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-neutral-50/50 dark:bg-[#0a0d18]/50">
          {activeTab === "chapters" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              
              {/* Left Column: Chapter List & Filters */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-black/[0.08] dark:border-white/10 bg-white/70 dark:bg-[#101424]/70">
                
                {/* Search Bar */}
                <div className="p-3 border-b border-black/[0.06] dark:border-white/10">
                  <div className="relative flex items-center h-9 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 focus-within:border-emerald-500/50">
                    <Search className="absolute left-3 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search formulas, chapters, topics..."
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-transparent border-0 outline-none text-foreground placeholder-neutral-400 font-sans"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 p-0.5 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-black/[0.03] dark:bg-white/[0.05] text-neutral-600 dark:text-neutral-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chapter List Scroll Area */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 hardware-scroll scrollbar-thin">
                  {filteredChapters.map((chap) => {
                    const isSelected = selectedChapterId === chap.id;
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => setSelectedChapterId(chap.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all apple-spring flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-neutral-900 dark:text-white shadow-xs"
                            : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border border-transparent"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-black/[0.04] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {chap.part}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold truncate font-sans">
                              {chap.title}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                              {chap.pages}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {chap.summary}
                          </p>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Chapter Detail View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 hardware-scroll scrollbar-thin select-text">
                
                {/* Chapter Banner */}
                <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      Part {activeChapter.part} • {activeChapter.category}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      {activeChapter.pages}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-sans tracking-tight">
                    {activeChapter.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed">
                    {activeChapter.summary}
                  </p>

                  {/* Ask AI About This Chapter Button */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/15">
                    <button
                      type="button"
                      onClick={() =>
                        handleLaunchStudySession(
                          activeChapter.aiStudyQuestion,
                          `Study: ${activeChapter.title}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs apple-spring active:scale-95 transition-all select-none"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Lemurs AI About This Chapter</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() =>
                        handleLaunchStudySession(
                          `Quiz me on Part ${activeChapter.part}: ${activeChapter.title} with 3 practical workplace test questions and grade my answers.`,
                          `Quiz: ${activeChapter.title}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-foreground text-xs font-semibold border border-black/10 dark:border-white/15 apple-spring active:scale-95 transition-all select-none"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Quiz Me on This Chapter</span>
                    </button>
                  </div>
                </div>

                {/* Key Formulas & Syntax Box */}
                {activeChapter.keyFormulas && activeChapter.keyFormulas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Key Formulas & Syntax (1-Click Copy)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeChapter.keyFormulas.map((formula, idx) => {
                        const isCopied = copiedText === formula;
                        return (
                          <div
                            key={idx}
                            className="group flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 hover:border-emerald-500/40 transition-colors"
                          >
                            <code className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-semibold truncate pr-2">
                              {formula}
                            </code>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(e, formula)}
                              className="p-1 rounded-lg hover:bg-emerald-500/15 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex-shrink-0 select-none"
                              title="Copy formula"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Highlights List */}
                {activeChapter.highlights && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      Core Concept Breakdown
                    </span>
                    <div className="rounded-2xl p-4 bg-white dark:bg-[#121626] border border-black/[0.08] dark:border-white/10 shadow-xs space-y-2">
                      {activeChapter.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistake Alert */}
                {activeChapter.commonMistake && (
                  <div className="rounded-2xl p-4 bg-amber-500/[0.07] border border-amber-500/25 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider font-sans">
                        Common Workplace Mistake to Avoid
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-200 mt-1 leading-relaxed">
                        {activeChapter.commonMistake}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hands-on Practice Challenge */}
                <div className="rounded-2xl p-4 bg-emerald-500/[0.06] border border-emerald-500/20 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider font-sans">
                      Hands-on Practice Challenge
                    </h4>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                      {activeChapter.practicePrompt}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 hardware-scroll scrollbar-thin select-text">
              
              <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/5 border border-indigo-500/20">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-sans">
                  Excel Quick Revision Sheet & Universal Workflow
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                  Keep this revision guide open before practical workplace tests and technical reporting interviews.
                </p>
              </div>

              {/* 5-Step Universal Sequence */}
              <div className="rounded-2xl p-5 bg-white dark:bg-[#121626] border border-black/[0.08] dark:border-white/10 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  The 7-Step Universal Workplace Sequence
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-3">
                  {[
                    { step: "1", name: "Clean", desc: "TRIM, PROPER, blanks" },
                    { step: "2", name: "Validate", desc: "Drop-downs & types" },
                    { step: "3", name: "Calculate", desc: "SUMIFS, COUNTIFS" },
                    { step: "4", name: "Lookup", desc: "XLOOKUP masters" },
                    { step: "5", name: "Summarize", desc: "PivotTable totals" },
                    { step: "6", name: "Visualize", desc: "Line/Bar Charts" },
                    { step: "7", name: "Check", desc: "Reconcile totals" },
                  ].map((s) => (
                    <div key={s.step} className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 text-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] font-mono inline-flex items-center justify-center mb-1">
                        {s.step}
                      </span>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">{s.name}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Shortcuts Table */}
              <div className="rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#121626] shadow-xs">
                <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/10 bg-neutral-50 dark:bg-[#161a2b] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-sans">
                    Essential High-Speed Keyboard Shortcuts
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-black/[0.06] dark:border-white/10">
                      <tr>
                        <th className="py-2.5 px-4">Key Shortcut</th>
                        <th className="py-2.5 px-4">Action</th>
                        <th className="py-2.5 px-4">Workplace Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                      {[
                        { key: "Ctrl + T", action: "Create Excel Table", context: "Turns raw rows into dynamic range" },
                        { key: "Ctrl + Shift + L", action: "Toggle AutoFilters", context: "Instantly adds filter arrows" },
                        { key: "Ctrl + E", action: "Flash Fill", context: "Pattern extraction & name formatting" },
                        { key: "Ctrl + 1", action: "Format Cells Dialog", context: "Custom dates, currency, borders" },
                        { key: "Alt + =", action: "AutoSum", context: "Instant sum of column or row" },
                        { key: "F2", action: "Edit Active Cell", context: "In-place formula editing" },
                        { key: "F4", action: "Toggle $ Reference", context: "Cycles relative -> absolute -> mixed" },
                        { key: "Ctrl + Arrow", action: "Jump to Edge", context: "Navigate to end of 100k rows" },
                        { key: "Ctrl + Shift + Arrow", action: "Select to Edge", context: "Select entire table columns" },
                        { key: "Ctrl + ;", action: "Insert Current Date", context: "Static date timestamp" },
                        { key: "Alt + H, O, I", action: "AutoFit Column Width", context: "Fixes clipped text & numbers" },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-emerald-500/[0.04] dark:hover:bg-white/[0.02]">
                          <td className="py-2 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            <kbd className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                              {item.key}
                            </kbd>
                          </td>
                          <td className="py-2 px-4 font-medium text-neutral-800 dark:text-neutral-200">
                            {item.action}
                          </td>
                          <td className="py-2 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                            {item.context}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pdf" && (
            <div className="flex-1 w-full h-full flex flex-col relative bg-neutral-900">
              <object
                data="/docs/excel-job-ready-learning-guide.pdf#toolbar=1&navpanes=1"
                type="application/pdf"
                className="w-full flex-1 border-0"
                title="Excel Job-Ready Learning Guide PDF"
              >
                {/* Antivirus & Restricted Plugin Fallback UI */}
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-4 bg-neutral-900 text-neutral-300">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                    <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-base font-bold text-white">
                      Secure System or Antivirus Protection Active
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Your antivirus (such as Kaspersky, Windows Defender) or enterprise browser policy has restricted inline PDF plugin execution. You can view the document directly in a secure standalone tab or explore the full interactive curriculum.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <a
                      href="/docs/excel-job-ready-learning-guide.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      Open PDF in Dedicated Tab <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTab("chapters")}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all active:scale-95"
                    >
                      View All 32 Pages in Web Reader
                    </button>
                  </div>
                </div>
              </object>

              <div className="px-4 py-2.5 bg-neutral-900/95 border-t border-white/10 text-[11px] text-neutral-400 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  32-Page Job-Ready Guide (Verified Antivirus & Kaspersky Safe)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("chapters")}
                    className="text-neutral-300 hover:text-white transition-colors"
                  >
                    Curriculum Mode
                  </button>
                  <span className="text-white/20">|</span>
                  <a
                    href="/docs/excel-job-ready-learning-guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    Open in Full Tab <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
