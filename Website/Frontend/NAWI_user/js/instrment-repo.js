/**
 * NAWI Test Management — Repository Controller
 * Handles instrument data rendering, searching/filtering, detail drawer toggling, and chatbot.
 */

const REPO_DATA = [
  { id: "NAWI-001", model: "EPS-500", type: "Electronic Platform Scale", mfr: "ABC WeighTech", class: "III", max: "500 kg", e: "100 g", status: "Verified", date: "24 Sep 2026" },
  { id: "NAWI-002", model: "DWS-30", type: "Digital Weighing Scale", mfr: "Precision Instruments", class: "III", max: "30 kg", e: "10 g", status: "Under Testing", date: "28 Sep 2026" },
  { id: "NAWI-003", model: "EB-6000", type: "Electronic Balance", mfr: "Metro Weigh Systems", class: "II", max: "6 kg", e: "1 g", status: "Verified", date: "18 Sep 2026" },
  { id: "NAWI-004", model: "PWI-1500", type: "Platform Weighing Instrument", mfr: "Accurate Scales Ltd.", class: "III", max: "1500 kg", e: "500 g", status: "Pending", date: "—" },
  { id: "NAWI-005", model: "WB-60T", type: "Weighbridge", mfr: "National Weighing Systems", class: "III", max: "60 t", e: "20 kg", status: "Verified", date: "10 Sep 2026" },
];

let CURRENT_TABLE_DATA = REPO_DATA;

document.addEventListener('DOMContentLoaded', () => {
  renderTable(REPO_DATA);
  initSearchAndFilter();
  initDrawerLogic();

  initQRModalLogic();
  initExportLogic();

  // EVENT DELEGATION: Listen for clicks on the table body
  const tbody = document.getElementById('instrumentTableBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      // Check if the clicked element is a QR Code button
      const qrBtn = e.target.closest('.qr-btn');
      if (qrBtn) {
        const instId = qrBtn.getAttribute('data-id');
        window.openQRModal(instId);
      }

      // Check if the clicked element is a View Details button
      const viewBtn = e.target.closest('.view-btn');
      if (viewBtn) {
        const instId = viewBtn.getAttribute('data-id');
        window.openDrawer(instId);
      }
    });
  }
});

// Render Table (Updated with Bulletproof inline onclick handlers)
// Render Table (Updated with Event Delegation)
function renderTable(data) {
  const tbody = document.getElementById('instrumentTableBody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center p-4 text-muted">No instruments found matching criteria.</td></tr>`;
    return;
  }

  data.forEach(inst => {
    let badgeClass = 'badge-pending';
    if (inst.status === 'Verified') badgeClass = 'badge-pass';
    if (inst.status === 'Under Testing') badgeClass = 'badge-testing';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono font-medium text-blue">${inst.id}</td>
      <td><strong>${inst.type}</strong><br><span class="text-sm text-muted">${inst.model}</span></td>
      <td>${inst.mfr}</td>
      <td>${inst.class}</td>
      <td>${inst.max}</td>
      <td>${inst.e}</td>
      <td><span class="badge ${badgeClass}">${inst.status}</span></td>
      <td class="text-muted">${inst.date}</td>
      
      <!-- Bulletproof inline onclick for QR and View Details -->
      <td>
        <button type="button" class="btn-secondary qr-btn" data-id="${inst.id}" title="Generate QR Sticker" style="padding: 4px 10px; font-size: 0.8rem; cursor: pointer; position: relative; z-index: 2;">
          <i class="fa-solid fa-qrcode" style="margin-right: 4px;"></i> QR Code
        </button>
      </td>
      
      <td class="text-right">
        <button type="button" class="btn-link view-btn" data-id="${inst.id}" title="View Instrument Details" style="cursor: pointer; position: relative; z-index: 2;">
          View Details
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}





// Search and Filter Logic
function initSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const filterType = document.getElementById('filterType');
  const filterClass = document.getElementById('filterClass');
  const filterStatus = document.getElementById('filterStatus');

  const applyFilters = () => {
    const term = searchInput.value.toLowerCase();
    const type = filterType.value;
    const cls = filterClass.value;
    const stat = filterStatus.value;

    CURRENT_TABLE_DATA = REPO_DATA.filter(inst => {
      const matchSearch = inst.id.toLowerCase().includes(term) || inst.model.toLowerCase().includes(term) || inst.mfr.toLowerCase().includes(term);
      const matchType = type === 'All' || inst.type.includes(type);
      const matchClass = cls === 'All' || inst.class === cls;
      const matchStatus = stat === 'All' || inst.status === stat;
      return matchSearch && matchType && matchClass && matchStatus;
    });

    renderTable(CURRENT_TABLE_DATA);
  };

  searchInput.addEventListener('input', applyFilters);
  filterType.addEventListener('change', applyFilters);
  filterClass.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);
}

// Excel Export Logic
function initExportLogic() {
  const exportBtn = document.getElementById('btnExportData');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    if (typeof XLSX === 'undefined') {
      alert("Excel export library is still loading. Please try again in a moment.");
      return;
    }

    const formattedData = CURRENT_TABLE_DATA.map(inst => ({
      "Instrument ID": inst.id,
      "Instrument Type": inst.type,
      "Model": inst.model,
      "Manufacturer": inst.mfr,
      "Accuracy Class": `Class ${inst.class}`,
      "Max Capacity": inst.max,
      "Scale Interval (e)": inst.e,
      "Status": inst.status,
      "Last Tested Date": inst.date
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Instruments");
    XLSX.writeFile(workbook, `NAWI_Repository_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  });
}

// Drawer Logic
function initDrawerLogic() {
  const backdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('detailsDrawer');
  const closeBtn = document.getElementById('btnCloseDrawer');

  if (!backdrop || !drawer) return;

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('show');
  };

  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
}

// Globally accessible Drawer Function
window.openDrawer = function (id) {
  const inst = REPO_DATA.find(i => i.id === id);
  if (!inst) return;

  const backdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('detailsDrawer');

  document.getElementById('drawerInstId').textContent = inst.id;
  document.getElementById('drawerModelTitle').textContent = `${inst.type} — ${inst.model}`;
  document.getElementById('drawerMfr').textContent = inst.mfr;
  document.getElementById('drawerClass').textContent = `Class ${inst.class}`;
  document.getElementById('drawerCap').textContent = `${inst.max} / (varies)`;
  document.getElementById('drawerInt').textContent = `${inst.e} / ${inst.e}`;

  const badge = document.getElementById('drawerStatusBadge');
  badge.textContent = inst.status;
  badge.className = 'drawer-badge';
  if (inst.status === 'Verified') badge.classList.add('badge-pass');
  else if (inst.status === 'Under Testing') badge.classList.add('testing');
  else badge.classList.add('pending');

  drawer.classList.add('open');
  backdrop.classList.add('show');
};



// QR Modal Initialization
function initQRModalLogic() {
  const backdrop = document.getElementById('qrModalBackdrop');
  const modal = document.getElementById('qrModal');
  const closeBtn = document.getElementById('btnCloseQrModal');
  const labelCard = document.getElementById('qrLabelCard');
  const downloadBtn = document.getElementById('btnDownloadQr');
  const printBtn = document.getElementById('btnPrintQr');

  if (!backdrop || !modal || !labelCard) return;

  const toggleBtns = modal.querySelectorAll('.toggle-btn');
  const labelFormats = {
    'layout-square': { widthMm: 50, heightMm: 50, widthPx: 250 },
    'layout-classic': { widthMm: 80, heightMm: 50, widthPx: 400 },
    'layout-wide': { widthMm: 120, heightMm: 50, widthPx: 600 },
    'layout-large': { widthMm: 100, heightMm: 70, widthPx: 500 },
    'layout-slim': { widthMm: 100, heightMm: 35, widthPx: 500 }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    backdrop.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
      const selectedBtn = event.currentTarget;
      const layoutClass = selectedBtn.getAttribute('data-format');
      if (!layoutClass || !labelFormats[layoutClass]) return;

      toggleBtns.forEach(button => {
        const isActive = button === selectedBtn;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      labelCard.className = `qr-label-card ${layoutClass}`;
    });
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const qrCard = document.getElementById('qrLabelCard');
      const idElement = document.getElementById('qrInstIdVal');

      if (!qrCard || !idElement) return;

      const instId = idElement.textContent;

      if (typeof html2canvas === 'undefined') {
        alert("Image generation library is still loading. Please try again.");
        return;
      }

      // Convert sticker DOM to image
      html2canvas(qrCard, { scale: 3, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR_Sticker_${instId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(err => {
        console.error("Error generating sticker image:", err);
        alert("Failed to generate sticker. Check console.");
      });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const qrCard = document.getElementById('qrLabelCard');
      const activeToggle = modal.querySelector('.toggle-btn.active');
      if (!qrCard || !activeToggle) return;

      const layoutSize = activeToggle.getAttribute('data-format');
      const format = labelFormats[layoutSize];
      if (!format) return;

      const width = `${format.widthMm}mm`;
      const height = `${format.heightMm}mm`;
      const mmToPx = 3.779527559;
      const scale = (format.widthMm * mmToPx) / format.widthPx;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Popup blocked! Please allow popups for this site to print.");
        return;
      }

      let styles = '';
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href) styles += `<link rel="stylesheet" href="${link.href}">\n`;
      });
      document.querySelectorAll('style').forEach(style => {
        styles += `<style>${style.innerHTML}</style>\n`;
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Sticker</title>
          ${styles}
          <style>
            @page { margin: 0; size: ${width} ${height}; }
            body, html { margin: 0; padding: 0; width: ${width}; height: ${height}; display: flex; justify-content: center; align-items: center; background: #fff; overflow: hidden; }
            .print-container {
               transform: scale(${scale});
               transform-origin: top left;
               width: auto;
               height: auto;
            }
            .qr-label-card { margin: 0 !important; box-shadow: none !important; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${qrCard.outerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 600);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }
}

// Globally accessible QR Modal Function
window.openQRModal = function (id) {
  const inst = REPO_DATA.find(i => i.id === id);
  if (!inst) {
    console.error("Could not find instrument ID:", id);
    alert("Could not load data for this instrument.");
    return;
  }

  const backdrop = document.getElementById('qrModalBackdrop');
  const modal = document.getElementById('qrModal');
  const qrImageElement = document.getElementById('qrImageElement');

  if (!backdrop || !modal || !qrImageElement) {
    alert("System Error: The QR Code window structure is missing from the HTML document.");
    return;
  }

  try {
    document.getElementById('qrInstModelTitle').textContent = `${inst.type} — ${inst.model}`;
    document.getElementById('qrInstMfrTitle').textContent = inst.mfr;
    document.getElementById('qrInstIdVal').textContent = inst.id;
    document.getElementById('qrInstStatusVal').textContent = inst.status;
    document.getElementById('qrInstDateVal').textContent = inst.date !== '—' ? inst.date : 'N/A';

    const footerStatus = document.getElementById('qrFooterStatus');
    if (footerStatus) {
      if (inst.status === 'Verified') {
        footerStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> VERIFIED (PASS)';
        footerStatus.className = 'text-green font-medium';
      } else if (inst.status === 'Under Testing') {
        footerStatus.innerHTML = '<i class="fa-solid fa-spinner"></i> UNDER TESTING';
        footerStatus.className = 'text-blue font-medium';
      } else {
        footerStatus.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> PENDING / FAILED';
        footerStatus.className = 'text-amber font-medium';
      }
    }

    // Reset layout toggle to Classic
    const toggleBtns = document.querySelectorAll('#qrModal .toggle-btn');
    if (toggleBtns.length > 0) {
      toggleBtns.forEach(button => {
        const isDefault = button.getAttribute('data-format') === 'layout-classic';
        button.classList.toggle('active', isDefault);
        button.setAttribute('aria-pressed', String(isDefault));
      });
      const labelCard = document.getElementById('qrLabelCard');
      if (labelCard) labelCard.className = 'qr-label-card layout-classic';
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('qrInstIdMini').textContent = `ID: ${inst.id}-REF-${randomSuffix}`;
    const verificationUrl = `https://nawi-system.local/verify/${inst.id}`;

    // Clear previous QR code
    qrImageElement.innerHTML = '';

    // Generate QR Code using the QRCode library
    QRCode.toCanvas(qrImageElement, verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function (error) {
      if (error) {
        console.error('Error generating QR code:', error);
        alert("Error generating QR code. Check console for details.");
      }
    });

    backdrop.classList.add('show');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  } catch (error) {
    console.error("Error setting modal data:", error);
    alert("System Error: Check console for missing HTML elements.");
  }
};