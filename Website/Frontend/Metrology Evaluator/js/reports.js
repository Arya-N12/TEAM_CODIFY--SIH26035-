const mockReportsData = [
  { id: 'REP-2026-901', appNo: 'APP-2026-070', date: '01 Oct 2026', status: 'Generated' },
  { id: 'REP-2026-890', appNo: 'APP-2026-065', date: '28 Sep 2026', status: 'Generated' },
  { id: 'REP-2026-885', appNo: 'APP-2026-060', date: '25 Sep 2026', status: 'Verified' }
];

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('reportsTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  mockReportsData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${row.id}</td>
      <td>${row.appNo}</td>
      <td>${row.date}</td>
      <td>${getBadgeHtml(row.status === 'Verified' ? 'Approved' : 'Ready for Review', 'status')}</td>
      <td>
        <div class="output-icons-wrapper">
          <i class="fa-solid fa-file-pdf text-red output-icon" title="PDF"></i>
          <i class="fa-solid fa-file-word text-blue output-icon" title="DOCX"></i>
          <i class="fa-solid fa-file-code text-amber output-icon" title="JSON"></i>
          <i class="fa-solid fa-code text-purple output-icon" title="XML"></i>
        </div>
      </td>
      <td><button class="btn-outline" style="padding:4px 8px; font-size:0.8rem;">Preview</button></td>
    `;
    tbody.appendChild(tr);
  });
});
