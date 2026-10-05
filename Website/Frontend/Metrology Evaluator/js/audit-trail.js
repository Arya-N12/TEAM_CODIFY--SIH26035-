const mockAuditTrail = [
  { time: '2026-10-02 14:35:12', user: 'Michael Reviewer', role: 'Senior Evaluator', action: 'Approved Submission', target: 'APP-2026-070', ip: '192.168.1.45' },
  { time: '2026-10-02 12:10:05', user: 'System', role: 'System Engine', action: 'Generated Report', target: 'REP-2026-901', ip: 'internal' },
  { time: '2026-10-02 08:15:33', user: 'Michael Reviewer', role: 'Senior Evaluator', action: 'Logged In', target: 'Auth System', ip: '192.168.1.45' },
  { time: '2026-10-01 16:45:21', user: 'Michael Reviewer', role: 'Senior Evaluator', action: 'Returned Submission', target: 'APP-2026-068', ip: '192.168.1.45' },
  { time: '2026-10-01 11:20:00', user: 'Jane Smith', role: 'Technician', action: 'Uploaded Evidence', target: 'IMG_Setup_01.jpg', ip: '10.0.4.12' }
];

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('auditTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  mockAuditTrail.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-xs font-bold text-muted">${row.time}</td>
      <td>${row.user}</td>
      <td class="text-sm">${row.role}</td>
      <td>${row.action}</td>
      <td class="font-bold text-blue">${row.target}</td>
      <td class="text-xs text-muted">${row.ip}</td>
    `;
    tbody.appendChild(tr);
  });
});
