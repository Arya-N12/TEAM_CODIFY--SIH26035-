const mockRepoData = [
  { model: 'PI-500', mfg: 'Precision Instruments Ltd', class: 'III', tests: 45, anomaly: '2.1%', date: '01 Oct 2026' },
  { model: 'AWS-3000', mfg: 'Apex Weigh Systems', class: 'III', tests: 12, anomaly: '0.0%', date: '15 Sep 2026' },
  { model: 'MST-200', mfg: 'Metro Scale Technologies', class: 'II', tests: 8, anomaly: '12.5%', date: '27 Sep 2026' }
];

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('repoTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  mockRepoData.forEach(row => {
    const isHigh = parseFloat(row.anomaly) > 10;
    const anomalyStyle = isHigh ? 'color: var(--color-red); font-weight: bold;' : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${row.model}</td>
      <td>${row.mfg}</td>
      <td>${row.class}</td>
      <td>${row.tests}</td>
      <td style="${anomalyStyle}">${row.anomaly}</td>
      <td>${row.date}</td>
      <td><button class="btn-outline" style="padding:4px 8px; font-size:0.8rem;">History</button></td>
    `;
    tbody.appendChild(tr);
  });
});
