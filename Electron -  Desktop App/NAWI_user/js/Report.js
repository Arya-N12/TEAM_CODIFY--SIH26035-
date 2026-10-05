/**
 * NAWI Test Management — Report View Controller
 * Handles client-side PDF and DOCX generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPdfDownload();
  initDocxDownload(); // Initialize DOCX export
});

function initPdfDownload() {
  const btnDownload = document.getElementById('btnDownloadPdf');
  
  if (btnDownload) {
    btnDownload.addEventListener('click', generatePDF);
  }
}

function initDocxDownload() {
  const btnDownload = document.getElementById('btnDownloadDocx');
  
  if (btnDownload) {
    btnDownload.addEventListener('click', generateDOCX);
  }
}

/**
 * Executes html2pdf to convert the report container into a downloadable PDF document.
 */
function generatePDF() {
  const element = document.getElementById('printableReport');
  
  const opt = {
    margin:       [10, 10, 10, 10], 
    filename:     'Test_Report_RPT-2026-0078.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const originalBtnContent = document.getElementById('btnDownloadPdf').innerHTML;
  document.getElementById('btnDownloadPdf').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
  
  html2pdf().set(opt).from(element).save().then(() => {
    document.getElementById('btnDownloadPdf').innerHTML = originalBtnContent;
  }).catch(error => {
    console.error("PDF Generation failed:", error);
    alert("An error occurred while generating the PDF. Please try again.");
    document.getElementById('btnDownloadPdf').innerHTML = originalBtnContent;
  });
}

/**
 * Executes html-docx to convert the report container into a downloadable DOCX document.
 */
function generateDOCX() {
  const element = document.getElementById('printableReport');
  const originalBtnContent = document.getElementById('btnDownloadDocx').innerHTML;
  
  if (typeof htmlDocx === 'undefined') {
      alert("DOCX export library is still loading. Please try again in a moment.");
      return;
  }

  document.getElementById('btnDownloadDocx').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

  try {
    // Clone the element to manipulate it for word export without affecting the UI
    const clone = element.cloneNode(true);
    
    // Convert the HTML content to a DOCX Blob
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Test Report</title>
        </head>
        <body>
          ${clone.innerHTML}
        </body>
      </html>
    `;

    const converted = htmlDocx.asBlob(content);

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = 'Test_Report_RPT-2026-0078.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    document.getElementById('btnDownloadDocx').innerHTML = originalBtnContent;
  } catch (error) {
    console.error("DOCX Generation failed:", error);
    alert("An error occurred while generating the DOCX. Please try again.");
    document.getElementById('btnDownloadDocx').innerHTML = originalBtnContent;
  }
}