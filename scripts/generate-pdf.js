const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createExcelGuide() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 40;
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

  const EMERALD = rgb(0.086, 0.357, 0.298);
  const EMERALD_DARK = rgb(0.05, 0.25, 0.20);
  const TEXT_DARK = rgb(0.12, 0.15, 0.2);
  const TEXT_MUTED = rgb(0.4, 0.45, 0.5);
  const BORDER_COLOR = rgb(0.85, 0.88, 0.9);
  const PRACTICE_BG = rgb(0.99, 0.98, 0.92);

  function addHeaderFooter(page, pageNum) {
    if (pageNum === 1) {
      page.drawText('Excel Job-Ready Learning Guide', { x: MARGIN, y: 25, size: 9, font: fontRegular, color: TEXT_MUTED });
      page.drawText('Page 1', { x: PAGE_WIDTH - MARGIN - 30, y: 25, size: 9, font: fontRegular, color: TEXT_MUTED });
      return;
    }
    page.drawText('EXCEL • COMPLETE JOB-READY LEARNING GUIDE', { x: MARGIN, y: PAGE_HEIGHT - 25, size: 8, font: fontBold, color: EMERALD });
    page.drawText('Learn it -> Type it -> Practice it -> Explain it', { x: PAGE_WIDTH - MARGIN - 180, y: PAGE_HEIGHT - 25, size: 8, font: fontRegular, color: TEXT_MUTED });
    page.drawLine({ start: { x: MARGIN, y: PAGE_HEIGHT - 32 }, end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 32 }, thickness: 0.5, color: BORDER_COLOR });
    page.drawText('Excel Job-Ready Learning Guide', { x: MARGIN, y: 25, size: 8, font: fontRegular, color: TEXT_MUTED });
    page.drawText(`Page ${pageNum}`, { x: PAGE_WIDTH - MARGIN - 35, y: 25, size: 8, font: fontRegular, color: TEXT_MUTED });
  }

  function drawTable(page, startY, headers, rows, colWidths) {
    const ROW_HEIGHT = 18;
    let currentY = startY;
    page.drawRectangle({ x: MARGIN, y: currentY - ROW_HEIGHT + 4, width: CONTENT_WIDTH, height: ROW_HEIGHT, color: EMERALD });
    let curX = MARGIN + 6;
    headers.forEach((h, i) => {
      page.drawText(h, { x: curX, y: currentY - 8, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });
      curX += colWidths[i];
    });
    currentY -= ROW_HEIGHT;
    rows.forEach((row, rIdx) => {
      const isAlt = rIdx % 2 === 1;
      page.drawRectangle({ x: MARGIN, y: currentY - ROW_HEIGHT + 4, width: CONTENT_WIDTH, height: ROW_HEIGHT, color: isAlt ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1), borderColor: BORDER_COLOR, borderWidth: 0.5 });
      curX = MARGIN + 6;
      row.forEach((cell, cIdx) => {
        page.drawText(String(cell), { x: curX, y: currentY - 8, size: 8, font: fontRegular, color: TEXT_DARK });
        curX += colWidths[cIdx];
      });
      currentY -= ROW_HEIGHT;
    });
    return currentY;
  }

  function drawPracticeBox(page, y, text) {
    page.drawRectangle({ x: MARGIN, y: y - 24, width: CONTENT_WIDTH, height: 32, color: PRACTICE_BG, borderColor: rgb(0.9, 0.85, 0.6), borderWidth: 0.5 });
    page.drawText(text, { x: MARGIN + 8, y: y - 13, size: 8.5, font: fontBold, color: rgb(0.35, 0.3, 0.1) });
  }

  // --- PAGE 1: COVER ---
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({ x: MARGIN, y: 360, width: CONTENT_WIDTH, height: 400, color: EMERALD });
    page.drawText('EXCEL', { x: MARGIN + 25, y: 700, size: 28, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('COMPLETE JOB-READY', { x: MARGIN + 25, y: 630, size: 24, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('LEARNING GUIDE', { x: MARGIN + 25, y: 595, size: 24, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('A practical, example-first workbook for learning Excel from the basics to workplace', { x: MARGIN + 25, y: 520, size: 11, font: fontRegular, color: rgb(0.9, 0.95, 0.93) });
    page.drawText('reporting', { x: MARGIN + 25, y: 504, size: 11, font: fontRegular, color: rgb(0.9, 0.95, 0.93) });
    page.drawText('FORMULAS • DATA CLEANING • LOOKUPS • DATES • PIVOTTABLES • CHARTS •', { x: MARGIN + 25, y: 410, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('POWER QUERY • DASHBOARDS', { x: MARGIN + 25, y: 392, size: 10, font: fontBold, color: rgb(1, 1, 1) });

    page.drawRectangle({ x: MARGIN, y: 220, width: CONTENT_WIDTH, height: 115, color: rgb(0.95, 0.97, 0.98), borderColor: rgb(0.85, 0.9, 0.92), borderWidth: 1 });
    page.drawText('How this guide is different: every major topic follows the same learning pattern: What it means -> Example ->', { x: MARGIN + 12, y: 310, size: 8.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('Formula -> What Excel returns -> Practice -> Common mistake.', { x: MARGIN + 12, y: 295, size: 8.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('This edition expands the uploaded The Job-Ready Excel Handbook. The original source covers data cleaning,', { x: MARGIN + 12, y: 270, size: 8.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('conditional aggregation, lookups, IF statements, PivotTables, business scenarios, Power Query, validation, dates', { x: MARGIN + 12, y: 255, size: 8.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('and conditional formatting. The examples and practice structure below are added to make those topics easier to', { x: MARGIN + 12, y: 240, size: 8.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('learn independently.', { x: MARGIN + 12, y: 226, size: 8.5, font: fontRegular, color: TEXT_DARK });
    addHeaderFooter(page, 1);
  }

  // --- PAGE 2: CONTENTS ---
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 2);
    page.drawText('Contents. How to use this guide', { x: MARGIN, y: PAGE_HEIGHT - 65, size: 18, font: fontBold, color: EMERALD });
    const headers = ['Part', 'Topic', 'Goal'];
    const rows = [
      ['1', 'Excel foundations', 'Understand the workbook and data structure'],
      ['2', 'References & formulas', 'Write formulas confidently'],
      ['3', 'Text & data cleaning', 'Clean real exported data'],
      ['4', 'Conditional calculations', 'Answer business questions'],
      ['5', 'Lookups', 'Connect two datasets'],
      ['6', 'Dates & time', 'Work with deadlines and periods'],
      ['7', 'Formatting & validation', 'Build controlled trackers'],
      ['8', 'PivotTables', 'Summarize large datasets'],
      ['9', 'Charts & reporting', 'Present results clearly'],
      ['10', 'Power Query', 'Automate repeated cleaning'],
      ['11', 'Dashboards', 'Build management-ready reports'],
      ['12', 'Modern Excel', 'Dynamic arrays and advanced tools'],
      ['13', 'Projects', 'Practice realistic workplace tasks'],
      ['14', 'Interview preparation', 'Prepare for practical tests'],
      ['15', '30-day roadmap', 'Follow a structured learning plan'],
    ];
    drawTable(page, PAGE_HEIGHT - 100, headers, rows, [45, 175, 295]);
  }

  // --- PAGE 3: FOUNDATIONS ---
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 3);
    page.drawText('1. Excel Foundations', { x: MARGIN, y: PAGE_HEIGHT - 65, size: 18, font: fontBold, color: EMERALD });
    page.drawText('Start with the way Excel thinks about data.', { x: MARGIN, y: PAGE_HEIGHT - 85, size: 10, font: fontRegular, color: TEXT_DARK });
    page.drawText('1.1 Workbook, worksheet, cell and range', { x: MARGIN, y: PAGE_HEIGHT - 120, size: 12, font: fontBold, color: EMERALD });
    drawTable(page, PAGE_HEIGHT - 140, ['Term', 'Simple meaning', 'Example'], [
      ['Workbook', 'The Excel file', 'Sales_Report.xlsx'],
      ['Worksheet', 'A sheet inside the file', 'January'],
      ['Cell', 'One location', 'B4'],
      ['Range', 'A group of cells', 'A2:D20'],
      ['Row', 'Horizontal record', 'Row 5 = one customer'],
      ['Column', 'One field/category', 'Column C = Sales'],
    ], [80, 215, 220]);

    page.drawText('Example: a sales table', { x: MARGIN, y: PAGE_HEIGHT - 310, size: 12, font: fontBold, color: EMERALD });
    drawTable(page, PAGE_HEIGHT - 330, ['A (Date)', 'B (Product)', 'C (Quantity)', 'D (Sales)'], [
      ['01-Jan', 'Laptop', '2', '90000'],
      ['02-Jan', 'Mouse', '5', '2500'],
      ['03-Jan', 'Keyboard', '3', '4500'],
    ], [115, 150, 115, 135]);
    drawPracticeBox(page, PAGE_HEIGHT - 475, 'Practice: create the same table in Excel. Convert it to a Table with Ctrl + T.');
  }

  // --- PAGE 4: DATA STRUCTURE ---
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 4);
    page.drawText('1.2. Professional Data Structure', { x: MARGIN, y: PAGE_HEIGHT - 65, size: 18, font: fontBold, color: EMERALD });
    page.drawText('Good Excel analysis starts with clean structure.', { x: MARGIN, y: PAGE_HEIGHT - 85, size: 10, font: fontRegular, color: TEXT_DARK });
    page.drawText('A good raw dataset usually follows four rules:', { x: MARGIN, y: PAGE_HEIGHT - 110, size: 9.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('• One header row.   • One record per row.   • One field per column.', { x: MARGIN + 10, y: PAGE_HEIGHT - 128, size: 9, font: fontRegular, color: TEXT_DARK });
    page.drawText('• No merged cells, blank separator rows or decorative totals inside the raw data.', { x: MARGIN + 10, y: PAGE_HEIGHT - 144, size: 9, font: fontRegular, color: TEXT_DARK });

    page.drawText('Bad structure vs good structure', { x: MARGIN, y: PAGE_HEIGHT - 180, size: 12, font: fontBold, color: EMERALD });
    drawTable(page, PAGE_HEIGHT - 200, ['Bad', 'Why it causes problems'], [
      ['Merged title above every section', 'Filters and PivotTables may not behave cleanly'],
      ['Blank row after every 10 records', 'Breaks continuous data regions'],
      ['Total row inside raw data', 'Can be double-counted in summaries and calculations'],
      ['Jan, Feb, Mar as separate columns', 'Harder to analyze by date or group into quarters'],
    ], [220, 295]);

    page.drawText('Good structure', { x: MARGIN, y: PAGE_HEIGHT - 320, size: 12, font: fontBold, color: EMERALD });
    drawTable(page, PAGE_HEIGHT - 340, ['Date', 'Region', 'Product', 'Sales'], [
      ['01-Jan', 'North', 'Laptop', '45000'],
      ['02-Jan', 'South', 'Mouse', '500'],
      ['03-Jan', 'North', 'Laptop', '45000'],
    ], [115, 125, 135, 140]);
    drawPracticeBox(page, PAGE_HEIGHT - 445, 'Why this matters: the same structure works for filters, SUMIFS, XLOOKUP, PivotTables & charts.');
  }

  // --- PAGE 5: REFERENCES & FORMULAS ---
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 5);
    page.drawText('2. Cell References and Formula Basics', { x: MARGIN, y: PAGE_HEIGHT - 65, size: 18, font: fontBold, color: EMERALD });
    page.drawText('Learn how Excel moves references when formulas are copied.', { x: MARGIN, y: PAGE_HEIGHT - 85, size: 10, font: fontRegular, color: TEXT_DARK });
    page.drawText('Relative reference: =B2+C2 -> Excel returns 30. Becomes =B3+C3 when dragged down.', { x: MARGIN, y: PAGE_HEIGHT - 120, size: 9.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('Absolute reference: =B2*$H$1 -> Result Rs.1,800. $H$1 remains strictly locked.', { x: MARGIN, y: PAGE_HEIGHT - 145, size: 9.5, font: fontRegular, color: TEXT_DARK });
    page.drawText('Mixed reference: $A2 locks column A, while A$2 locks row 2.', { x: MARGIN, y: PAGE_HEIGHT - 170, size: 9.5, font: fontRegular, color: TEXT_DARK });
    drawTable(page, PAGE_HEIGHT - 210, ['Quantity (A)', 'Price (B)', 'Revenue (C)'], [
      ['2', '500', '?'],
      ['5', '200', '?'],
      ['10', '100', '?'],
    ], [160, 160, 195]);
    drawPracticeBox(page, PAGE_HEIGHT - 320, 'In C2 type =A2*B2 and drag down. Then change B3 and watch C3 update dynamically.');
  }

  // --- PAGES 6 to 32 generated programmatically ---
  const chapters = [
    { num: 6, title: '2.2. Core Arithmetic Functions', sub: 'Write these without searching: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, ROUND.', table: { h: ['Function', 'Formula', 'Example result'], r: [['SUM', '=SUM(B2:B5)', 'Total of B2:B5'], ['AVERAGE', '=AVERAGE(B2:B5)', 'Arithmetic average'], ['MIN', '=MIN(B2:B5)', 'Smallest number'], ['MAX', '=MAX(B2:B5)', 'Largest number'], ['COUNT', '=COUNT(B2:B5)', 'Numeric count'], ['COUNTA', '=COUNTA(A2:A5)', 'Non-empty cell count'], ['ROUND', '=ROUND(B2,2)', '2 decimal places']], w: [110, 155, 250] }, practice: 'Practice: replace four values with your own numbers and calculate total, average, min & max.' },
    { num: 7, title: '3. Text Functions and Data Cleaning', sub: 'Exported business data is often inconsistent.', table: { h: ['Contains', 'Formula', 'Result'], r: [['  john doe  ', '=TRIM(A2)', 'john doe'], ['john doe', '=PROPER(A2)', 'John Doe'], ['  john doe  ', '=PROPER(TRIM(A2))', 'John Doe'], ['INV-89345-NY', '=LEFT(A2,3)', 'INV'], ['INV-89345-NY', '=RIGHT(A2,2)', 'NY'], ['INV-89345-NY', '=MID(A2,5,5)', '89345']], w: [150, 160, 205] }, practice: 'Remember: MID requires text, starting position, and number of characters.' },
    { num: 8, title: '3.3. Joining and Measuring Text', sub: 'Combine fields and inspect text length with precision.', table: { h: ['Function', 'Formula', 'Use'], r: [['LEN', '=LEN(A2)', 'Count characters'], ['CONCAT', '=CONCAT(A2," ",B2)', 'Join fields'], ['TEXTJOIN', '=TEXTJOIN(", ",TRUE,A2:C2)', 'Join range with delimiter'], ['SUBSTITUTE', '=SUBSTITUTE(A2,"-","/")', 'Replace text'], ['LOWER / UPPER', '=LOWER(A2)', 'Case transformation']], w: [120, 185, 210] }, practice: 'Company email: =LOWER(CONCAT(A2,".",B2,"@company.com")) -> arman.khan@company.com' },
    { num: 9, title: '4. Conditional Calculations', sub: 'SUMIF and SUMIFS as key workplace calculation patterns.', table: { h: ['Pattern', 'Syntax', 'Meaning'], r: [['SUMIF (1 condition)', '=SUMIF(A2:A5,"North",B2:B5)', 'Add Sales where Region = North'], ['SUMIFS (Multiple)', '=SUMIFS(C2:C100,A2:A100,"North",B2:B100,"Laptop")', 'Add Sales where Region=North AND Product=Laptop']], w: [140, 205, 170] }, practice: 'Practice: create a 20-row sales table with Region, Product and Sales. Calculate North Laptop sales.' },
    { num: 10, title: '4.3. COUNTIF, COUNTIFS and AVERAGEIFS', sub: 'Condition-based thinking for counts and averages.', table: { h: ['Question', 'Formula'], r: [['How many Approved?', '=COUNTIF(C:C,"Approved")'], ['How many Approved in North?', '=COUNTIFS(A:A,"North",C:C,"Approved")'], ['Average sales in North?', '=AVERAGEIF(A:A,"North",D:D)'], ['Average Laptop sales in North?', '=AVERAGEIFS(D:D,A:A,"North",B:B,"Laptop")']], w: [230, 285] }, practice: 'Practice: calculate the number of Pending orders and the average approved Laptop sale.' },
    { num: 11, title: '5. IF, AND, OR and IFERROR', sub: 'Logical decision branches in spreadsheets.', table: { h: ['Function', 'Syntax', 'Example'], r: [['IF', '=IF(condition, true, false)', '=IF(B2>=50000,"Target Met","Below Target")'], ['AND', '=AND(cond1, cond2)', '=AND(B2="North",C2="Laptop")'], ['OR', '=OR(cond1, cond2)', '=OR(B2="North",B2="South")'], ['IFERROR', '=IFERROR(val, fallback)', '=IFERROR(XLOOKUP(A2,IDs,Prices),"Not Found")']], w: [90, 195, 230] }, practice: 'Practice: create a Target Status column and a lookup result showing "Not Found" instead of error.' },
    { num: 12, title: '6. XLOOKUP: Connect Two Sheets', sub: 'The modern lookup standard replacing VLOOKUP.', table: { h: ['Sheet', 'Formula', 'Result'], r: [['Master Sheet', 'Employee Master: E101..E104', 'Salary data'], ['Report Sheet', '=XLOOKUP(A2,Master!A2:A5,Master!B2:B5,"Not Found")', '58,000 for E103, "Not Found" for E105'], ['Absolute Lock', '=XLOOKUP(A2,Master!$A$2:$A$5,Master!$B$2:$B$5,"Not Found")', 'Master range stays locked']], w: [120, 245, 150] }, practice: 'Practice: add Department and Name columns to master and retrieve all three fields in report.' },
    { num: 13, title: '6.2. VLOOKUP and Troubleshooting', sub: 'Understand VLOOKUP for existing legacy enterprise workbooks.', table: { h: ['Problem', 'Symptom', 'Workplace Fix'], r: [['Extra spaces', '#N/A', 'TRIM the lookup key'], ['Text vs Number', '#N/A', 'Make both sides match format'], ['Wrong column index', 'Wrong result', 'Verify column counting (1, 2, 3...)'], ['Copied formula shifts range', 'Results change', 'Use $ absolute references']], w: [150, 100, 265] }, practice: 'Interview Question: Why is XLOOKUP more flexible? Searches in any direction, built-in Not Found.' },
    { num: 14, title: '7. Dates and Time', sub: 'Master EOMONTH, EDATE, NETWORKDAYS and DATEDIF.', table: { h: ['Need', 'Formula', 'Example'], r: [['Today', '=TODAY()', 'Current dynamic date'], ['Month end', '=EOMONTH(A2,1)', 'Last day of next month'], ['Same date next month', '=EDATE(A2,1)', '15-Jan -> 15-Feb'], ['Working days', '=NETWORKDAYS(A2,B2)', 'Excludes Saturday and Sunday'], ['Tenure', '=DATEDIF(A2,TODAY(),"Y")', 'Full elapsed years']], w: [140, 190, 185] }, practice: 'Practice: calculate due date, working days and employee tenure for 10 records.' },
    { num: 15, title: '8. Conditional Formatting', sub: 'Make critical trends visible without manual coloring.', table: { h: ['Rule Type', 'Formula / Setting', 'Key Rule'], r: [['Cell highlight', 'Greater Than -> 50000', 'Automates top value highlight'], ['Whole-row highlight', '=$D2="Complete"', 'Lock column $D, let row evaluate row-by-row'], ['Common mistake', '=$D$2="Complete"', 'Locks evaluation to D2 only, breaking row logic']], w: [140, 180, 195] }, practice: 'Practice: highlight overdue dates, duplicate employee IDs, and rows where Priority = "High".' },
    { num: 16, title: '8.2. Data Validation and Drop-downs', sub: 'Prevent typos and dirty inputs at data capture.', table: { h: ['Step', 'Action', 'Benefit'], r: [['1', 'Select Status cells', 'Target range defined'], ['2', 'Data -> Data Validation', 'Configure rule'], ['3', 'Allow: List -> Source: Approved, Pending, Rejected', 'Prevents typing mistakes and inconsistent filters']], w: [50, 240, 225] }, practice: 'Practice: create Status, Priority and Department drop-downs with warning alerts on mismatch.' },
    { num: 17, title: '9. PivotTables: Learn by Building One', sub: 'The most powerful workplace reporting and summarization tool.', table: { h: ['Step', 'Action', 'Pivot Field Destination'], r: [['1', 'Click inside dataset', 'Active region'], ['2', 'Insert -> PivotTable', 'New sheet / Range'], ['3', 'Region', 'Rows area'], ['4', 'Sales', 'Values area (Sum)'], ['5', 'Product', 'Columns area']], w: [45, 235, 235] }, practice: 'Practice: add 20 more rows. Create a second PivotTable showing average sales by region.' },
    { num: 18, title: '9.2. PivotTables: Slicers, Dates & Refresh', sub: 'Move from a simple summary to an interactive report.', table: { h: ['Feature', 'Action', 'Workplace Advantage'], r: [['Slicers', 'Insert -> Slicer -> Category', 'Visual 1-click filtering buttons'], ['Date grouping', 'Right click date -> Group -> Months', 'Automatic monthly/quarterly trends'], ['Refresh', 'Right click -> Refresh', 'Excel Table source auto-expands range']], w: [120, 205, 190] }, practice: 'Practice Project: 500 sales rows, monthly revenue by store, category slicer, and line PivotChart.' },
    { num: 19, title: '10. Charts: Choose the Right Visual', sub: 'Charts must answer a question, not simply decorate.', table: { h: ['Question', 'Good visual choice', 'Example'], r: [['Which store sold more?', 'Column / Bar', 'Sales comparison by store'], ['How did sales change over time?', 'Line', 'Monthly sales trend'], ['How are two measures related?', 'Scatter', 'Price vs quantity correlation'], ['What share comes from each?', 'Doughnut', 'Category product mix'], ['Compare revenue and margin %?', 'Combo (Column + Line)', 'Revenue (bars) + Margin (secondary line)']], w: [180, 140, 195] }, practice: 'Checklist: clear title, stated units, readable category labels, no 3D distortion, max 4 series.' },
    { num: 20, title: '11. Power Query: Manual Work to Refresh', sub: 'Connect to external data, clean step-by-step, and refresh.', table: { h: ['Step', 'Power Query Action', 'Result'], r: [['1-2', 'Data -> Get Data -> From Folder', 'Points to reports folder'], ['3-5', 'Remove unnecessary columns, change types', 'Ensures clean schema'], ['6-7', 'Clean text and remove unwanted blanks', 'Standardized rows'], ['8', 'Close & Load -> Refresh All', 'Automates weekly report forever']], w: [50, 240, 225] }, practice: 'Practice: create 3 small CSV files with matching headers. Combine them using From Folder.' },
    { num: 21, title: '11.2. Power Query: Merge vs Append', sub: 'The fundamental architectural distinction in data modeling.', table: { h: ['Operation', 'Think of it as', 'Example'], r: [['Merge', 'Join columns horizontally', 'Orders + Customer Master via Customer ID'], ['Append', 'Stack rows vertically', 'January + February + March sales into 1 table']], w: [100, 185, 230] }, practice: 'Practice: create two customer files and three monthly sales files. Perform one Merge and one Append.' },
    { num: 22, title: '12. Dashboard Building', sub: 'A summary layer engineered for executive decision-makers.', table: { h: ['Section', 'Placement', 'Content'], r: [['Top', 'KPI Row', 'Total Sales | Orders | Avg Order Value | Growth %'], ['Middle Left', 'Trend Zone', 'Monthly Sales Trend (Line Chart)'], ['Middle Right', 'Breakdown Zone', 'Sales by Region (Bar Chart)'], ['Bottom', 'Detail Zone', 'Top Products / Exceptions'], ['Side / Top', 'Filter Zone', 'Interactive Slicers']], w: [80, 120, 315] }, practice: 'Build order: Clean data -> Pivots -> KPIs -> Charts -> Slicers -> Align & Format -> Test.' },
    { num: 23, title: '13. Modern Excel Functions', sub: 'Dynamic arrays that spill results automatically into adjacent cells.', table: { h: ['Function', 'What it does', 'Simple example'], r: [['UNIQUE', 'Returns distinct values', '=UNIQUE(B2:B100)'], ['FILTER', 'Returns matching rows', '=FILTER(A2:D100,D2:D100="Pending")'], ['SORT', 'Sorts an array', '=SORT(A2:D100,4,-1)'], ['SORTBY', 'Sorts by another range', '=SORTBY(A2:D100,D2:D100,-1)'], ['SEQUENCE', 'Generates numbers', '=SEQUENCE(10)'], ['LET', 'Names intermediate values', '=LET(x,B2*C2,x*18%)']], w: [90, 185, 240] }, practice: 'FILTER worked example: =FILTER(A2:D100,D2:D100="Pending") spills matching rows automatically.' },
    { num: 24, title: '14. Practical Error Handling', sub: 'Do not hide errors blindly. Diagnose why they occurred.', table: { h: ['Error', 'Meaning', 'Workplace Fix'], r: [['#N/A', 'No matching lookup value', 'Check lookup key, extra spaces, lookup range'], ['#VALUE!', 'Wrong value / data type', 'Check text inside arithmetic calculations'], ['#REF!', 'Broken reference', 'Repair deleted referenced cell, row or column'], ['#DIV/0!', 'Division by zero', 'Check denominator or wrap with IF/IFERROR'], ['#NAME?', 'Unrecognized formula name', 'Check spelling of function and quotes around text']], w: [80, 185, 250] }, practice: 'Example: IFERROR(XLOOKUP(A2,Master!A:A,Master!B:B),"Not Found"). Do not hide bad master data.' },
    { num: 25, title: '15. Job-Ready Project 1: HR Roster', sub: 'Data cleaning, corporate emails, joining alerts and validation.', table: { h: ['Task #', 'Deliverable', 'Production Formula'], r: [['1', 'Convert names to Proper Case', '=PROPER(TRIM(A2))'], ['2', 'Create corporate emails', '=LOWER(SUBSTITUTE(A2," ",".")&"@company.com")'], ['3', 'Upcoming joins (next 7 days)', '=IF(AND(B2>=TODAY(),B2<=TODAY()+7),"Joining Soon","Later")'], ['4', 'Conditional formatting', 'Highlight records flagged as "Joining Soon"'], ['5', 'Data validation', 'Department drop-down for future entries']], w: [55, 195, 265] }, practice: 'Practice result: build the entire sheet from scratch with at least 30 employee records.' },
    { num: 26, title: '15.2. Job-Ready Project 2: Inventory Match', sub: 'Practice multi-sheet XLOOKUP and conditional price variance flagging.', table: { h: ['Component', 'Formula / Logic', 'Outcome'], r: [['Warehouse sheet', 'Product ID, Old Price, New Price', 'Target tracking table'], ['Vendor sheet', 'Product ID, New Price', 'Source catalog'], ['Price lookup', '=XLOOKUP(A2,Vendor!A:A,Vendor!B:B,"Not Found")', 'Retrieves updated prices'], ['Price variance', '=IF(C2>B2,"Price Increased!",IF(C2<B2,"Price Decreased","No Change"))', 'Flags margin impact']], w: [115, 230, 170] }, practice: 'Practice: create 50 products, including at least 5 products that do not exist in the vendor list.' },
    { num: 27, title: '15.3. Job-Ready Project 3: Monthly Sales MIS', sub: 'Flagship portfolio project combining tables, pivots, slicers and KPIs.', table: { h: ['Step', 'Deliverable', 'Key Technique'], r: [['1', 'Convert data to Table', 'Ctrl + T structured references'], ['2', 'Clean text fields', 'TRIM and PROPER'], ['3', 'PivotTable for monthly revenue', 'Group dates by month, store in rows'], ['4', 'Product Category slicer', 'Interactive filter button'], ['5', 'Line PivotChart', 'Shows monthly trajectory'], ['6', 'KPI Cards', 'Total Sales and Average Order Value'], ['7', 'Executive observations', 'Write 3 observations from the report']], w: [45, 220, 250] }, practice: 'This is the project you should be able to walk through and explain in an interview.' },
    { num: 28, title: '16. Excel Interview Preparation', sub: 'Prepare for concept questions and timed practical assessments.', table: { h: ['Question', 'Core Concept', 'Executive Answer Summary'], r: [['1', 'Relative vs Absolute', '$ locks column and/or row when dragging formula'], ['2', 'XLOOKUP vs VLOOKUP', 'Searches in any direction, immune to column shifts'], ['3', 'SUMIF vs SUMIFS', 'Single vs multiple criteria; sum_range order difference'], ['4', 'Merged cells hazard', 'Breaks filters, formulas, sorting and PivotTables'], ['5', 'Merge vs Append', 'Merge joins columns; Append stacks rows']], w: [45, 170, 300] }, practice: 'Timed Practical Test: given 2,000 rows, clean data, join prices, pivot, slice and chart in 40 mins.' },
    { num: 29, title: '17. 30-Day Learning Roadmap', sub: 'Structured daily progression from basics to job-ready analyst.', table: { h: ['Days', 'Study Focus', 'Hands-on Task'], r: [['1-4', 'Interface, Tables, References, Arithmetic', 'Build sales calculator and clean table'], ['5-10', 'IF, Text Cleaning, Flash Fill', 'Clean dirty customer list and format emails'], ['11-16', 'SUMIFS, COUNTIFS, XLOOKUP, VLOOKUP', 'Regional sales analysis and inventory match'], ['17-20', 'Dates, Validation, Formatting', 'Due-date tracker and HR roster'], ['21-25', 'PivotTables, Slicers, Charts', 'Sales MIS and management presentation'], ['26-28', 'Power Query Automations', 'Multi-CSV folder consolidation'], ['29-30', 'Capstone Projects & Mock Tests', 'Timed practical interview test']], w: [60, 205, 250] }, practice: 'Daily rule: 30% time learning concepts, 70% actually typing, breaking and fixing spreadsheets.' },
    { num: 30, title: '18. Final Job-Ready Checklist', sub: 'Comprehensive checklist before applying for Excel-heavy analyst roles.', table: { h: ['#', 'Skill Competency', 'Status'], r: [['1', 'Create clean Excel Tables (Ctrl+T) from raw exported data', 'Verified'], ['2', 'Understand relative, absolute ($) and mixed references', 'Verified'], ['3', 'Clean text with TRIM, PROPER, LEFT, RIGHT, MID, SUBSTITUTE', 'Verified'], ['4', 'Multi-criteria formulas with SUMIFS, COUNTIFS, AVERAGEIFS', 'Verified'], ['5', 'Connect sheets with XLOOKUP and troubleshoot VLOOKUP', 'Verified'], ['6', 'Calculate dates, month-ends (EOMONTH) and working days', 'Verified'], ['7', 'Build and refresh PivotTables, Slicers and PivotCharts', 'Verified'], ['8', 'Power Query Merge and Append automation', 'Verified'], ['9', 'Build executive dashboards and troubleshoot errors', 'Verified'], ['10', 'Explain your analytical approach in an interview', 'Verified']], w: [40, 385, 90] }, practice: 'The finish line: You are job-ready when you can reason about unfamiliar data and choose the right tool.' },
    { num: 31, title: 'Excel Quick Revision Sheet', sub: 'Fast reminder for interviews, practical tests and daily desk reference.', table: { h: ['Task Need', 'Start With', 'Core Syntax'], r: [['Add numbers', 'SUM', '=SUM(B2:B100)'], ['Conditional total', 'SUMIFS', '=SUMIFS(D:D,A:A,"North",B:B,"Laptop")'], ['Apply rule', 'IF / AND / OR', '=IF(B2>=50000,"Target Met","Below Target")'], ['Safe lookup', 'XLOOKUP', '=XLOOKUP(A2,Master!A:A,Master!B:B,"Not Found")'], ['Clean name', 'TRIM / PROPER', '=PROPER(TRIM(A2))'], ['Extract text', 'LEFT / RIGHT / MID', '=MID(A2,5,5)'], ['Working days', 'NETWORKDAYS', '=NETWORKDAYS(A2,B2)'], ['Month end date', 'EOMONTH', '=EOMONTH(A2,1)'], ['Whole row highlight', 'Condition', '=$D2="Complete"']], w: [130, 115, 270] }, practice: 'Core Shortcuts: Ctrl+T Table | Ctrl+Shift+L Filter | Ctrl+E Flash Fill | Ctrl+1 Format | Alt+= Sum' },
    { num: 32, title: 'Core Shortcuts & Final Workflow', sub: 'Speed shortcuts and the universal workplace analytical methodology.', table: { h: ['Key Combo', 'Action', 'Usage Context'], r: [['F2', 'Edit active cell', 'In-place formula editing'], ['Ctrl + Arrow', 'Jump to edge of data region', 'Fast navigation across large sheets'], ['Ctrl + Shift + Arrow', 'Select to edge of data region', 'Instant column/row selection'], ['Ctrl + ;', 'Insert current date', 'Static timestamping'], ['Ctrl + Shift + ;', 'Insert current time', 'Static time recording'], ['Alt + H, O, I', 'AutoFit column width', 'Cleans clipped column display']], w: [140, 185, 190] }, practice: '5-Step Universal Sequence: Clean -> Validate -> Calculate -> Lookup -> Summarize -> Visualize -> Check.' }
  ];

  chapters.forEach((chap) => {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, chap.num);

    page.drawText(chap.title, { x: MARGIN, y: PAGE_HEIGHT - 65, size: 17, font: fontBold, color: EMERALD });
    page.drawText(chap.sub, { x: MARGIN, y: PAGE_HEIGHT - 85, size: 9.5, font: fontRegular, color: TEXT_DARK });

    if (chap.table) {
      drawTable(page, PAGE_HEIGHT - 110, chap.table.h, chap.table.r, chap.table.w);
    }

    if (chap.practice) {
      drawPracticeBox(page, 95, chap.practice);
    }
  });

  const pdfBytes = await pdfDoc.save();
  const outDir = path.join(process.cwd(), 'public', 'docs');
  fs.mkdirSync(outDir, { recursive: true });
  
  const dest1 = path.join(outDir, 'excel-job-ready-learning-guide.pdf');
  const dest2 = path.join(process.cwd(), 'public', 'excel-job-ready-learning-guide.pdf');
  
  fs.writeFileSync(dest1, pdfBytes);
  fs.writeFileSync(dest2, pdfBytes);
  console.log('Successfully generated authentic 32-page PDF at:', dest1);
}

createExcelGuide().catch(console.error);
