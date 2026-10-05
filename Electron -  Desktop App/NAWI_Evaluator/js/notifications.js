const mockNotifications = [
  { type: 'ocr', title: 'OCR Mismatch Detected', desc: 'APP-2026-081: Max capacity manual entry differs from nameplate.', time: '10 mins ago' },
  { type: 'anomaly', title: 'Measurement Anomaly', desc: 'APP-2026-079: Unusual error pattern detected in Eccentricity test.', time: '2 hours ago' },
  { type: 'missing', title: 'Missing Evidence', desc: 'APP-2026-075: Test observation photographs not uploaded.', time: '1 day ago' },
  { type: 'info', title: 'System Update', desc: 'OIML R-76 rules engine updated to v2006.1.2.', time: '3 days ago' }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('notificationsList');
  if(!container) return;
  container.innerHTML = '';
  
  mockNotifications.forEach(n => {
    let icon = '', cssClass = '';
    
    // Map categories to visual alerts
    if(n.type === 'ocr') { icon = 'fa-triangle-exclamation'; cssClass = 'ocr-alert'; }
    if(n.type === 'anomaly') { icon = 'fa-robot'; cssClass = 'anomaly-alert'; }
    if(n.type === 'missing') { icon = 'fa-file-excel'; cssClass = 'missing-alert'; }
    if(n.type === 'info') { icon = 'fa-circle-info'; cssClass = 'info-alert'; }

    // Isolate Application ID from description for better structural hierarchy
    const match = n.desc.match(/^(APP-\d{4}-\d{3}):\s*(.*)$/);
    let appIdHtml = '';
    let descriptionText = n.desc;
    
    if (match) {
        appIdHtml = `<span class="app-id-badge">${match[1]}</span>`;
        descriptionText = match[2];
    }

    const div = document.createElement('div');
    div.className = `alert-item ${cssClass}`;
    div.innerHTML = `
      <div class="alert-icon-wrapper">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div class="alert-content">
        <div class="alert-header">
          <div class="alert-title">${n.title}</div>
          <div class="alert-time"><i class="fa-regular fa-clock"></i> ${n.time}</div>
        </div>
        <div class="alert-body">
          ${appIdHtml}
          <span class="alert-desc">${descriptionText}</span>
        </div>
      </div>
    `;
    
    container.appendChild(div);
  });
});