/**
 * NAWI Test Management — New Test Registration & Preparation Script
 * Handles automated calculations, smart test determination, validation, and transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveCalculations();
  initChecklistValidation();
  initCopyApplicantLogic();
  initActionHandlers();
});

/**
 * 1. Live Metrological Calculations (n = Max / e)
 */
function initLiveCalculations() {
  const maxInput = document.getElementById('specMax');
  const eInput = document.getElementById('specE');
  const nInput = document.getElementById('specN');

  function calculateN() {
    const maxVal = parseFloat(maxInput.value);
    const eVal = parseFloat(eInput.value);
    if (!isNaN(maxVal) && !isNaN(eVal) && eVal > 0) {
      nInput.value = Math.round(maxVal / eVal);
    } else {
      nInput.value = '—';
    }
  }

  if (maxInput && eInput) {
    maxInput.addEventListener('input', calculateN);
    eInput.addEventListener('input', calculateN);
  }
}

/**
 * 2. Copy Applicant to Manufacturer checkbox
 */
function initCopyApplicantLogic() {
  const chkSame = document.getElementById('sameAsApplicant');
  if (!chkSame) return;

  chkSame.addEventListener('change', () => {
    if (chkSame.checked) {
      document.getElementById('mfrName').value = document.getElementById('appName').value;
      document.getElementById('mfrCountry').value = document.getElementById('appCountry').value;
      document.getElementById('mfrAddress').value = document.getElementById('appAddress').value;
    }
  });
}

/**
 * 3. Smart Test Determination based on characteristics
 */
var btnDetermine = document.getElementById('btnDetermineTests');
if (btnDetermine) {
  btnDetermine.addEventListener('click', () => {
    const instClass = document.getElementById('specClass').value;
    const model = document.getElementById('instModel').value || 'Instrument';

    btnDetermine.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

    setTimeout(() => {
      btnDetermine.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Determine Applicable Tests';
      showToast(`12 tests compiled for ${model} under ${instClass}`);

      const statusBox = document.getElementById('scopeStatusBar');
      if (statusBox) {
        statusBox.style.borderColor = '#10b981';
        statusBox.style.backgroundColor = '#ecfdf5';
      }
    }, 500);
  });
}

/**
 * 4. Environmental Range Validation
 * Reference conditions: Temp 20 - 26 °C, RH 30 - 70 %
 */
function validateEnvironment() {
  const tempInput = document.getElementById('envTemp');
  const rhInput = document.getElementById('envRH');
  const statusBox = document.getElementById('envStatusBox');

  const temp = parseFloat(tempInput.value);
  const rh = parseFloat(rhInput.value);

  const isTempValid = !isNaN(temp) && temp >= 20.0 && temp <= 26.0;
  const isRhValid = !isNaN(rh) && rh >= 30 && rh <= 70;

  if (isTempValid && isRhValid) {
    statusBox.className = 'env-status-banner status-valid';
    statusBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Conditions Recorded &amp; Valid';
  } else {
    statusBox.className = 'env-status-banner status-warning';
    statusBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Check Conditions (Outside 20-26°C or 30-70%)';
  }
}

/**
 * 5. Checklist Verification: Enable / Disable "Start Evaluation"
 */
function validateChecklist() {
  const checkboxes = document.querySelectorAll('.checklist-grid input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(chk => chk.checked);

  const topBtn = document.getElementById('topBtnStartEvaluation');
  const bottomBtn = document.getElementById('bottomBtnStartEvaluation');

  if (topBtn) topBtn.disabled = !allChecked;
  if (bottomBtn) bottomBtn.disabled = !allChecked;
}

function initChecklistValidation() {
  validateChecklist();
}

/**
 * 6. Photo Upload Preview Helpers
 */
function triggerPhotoUpload(type) {
  const fileInput = document.getElementById('photo' + type.charAt(0).toUpperCase() + type.slice(1));
  if (fileInput) fileInput.click();
}

function handlePhotoUpload(input, previewId, labelText) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.getElementById(previewId);
      container.innerHTML = `
        <img src="${e.target.result}" class="photo-preview-img" alt="${labelText}">
      `;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

/**
 * 7. Document Upload & Management
 */
function triggerDocUpload() {
  document.getElementById('docFileInput').click();
}

function handleDocFiles(input) {
  if (!input.files || input.files.length === 0) return;

  const tbody = document.getElementById('docTableBody');
  const today = '29 Sep 2026';

  for (let file of input.files) {
    const tr = document.createElement('tr');
    const sizeKb = (file.size / 1024).toFixed(0);
    const sizeStr = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';

    tr.innerHTML = `
      <td><i class="fa-regular fa-file-pdf text-blue"></i> <strong>${file.name}</strong></td>
      <td>Applicant Upload</td>
      <td>${today}</td>
      <td>${sizeStr}</td>
      <td><span class="badge badge-pass"><i class="fa-solid fa-check"></i> Ready</span></td>
      <td style="text-align: right;">
        <button class="doc-icon-btn" title="Preview" onclick="viewDoc('${file.name}')"><i class="fa-regular fa-eye"></i></button>
        <button class="doc-icon-btn delete-btn" title="Delete" onclick="deleteDocRow(this)"><i class="fa-regular fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  showToast(`${input.files.length} document(s) uploaded successfully`);
  input.value = '';
}

function deleteDocRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    showToast('Document removed');
  }
}

function viewDoc(name) {
  alert(`Viewing document: ${name}`);
}

/**
 * 8. Modal & Lifecycle State Transitions (Draft → In Progress)
 */
function initActionHandlers() {
  const modal = document.getElementById('confirmationModal');
  const btnCancel = document.getElementById('btnCancelModal');
  const btnConfirm = document.getElementById('btnConfirmStart');

  const topStart = document.getElementById('topBtnStartEvaluation');
  const bottomStart = document.getElementById('bottomBtnStartEvaluation');

  function openConfirmation() {
    // Populate summary dialog
    document.getElementById('modalTestId').textContent = document.getElementById('regTestId').value;
    document.getElementById('modalInstrument').textContent = `${document.getElementById('instModel').value} (${document.getElementById('specClass').value})`;
    document.getElementById('modalManufacturer').textContent = document.getElementById('mfrName').value;

    modal.classList.add('show');
  }

  if (topStart) topStart.addEventListener('click', openConfirmation);
  if (bottomStart) bottomStart.addEventListener('click', openConfirmation);

  if (btnCancel) {
    btnCancel.addEventListener('click', () => modal.classList.remove('show'));
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      modal.classList.remove('show');

      // Update record to In Progress
      const headerBadge = document.getElementById('headerStatusBadge');
      if (headerBadge) {
        headerBadge.textContent = 'In Progress';
        headerBadge.style.backgroundColor = '#dbeafe';
        headerBadge.style.color = '#1e40af';
        headerBadge.style.borderColor = '#93c5fd';
      }

      showToast('Record NAWI-2026-015 moved to In Progress. Launching Test Evaluation...');

      setTimeout(() => {
        // Redirects to Test Evaluation page where calculation tables reside
        alert('Navigating to Test Evaluation module (Observation tables & Permissible Error checks)...');
      }, 1000);
    });
  }

  // Save Draft buttons
  const saveDraft = () => {
    showToast('Record saved as Draft (NAWI-2026-015)');
  };

  const topSave = document.getElementById('topBtnSaveDraft');
  const bottomSave = document.getElementById('bottomBtnSaveDraft');
  if (topSave) topSave.addEventListener('click', saveDraft);
  if (bottomSave) bottomSave.addEventListener('click', saveDraft);
}

/**
 * Toast Notification Utility
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}