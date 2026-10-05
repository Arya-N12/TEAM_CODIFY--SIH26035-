const mockQueueData = [
  { appNo: 'APP-2026-081', mfg: 'Precision Instruments Ltd', model: 'PI-500', class: 'III', maxMin: '500kg / 4kg', ed: '100g / 10g', tech: 'Jane Smith', result: 'FAIL', flags: ['OCR', 'Anomaly'], status: 'Ready for Review' },
  { appNo: 'APP-2026-082', mfg: 'Apex Weigh Systems', model: 'AWS-3000', class: 'III', maxMin: '3000kg / 20kg', ed: '1kg / 1kg', tech: 'John Doe', result: 'PASS', flags: [], status: 'Under Review' },
  { appNo: 'APP-2026-083', mfg: 'Metro Scale Technologies', model: 'MST-200', class: 'II', maxMin: '200g / 2g', ed: '10mg / 1mg', tech: 'Alice Wong', result: 'PASS', flags: ['Evidence'], status: 'Needs Correction' },
  { appNo: 'APP-2026-084', mfg: 'Global Scales', model: 'GS-50', class: 'III', maxMin: '50kg / 400g', ed: '10g / 10g', tech: 'Jane Smith', result: 'PASS', flags: [], status: 'Ready for Review' },
  { appNo: 'APP-2026-085', mfg: 'Precision Instruments Ltd', model: 'PI-100', class: 'III', maxMin: '100kg / 1kg', ed: '50g / 50g', tech: 'Mike Ross', result: 'FAIL', flags: ['Anomaly'], status: 'Ready for Review' }
];

document.addEventListener('DOMContentLoaded', () => {
  populateDashboardQueue();
});

function populateDashboardQueue() {
  const tbody = document.getElementById('dashboardQueueTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  // Show top 3 for dashboard
  mockQueueData.slice(0, 3).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${row.appNo}</td>
      <td>${row.model}</td>
      <td>${row.class}</td>
      <td>${getBadgeHtml(row.result, 'result')}</td>
      <td>${getFlagsHtml(row.flags)}</td>
      <td>${getBadgeHtml(row.status, 'status')}</td>
      <td><button class="btn-action-small text-blue" onclick="window.location.href='review-workspace.html?appNo=${row.appNo}'">Open Review</button></td>
    `;
    tbody.appendChild(tr);
  });
}
