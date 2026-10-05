const mockApprovalsData = [
  { appNo: 'APP-2026-070', mfg: 'Precision Instruments Ltd - PI-500', date: '01 Oct 2026', evaluator: 'Michael Reviewer', result: 'Approved', remarks: 'All MPEs met. Nameplate verified.' },
  { appNo: 'APP-2026-068', mfg: 'Apex Weigh Systems - AWS-3000', date: '29 Sep 2026', evaluator: 'Michael Reviewer', result: 'Returned', remarks: 'Missing eccentricity test photos.' },
  { appNo: 'APP-2026-065', mfg: 'Global Scales - GS-50', date: '28 Sep 2026', evaluator: 'Sarah Connor', result: 'Approved', remarks: 'Passed all tests.' },
  { appNo: 'APP-2026-064', mfg: 'Metro Scale Technologies - MST-200', date: '27 Sep 2026', evaluator: 'Michael Reviewer', result: 'Rejected', remarks: 'Critical failure in temperature effect test. Does not meet Class II requirements.' }
];

document.addEventListener('DOMContentLoaded', () => {
  populateApprovals(mockApprovalsData);
});

function populateApprovals(data) {
  const tbody = document.getElementById('approvalsTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${row.appNo}</td>
      <td>${row.mfg}</td>
      <td>${row.date}</td>
      <td>${row.evaluator}</td>
      <td>${getBadgeHtml(row.result, 'status')}</td>
      <td class="text-sm text-muted">${row.remarks}</td>
      <td><button class="btn-outline" style="padding:4px 8px; font-size:0.8rem;">Details</button></td>
    `;
    tbody.appendChild(tr);
  });
}
