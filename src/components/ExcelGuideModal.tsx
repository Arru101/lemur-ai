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
    title: "Excel Foundations & Data Structure",
    category: "Foundations",
    pages: "Pages 3-4",
    summary: "Understand how Excel thinks about data. Four golden rules: one header row, one record per row, one field per column, and zero merged cells in raw data.",
    keyFormulas: ["Ctrl + T (Convert to Table)"],
    syntaxExample: "Date | Region | Product | Sales (No blank rows, no subtotals inside raw table)",
    commonMistake: "Merged titles above table headers, which break continuous data regions and disable PivotTables.",
    practicePrompt: "Create a clean 20-row sales table with Date, Region, Product, and Sales. Convert to Table with Ctrl+T.",
    aiStudyQuestion: "Teach me Part 1 of the Excel Guide: what makes a data structure professional versus bad?",
    highlights: [
      "Workbook = the file, Worksheet = tab, Cell = location (B4), Range = group (A2:D20)",
      "Merged cells in raw tables corrupt sorting, filtering, and dynamic formulas",
      "Why clean structure matters: works seamlessly with XLOOKUP, PivotTables, Power Query & charts",
    ],
  },
  {
    id: "part-2",
    part: 2,
    title: "Cell References & Core Arithmetic",
    category: "Formulas",
    pages: "Pages 5-6",
    summary: "Master relative, absolute ($H$1), and mixed ($A2 vs A$2) references, plus core arithmetic functions: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, ROUND.",
    keyFormulas: [
      "=B2+C2",
      "=B2*$H$1",
      "=SUM(B2:B5)",
      "=AVERAGE(B2:B5)",
      "=COUNTA(A2:A5)",
      "=ROUND(B2, 2)",
    ],
    syntaxExample: "=B2*$H$1 (Locks $H$1 tax rate while B2 shifts relatively as you drag down)",
    commonMistake: "Forgetting to lock fixed rate cells with $ (F4), causing copied formulas to multiply against blank cells below.",
    practicePrompt: "Build a sales calculator with Quantity, Price, and 18% Tax Rate in a locked cell H1. Compute Revenue and Tax for 10 rows.",
    aiStudyQuestion: "Explain relative, absolute, and mixed cell references with practical examples from Chapter 2.",
    highlights: [
      "Relative (=B2+C2) moves along rows and columns when copied",
      "Absolute (=$H$1) stays locked on both column and row",
      "Mixed ($A2 locks column A; A$2 locks row 2)",
      "COUNT counts only numbers; COUNTA counts all non-empty cells",
    ],
  },
  {
    id: "part-3",
    part: 3,
    title: "Text Functions & Data Cleaning",
    category: "Cleaning",
    pages: "Pages 7-8",
    summary: "Clean messy exported enterprise data using TRIM, PROPER, LEFT, RIGHT, MID, LEN, CONCAT, TEXTJOIN, SUBSTITUTE, LOWER, and Flash Fill (Ctrl+E).",
    keyFormulas: [
      "=TRIM(A2)",
      "=PROPER(TRIM(A2))",
      "=LEFT(A2, 3)",
      "=RIGHT(A2, 2)",
      "=MID(A2, 5, 5)",
      '=LOWER(CONCAT(A2, ".", B2, "@company.com"))',
      '=TEXTJOIN(", ", TRUE, A2:C2)',
    ],
    syntaxExample: '=PROPER(TRIM(A2))  // Removes leading/trailing spaces and capitalizes each word',
    commonMistake: "Using CONCAT with empty cells without setting ignore_empty, or forgetting that MID requires starting position AND length.",
    practicePrompt: "Clean a list of 100 inconsistent names ('  john doe  ') and extract transaction codes from 'INV-89345-NY'.",
    aiStudyQuestion: "How do I clean messy text and generate corporate email addresses using TRIM, PROPER, and CONCAT from Chapter 3?",
    highlights: [
      "TRIM strips redundant outer and inner multi-spaces",
      "PROPER formats titles and names into standardized case",
      "Flash Fill (Ctrl + E) instantly learns patterns like 'khan, arman' -> 'Arman Khan'",
      "TEXTJOIN joins multi-cell ranges with delimiters while skipping empty cells",
    ],
  },
  {
    id: "part-4",
    part: 4,
    title: "Conditional Calculations (SUMIFS, COUNTIFS)",
    category: "Formulas",
    pages: "Pages 9-10",
    summary: "Answer business questions with multi-condition aggregations using SUMIF, SUMIFS, COUNTIF, COUNTIFS, and AVERAGEIFS.",
    keyFormulas: [
      '=SUMIF(A2:A5, "North", B2:B5)',
      '=SUMIFS(C2:C100, A2:A100, "North", B2:B100, "Laptop")',
      '=COUNTIFS(A:A, "North", C:C, "Approved")',
      '=AVERAGEIFS(D:D, A:A, "North", B:B, "Laptop")',
    ],
    syntaxExample: '=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2)',
    commonMistake: "Confusing SUMIF and SUMIFS argument order: in SUMIF, the sum_range is at the END; in SUMIFS, the sum_range is FIRST!",
    practicePrompt: "Create a 20-row sales table with Region, Product, and Sales. Calculate total sales for North region Laptops.",
    aiStudyQuestion: "Walk me through SUMIFS, COUNTIFS, and AVERAGEIFS syntax and why argument order differs from SUMIF.",
    highlights: [
      "SUMIF handles a single condition; SUMIFS handles 2 to 127 conditions",
      "In SUMIFS, the numeric sum_range is ALWAYS the very first parameter",
      "Text criteria must be enclosed in quotes (\"North\", \">50000\")",
    ],
  },
  {
    id: "part-5",
    part: 5,
    title: "Logical Formulas (IF, AND, OR, IFERROR)",
    category: "Formulas",
    pages: "Page 11",
    summary: "Add intelligent decision branches to spreadsheets with IF, AND, OR, and prevent ugly worksheet breaks with IFERROR.",
    keyFormulas: [
      '=IF(B2>=50000, "Target Met", "Below Target")',
      '=AND(B2="North", C2="Laptop")',
      '=OR(B2="North", B2="South")',
      '=IFERROR(XLOOKUP(A2, IDs, Prices), "Not Found")',
    ],
    syntaxExample: '=IF(condition, result_if_true, result_if_false)',
    commonMistake: "Wrapping entire complex models blindly in IFERROR, which hides real data bugs instead of fixing the root cause.",
    practicePrompt: "Create a Target Status column that flags 'Target Met' or 'Below Target', and wrap a lookup in IFERROR to show 'Not Found'.",
    aiStudyQuestion: "Explain IF, AND, OR, and proper use of IFERROR according to Chapter 5.",
    highlights: [
      "IF executes conditional forks based on boolean evaluation",
      "AND returns TRUE only when ALL arguments are TRUE",
      "OR returns TRUE when AT LEAST ONE argument is TRUE",
      "IFERROR gracefully replaces #N/A, #VALUE!, or #DIV/0! with user-friendly text",
    ],
  },
  {
    id: "part-6",
    part: 6,
    title: "Modern Lookups (XLOOKUP vs VLOOKUP)",
    category: "Lookups",
    pages: "Pages 12-13",
    summary: "Connect disparate sheets and masters. Understand why modern analysts use XLOOKUP, and troubleshoot legacy VLOOKUP issues.",
    keyFormulas: [
      '=XLOOKUP(A2, Master!$A$2:$A$5, Master!$B$2:$B$5, "Not Found")',
      '=VLOOKUP(A2, Master!A:B, 2, FALSE)',
    ],
    syntaxExample: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])',
    commonMistake: "In VLOOKUP, inserting a new column between lookup and return columns breaks the hardcoded column index.",
    practicePrompt: "Connect an Employee Master to a Report Sheet using XLOOKUP, locking ranges with $ and providing 'Not Found' fallback.",
    aiStudyQuestion: "Why is XLOOKUP superior to VLOOKUP in workplace interviews? Give 4 key technical advantages.",
    highlights: [
      "XLOOKUP searches both left and right (VLOOKUP only searches to the right)",
      "Column insertion cannot break XLOOKUP because ranges are direct references",
      "Built-in 4th argument [if_not_found] removes the need for wrapping in IFERROR",
      "Exact match by default (no more accidental TRUE approximate matches)",
    ],
  },
  {
    id: "part-7",
    part: 7,
    title: "Dates & Time Calculations",
    category: "Formulas",
    pages: "Page 14",
    summary: "Manage corporate deadlines, invoice payment cycles, employee tenure, and business working days.",
    keyFormulas: [
      "=TODAY()",
      "=EOMONTH(A2, 1)",
      "=EDATE(A2, 1)",
      "=NETWORKDAYS(A2, B2)",
      '=DATEDIF(A2, TODAY(), "Y")',
    ],
    syntaxExample: '=EOMONTH(A2, 1)  // Calculates the last day of next month (e.g. 15-Sep -> 31-Oct)',
    commonMistake: "Calculating working days by simply subtracting dates, which includes weekends and company holidays.",
    practicePrompt: "Given invoice dates, calculate due dates for the end of the following month and compute working days to deadline.",
    aiStudyQuestion: "How do EOMONTH, EDATE, and NETWORKDAYS work for financial and HR reporting?",
    highlights: [
      "TODAY() is a volatile dynamic function that updates every recalculation",
      "EOMONTH calculates exact month-end cutoffs for billing and financial closes",
      "NETWORKDAYS excludes Saturdays and Sundays automatically (and optional holiday ranges)",
      "DATEDIF computes completed years, months, or days of tenure",
    ],
  },
  {
    id: "part-8",
    part: 8,
    title: "Conditional Formatting & Data Validation",
    category: "Analysis",
    pages: "Pages 15-16",
    summary: "Build controlled trackers that prevent typos and highlight critical rows dynamically using formula-driven rules.",
    keyFormulas: [
      '=$D2="Complete"',
      'Data -> Data Validation -> Allow: List -> Source: Approved, Pending, Rejected',
    ],
    syntaxExample: 'Rule Formula: =$D2="Complete" (Applies to range A2:F100)',
    commonMistake: "Writing =$D$2='Complete', which locks evaluation to row 2 for every row instead of evaluating row-by-row.",
    practicePrompt: "Build an HR tracker where Status has a 3-item drop-down, and the entire row highlights green when Status='Approved'.",
    aiStudyQuestion: "How do I write a whole-row conditional formatting formula using =$D2 and set up data validation drop-downs?",
    highlights: [
      "Whole-row rules require locking the column with $ (e.g. $D2), while keeping the row relative",
      "Data Validation prevents dirty data entry (e.g. 'Approvd' vs 'Approved')",
      "Clean validation ensures COUNTIF and PivotTables summarize with 100% accuracy",
    ],
  },
  {
    id: "part-9",
    part: 9,
    title: "PivotTables, Slicers & Refresh",
    category: "Analysis",
    pages: "Pages 17-18",
    summary: "The workplace powerhouse: summarize 100,000+ rows in 5 seconds. Add interactive slicers, date grouping, and reliable data refresh.",
    keyFormulas: [
      "Insert -> PivotTable -> Rows: Region, Columns: Product, Values: Sum of Sales",
      "Insert -> Slicer -> Category",
      "Right click Date in PivotTable -> Group -> Months / Quarters",
    ],
    syntaxExample: "5-Step Build Order: Click Table -> Insert Pivot -> Rows -> Values -> Columns",
    commonMistake: "Building PivotTables from static cell ranges instead of Ctrl+T Tables, causing new data rows to be ignored upon Refresh.",
    practicePrompt: "Create 500 sales rows, build a PivotTable of monthly revenue by store, add a category slicer, and test Refresh.",
    aiStudyQuestion: "Explain the complete PivotTable build order, slicer setup, date grouping, and why Excel Tables are mandatory for source data.",
    highlights: [
      "Converts raw transactions into multi-dimensional executive summaries",
      "Slicers provide one-click visual filtering for dashboards",
      "Date grouping aggregates daily timestamps into months, quarters, and years",
      "Excel Table source ensures new appended records are captured on right-click -> Refresh",
    ],
  },
  {
    id: "part-10",
    part: 10,
    title: "Charts & Visual Reporting",
    category: "Analysis",
    pages: "Page 19",
    summary: "Choose the right chart to answer specific business questions. Avoid decorative 3D clutter and apply the executive chart checklist.",
    keyFormulas: [
      "Column / Bar: Category Comparison",
      "Line: Trend over Time",
      "Scatter: Correlation between Two Numbers",
      "Combo: Revenue (Bars) + Margin % (Secondary Line)",
    ],
    syntaxExample: "Executive Checklist: Clear title, stated units, readable labels, no 3D distortion, max 4 series",
    commonMistake: "Using pie charts with more than 5 slices, or distorting data perspective with unnecessary 3D effects.",
    practicePrompt: "Create one monthly trend line chart and one store comparison bar chart with an executive summary sentence.",
    aiStudyQuestion: "How do I choose the correct chart type for business reporting according to Chapter 10?",
    highlights: [
      "Charts must answer a question, not decorate a sheet",
      "Line charts excel at showing month-to-month and seasonal trajectory",
      "Combo charts effectively plot dual metrics with different scales (e.g. $ and %)",
    ],
  },
  {
    id: "part-11",
    part: 11,
    title: "Power Query: Automated Cleaning & Merge vs Append",
    category: "Automation",
    pages: "Pages 20-21",
    summary: "Transform manual copy-pasting into a 1-click refresh pipeline. Master the critical architectural difference between Merge (joins) and Append (stacking).",
    keyFormulas: [
      "Data -> Get Data -> From Folder",
      "Power Query Editor -> Merge Queries (Join columns side-by-side)",
      "Power Query Editor -> Append Queries (Stack rows vertically)",
    ],
    syntaxExample: "Merge = Orders + Customer Master (by CustomerID) | Append = Jan + Feb + Mar sales reports",
    commonMistake: "Confusing Merge and Append: Merge widens the table with new columns; Append lengthens the table with new rows.",
    practicePrompt: "Simulate a multi-branch consolidation: create three monthly files and combine them with Power Query From Folder.",
    aiStudyQuestion: "Explain Power Query from manual work to refresh, and clearly differentiate Merge vs Append with workplace examples.",
    highlights: [
      "Records your data cleaning steps into repeatable code (M code)",
      "Next week, simply save new files in the folder and click 'Refresh All'",
      "Merge joins tables by matching primary keys (like SQL JOIN)",
      "Append stacks identically formatted files into a single unified dataset (like SQL UNION ALL)",
    ],
  },
  {
    id: "part-12",
    part: 12,
    title: "Executive Dashboard Building",
    category: "Analysis",
    pages: "Page 22",
    summary: "Design a clean, management-ready 1-page summary layer. Golden grid: KPI cards on top, trends on middle-left, regional breakdowns on right, slicers on side.",
    keyFormulas: [
      "KPI 1: Total Sales =SUM(Table[Sales])",
      "KPI 2: Average Order Value =AVERAGE(Table[Sales])",
      "KPI 3: Growth % =(Current - Prior)/Prior",
    ],
    syntaxExample: "7-Step Build Sequence: Clean -> Pivot -> KPIs -> Charts -> Slicers -> Align -> Test",
    commonMistake: "Overcrowding the dashboard with too many colors, dense borders, or missing last-refresh timestamp.",
    practicePrompt: "Build an executive 1-page dashboard from your sales project with 3 KPI cards, 2 charts, and synchronized slicers.",
    aiStudyQuestion: "Walk me through the 7-step sequence for assembling an executive dashboard according to Chapter 12.",
    highlights: [
      "Top row reserved for high-impact KPI summary metrics",
      "Connected slicers filter multiple PivotCharts simultaneously",
      "Always include a visible 'Last Refreshed' timestamp for executive trust",
    ],
  },
  {
    id: "part-13",
    part: 13,
    title: "Modern Dynamic Array Functions",
    category: "Formulas",
    pages: "Page 23",
    summary: "Next-generation formulas that spill arrays automatically into neighboring cells: UNIQUE, FILTER, SORT, SORTBY, SEQUENCE, and LET.",
    keyFormulas: [
      "=UNIQUE(B2:B100)",
      '=FILTER(A2:D100, D2:D100="Pending")',
      "=SORT(A2:D100, 4, -1)",
      "=SORTBY(A2:D100, D2:D100, -1)",
      "=SEQUENCE(10)",
      "=LET(x, B2*C2, x*18%)",
    ],
    syntaxExample: '=FILTER(A2:D100, D2:D100="Pending")  // Spills all pending orders automatically',
    commonMistake: "Placing manual data or formulas in cells directly below a spill formula, causing a #SPILL! error.",
    practicePrompt: "Combine FILTER and SORT to create an automatic, live-updating Pending Orders list sorted descending by sales.",
    aiStudyQuestion: "Teach me modern Excel dynamic array functions: UNIQUE, FILTER, SORT, and LET from Chapter 13.",
    highlights: [
      "Results spill into adjacent cells without needing legacy Ctrl+Shift+Enter",
      "UNIQUE extracts deduplicated lists instantly",
      "FILTER eliminates the need for manual filtering or complex nested formulas",
      "LET assigns names to calculation steps, improving formula performance and readability",
    ],
  },
  {
    id: "part-14",
    part: 14,
    title: "Practical Error Handling & Diagnostics",
    category: "Cleaning",
    pages: "Page 24",
    summary: "Diagnose why errors happen rather than blindly masking them: #N/A, #VALUE!, #REF!, #DIV/0!, and #NAME?.",
    keyFormulas: [
      "#N/A: Lookup value not found (Check IDs, trailing spaces, range bounds)",
      "#VALUE!: Data type mismatch (Text inside arithmetic)",
      "#REF!: A referenced cell, column, or sheet was deleted",
      "#DIV/0!: Denominator is 0 or empty",
      "#NAME?: Typo in function name or unquoted text string",
    ],
    syntaxExample: '=IF(B2=0, 0, A2/B2)  // Clean defensive formula avoiding #DIV/0!',
    commonMistake: "Using IFERROR to suppress errors on invalid master data, hiding revenue leaks.",
    practicePrompt: "Deliberately trigger each of the 5 common errors in a test sheet and repair them with standard workplace fixes.",
    aiStudyQuestion: "What do #N/A, #VALUE!, #REF!, #DIV/0!, and #NAME? mean, and how do I fix each cleanly in an interview?",
    highlights: [
      "#N/A is common in XLOOKUP/VLOOKUP when keys have trailing spaces (fix with TRIM)",
      "#REF! indicates structural deletion that must be repaired immediately",
      "#NAME? usually means you typed =SOOM instead of =SUM, or forgot quotes around text",
    ],
  },
  {
    id: "part-15",
    part: 15,
    title: "Job-Ready Projects: HR Roster, Inventory Match & Sales MIS",
    category: "Projects",
    pages: "Pages 25-27",
    summary: "Three comprehensive real-world workplace projects: (1) HR Roster Automation, (2) Multi-Sheet Inventory Match, (3) Monthly Sales MIS with Executive KPIs.",
    keyFormulas: [
      "Project 1: =PROPER(TRIM(A2)), =IF(AND(B2>=TODAY(), B2<=TODAY()+7), 'Joining Soon', 'Later')",
      "Project 2: =XLOOKUP(A2, Vendor!A:A, Vendor!B:B, 'Not Found'), =IF(C2>B2, 'Price Increased!', ...)",
      "Project 3: Excel Table + PivotTable + Category Slicer + Line PivotChart + KPI Cards",
    ],
    syntaxExample: "Sales MIS Deliverables: Table -> Clean -> Pivot by Store -> Slicer -> Line Chart -> 3 Observations",
    commonMistake: "Failing to document findings: an MIS report is incomplete without 3 clear, executive observations.",
    practicePrompt: "Complete Job-Ready Project 3: Monthly Sales MIS from scratch with at least 50 rows of data.",
    aiStudyQuestion: "Guide me step-by-step through completing Job-Ready Project 3: Monthly Sales MIS from Chapters 25-27.",
    highlights: [
      "Project 1 develops end-to-end data cleaning and HR alert workflows",
      "Project 2 practices cross-sheet lookups and variance detection",
      "Project 3 is the flagship portfolio asset to present during job interviews",
    ],
  },
  {
    id: "part-16",
    part: 16,
    title: "Excel Interview Preparation & Timed Test",
    category: "Career",
    pages: "Page 28",
    summary: "Prepare for concept questions and timed 30-45 minute practical workplace tests. Golden answer pattern: Problem -> Tool -> Formula -> Validation.",
    keyFormulas: [
      "Concept Qs: Relative vs Absolute, XLOOKUP vs VLOOKUP, SUMIF vs SUMIFS, Merge vs Append",
      "Practical Qs: Clean 100 names, Match 500 product IDs, Aggregate 5,000 transactions, Highlight overdue records",
    ],
    syntaxExample: "4-Part Interview Answer: 1. Explain problem -> 2. Name function -> 3. Show formula -> 4. How you validated",
    commonMistake: "Only memorizing formula names without explaining how you validate and test output accuracy.",
    practicePrompt: "Simulate the timed practical test: given 2,000 raw sales rows, clean data, join prices, build a monthly pivot and slicer in 35 mins.",
    aiStudyQuestion: "Quiz me on the top 9 Excel interview concept questions from Chapter 16 and grade my responses.",
    highlights: [
      "Interviewers test your problem-solving process, not just rote syntax",
      "Always explain how you handle edge cases (missing data, duplicates, trailing spaces)",
      "Timed test requires speed with shortcuts: Ctrl+T, Ctrl+Shift+L, Alt+=, Ctrl+1",
    ],
  },
  {
    id: "part-17",
    part: 17,
    title: "30-Day Structured Learning Roadmap",
    category: "Career",
    pages: "Page 29",
    summary: "A structured, day-by-day progression from complete beginner to job-ready analyst. The 30/70 golden rule: 30% studying, 70% active typing.",
    keyFormulas: [
      "Days 1-4: Interface, Tables, References, Arithmetic",
      "Days 5-10: IF, Text Cleaning, Flash Fill",
      "Days 11-16: SUMIFS, COUNTIFS, XLOOKUP, VLOOKUP",
      "Days 17-20: Dates, Validation, Formatting",
      "Days 21-25: PivotTables, Slicers, Charts",
      "Days 26-28: Power Query Automations",
      "Days 29-30: Comprehensive Projects & Timed Mock Tests",
    ],
    syntaxExample: "Daily Rule: 30% reading concepts, 70% typing and fixing errors",
    commonMistake: "Passive reading or video watching without typing formulas into real worksheets.",
    practicePrompt: "Commit to 45 minutes daily following the 30-day curriculum grid.",
    aiStudyQuestion: "Create a personalized 30-day study plan for me based on the Chapter 17 roadmap.",
    highlights: [
      "Builds muscle memory progressively over 4 structured weeks",
      "Moves systematically from single cells to multi-source enterprise pipelines",
      "Prepares candidates for corporate finance, supply chain, and analyst roles",
    ],
  },
  {
    id: "part-18",
    part: 18,
    title: "Final Job-Ready Checklist & Quick Revision Sheet",
    category: "Career",
    pages: "Pages 30-32",
    summary: "The 18-point verification checklist before applying for Excel-heavy roles, plus the 1-page quick revision decision guide and universal workflow sequence.",
    keyFormulas: [
      "Add: SUM / SUMIFS",
      "Count: COUNT / COUNTA / COUNTIFS",
      "Lookup: XLOOKUP / VLOOKUP",
      "Clean: TRIM / PROPER / LEFT / RIGHT / MID",
      "Dates: EOMONTH / NETWORKDAYS",
      "Summarize: PivotTable / Power Query",
      "Shortcuts: Ctrl+T, Ctrl+Shift+L, Ctrl+E, Ctrl+1, Alt+=",
    ],
    syntaxExample: "Universal Sequence: Clean -> Validate -> Calculate -> Lookup -> Summarize -> Visualize -> Check",
    commonMistake: "Applying for jobs before being able to independently troubleshoot a messy spreadsheet without tutorials.",
    practicePrompt: "Review each of the 18 checklist competencies and complete the 5-step universal sequence on raw data.",
    aiStudyQuestion: "Review the 18 Job-Ready checklist items with me and test my understanding of the 5-step sequence.",
    highlights: [
      "The finish line: when you can receive messy data and choose the right tool independently",
      "Universal analytical methodology: Clean, Validate, Calculate, Lookup, Summarize, Visualize, Check",
      "Quick revision sheet serves as the ultimate pre-interview and daily desk cheat sheet",
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
    navigator.clipboard.writeText(text);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none animate-in fade-in duration-200">
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
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate font-sans tracking-tight">
                  Excel: Complete Job-Ready Learning Guide
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  32 Pages • 18 Chapters
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
                  "I want to study the Excel Complete Job-Ready Learning Guide. Please act as my expert Excel coach. Start with an overview of the curriculum and recommend where I should begin based on my experience level.",
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
              <span>Workbook & Chapters (32 Pages)</span>
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
                    <div key={s.step} className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/08 text-center">
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
