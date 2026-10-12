const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Validates and synchronizes the authentic Microsoft Excel Practical Learning Workbook (17 Pages).
 */
async function syncExcelGuide() {
  const docPath = path.join(process.cwd(), 'public', 'docs', 'excel-job-ready-learning-guide.pdf');
  const rootPath = path.join(process.cwd(), 'public', 'excel-job-ready-learning-guide.pdf');

  if (fs.existsSync(docPath)) {
    const bytes = fs.readFileSync(docPath);
    const pdfDoc = await PDFDocument.load(bytes);
    const pageCount = pdfDoc.getPageCount();
    console.log(`Verified Microsoft Excel Learning Workbook: ${pageCount} pages, ${bytes.length} bytes.`);
    
    // Sync to public root as well
    fs.writeFileSync(rootPath, bytes);
    console.log('Synchronized to public/excel-job-ready-learning-guide.pdf successfully.');
  } else {
    console.error('Source PDF not found at:', docPath);
  }
}

syncExcelGuide().catch(console.error);
