// Shared Javascript for Metrology Evaluator

document.addEventListener('DOMContentLoaded', () => {
  // Assistant Toggle
  const assistantBtn = document.getElementById('assistantBtn');
  const closeAssistantBtn = document.getElementById('closeAssistantBtn');
  const assistantPanel = document.getElementById('assistantPanel');

  if (assistantBtn && assistantPanel) {
    assistantBtn.addEventListener('click', (e) => {
      e.preventDefault();
      assistantPanel.hidden = !assistantPanel.hidden;
    });
  }
  if (closeAssistantBtn && assistantPanel) {
    closeAssistantBtn.addEventListener('click', () => {
      assistantPanel.hidden = true;
    });
  }
  
  // Assistant Input Enter key
  const assistantInput = document.getElementById('assistantInput');
  if(assistantInput) {
    assistantInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAssistantMessage();
      }
    });
  }
});

// Modal Logic
function confirmAction(actionType) {
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const btn = document.getElementById('modalConfirmBtn');
  
  if(!modal) return;

  if (actionType === 'return') {
    title.textContent = 'Return for Correction';
    body.textContent = 'Are you sure you want to return this submission to the technician? A correction notification will be sent.';
    btn.style.background = '#f59e0b';
    btn.textContent = 'Return';
  } else if (actionType === 'reject') {
    title.textContent = 'Reject Submission';
    body.textContent = 'Are you sure you want to completely reject this submission? This action cannot be easily reversed.';
    btn.style.background = '#dc2626';
    btn.textContent = 'Reject';
  } else if (actionType === 'approve') {
    title.textContent = 'Approve Report';
    body.textContent = 'Are you sure you want to approve this report?';
    btn.style.background = '#10b981';
    btn.textContent = 'Approve';
  }
  
  btn.onclick = () => {
    closeModal();
    alert(`Action "${title.textContent}" executed successfully.`);
    if(window.location.href.includes("review-workspace")) {
      window.location.href = "dashboard.html";
    }
  };
  
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('confirmModal');
  if(modal) modal.style.display = 'none';
}

// Assistant Logic
function sendAssistantMessage() {
  const input = document.getElementById('assistantInput');
  const text = input.value.trim();
  if(!text) return;
  
  const container = document.getElementById('chatbotMessages');
  
  // User msg
  const userDiv = document.createElement('div');
  userDiv.className = 'chatbot-message user';
  userDiv.textContent = text;
  container.appendChild(userDiv);
  
  input.value = '';
  container.scrollTop = container.scrollHeight;
  
  // Simulate Bot
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'chatbot-message bot';
    botDiv.innerHTML = `I have received your query regarding "${text}". Based on OIML R-76 guidelines, you should review the test observation details and verify if the MPE limits have been correctly applied. <span class="chatbot-source">Source: Contextual Knowledge Base</span>`;
    container.appendChild(botDiv);
    container.scrollTop = container.scrollHeight;
  }, 800);
}

// Shared Badge Logic
function getBadgeHtml(status, type) {
  if (type === 'result') {
    return status === 'PASS' ? '<span class="badge badge-pass">PASS</span>' : '<span class="badge badge-fail">FAIL</span>';
  }
  if (type === 'status') {
    if (status === 'Ready for Review') return '<span class="badge badge-awaiting">Ready for Review</span>';
    if (status === 'Under Review') return '<span class="badge badge-in-progress">Under Review</span>';
    if (status === 'Needs Correction' || status === 'Returned') return '<span class="badge" style="background:#fee2e2; color:#dc2626">' + status + '</span>';
    if (status === 'Approved') return '<span class="badge badge-pass">Approved</span>';
    if (status === 'Rejected') return '<span class="badge badge-fail">Rejected</span>';
  }
  return `<span class="badge">${status}</span>`;
}

function getFlagsHtml(flags) {
  if (!flags || flags.length === 0) return '<span class="text-muted">-</span>';
  return flags.map(f => {
    if (f === 'OCR') return '<i class="fa-solid fa-file-contract text-amber" title="OCR Mismatch"></i>';
    if (f === 'Anomaly') return '<i class="fa-solid fa-robot text-purple" title="Anomaly"></i>';
    if (f === 'Evidence') return '<i class="fa-regular fa-file-excel text-red" title="Missing Evidence"></i>';
    return '';
  }).join(' ');
}
