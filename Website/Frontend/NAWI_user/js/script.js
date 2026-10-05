/**
 * NAWI Test Management Dashboard JavaScript
 * Chart.js Initializations & Event Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  initTestingActivityChart();
  initTestStatusChart();
  initComplianceOverviewChart();
  bindInteractiveEvents();
  updateDashboardChartLabels();
  document.addEventListener('nawi:languageChanged', updateDashboardChartLabels);
});

/**
 * 1. Testing Activity Line Chart (Jan - Jun)
 * Added layout padding to ensure x/y labels and endpoints never touch or spill past edges
 */
function initTestingActivityChart() {
  const ctx = document.getElementById('testingActivityChart');
  if (!ctx) return;

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const dataPoints = [10, 14, 18, 13, 17, 24];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Evaluations',
          data: dataPoints,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 4,
          right: 12,
          top: 8,
          bottom: 4
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 12, family: 'Plus Jakarta Sans' },
          bodyFont: { size: 12, family: 'Plus Jakarta Sans' },
          padding: 8,
          displayColors: false
        }
      },
      scales: {
        y: {
          min: 0,
          max: 40,
          ticks: {
            stepSize: 10,
            font: { size: 11, family: 'Plus Jakarta Sans' },
            color: '#64748b'
          },
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: {
            font: { size: 11, family: 'Plus Jakarta Sans' },
            color: '#64748b'
          },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * 2. Test Status Donut Chart
 */
function initTestStatusChart() {
  const ctx = document.getElementById('testStatusChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Awaiting Review', 'Draft'],
      datasets: [
        {
          data: [86, 12, 8, 4],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#a855f7'],
          borderWidth: 2.5,
          borderColor: '#ffffff',
          hoverOffset: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 8,
          bodyFont: { size: 12, family: 'Plus Jakarta Sans' }
        }
      }
    }
  });
}

/**
 * 3. Compliance Overview Bar Chart
 * Configured multi-line / rotated labels and padding to prevent overflowing
 */
function initComplianceOverviewChart() {
  const ctx = document.getElementById('complianceChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      // Wrapped 'Under Evaluation' into two lines for compact fit
      labels: ['Passed', 'Failed', ['Under', 'Evaluation']],
      datasets: [
        {
          data: [22, 9, 19],
          backgroundColor: [
            '#10b981',
            '#ef4444',
            '#f59e0b'
          ],
          borderRadius: 6,
          barThickness: 24,
          maxBarThickness: 32
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 4,
          right: 8,
          top: 10,
          bottom: 2
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          bodyFont: { size: 12, family: 'Plus Jakarta Sans' },
          padding: 8,
          callbacks: {
            title: function(items) {
              const raw = items[0].label;
              return Array.isArray(raw) ? raw.join(' ') : raw;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 11, family: 'Plus Jakarta Sans' },
            color: '#64748b'
          },
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: {
            autoSkip: false,
            font: { size: 10.5, family: 'Plus Jakarta Sans', weight: '600' },
            color: '#64748b'
          },
          grid: { display: false }
        }
      }
    }
  });
}

function updateDashboardChartLabels() {
  if (!window.Chart || !window.i18next) return;

  const labelsByChart = {
    testStatusChart: ['Completed', 'In Progress', 'Awaiting Review', 'Draft'],
    complianceChart: ['Passed', 'Failed', ['Under', 'Evaluation']]
  };

  Object.entries(labelsByChart).forEach(([canvasId, labels]) => {
    const chart = Chart.getChart(canvasId);
    if (!chart) return;
    chart.data.labels = labels.map((label) => Array.isArray(label)
      ? label.map((part) => i18next.t(part))
      : i18next.t(label));
    chart.update();
  });

  const activityChart = Chart.getChart('testingActivityChart');
  if (activityChart) {
    activityChart.data.datasets[0].label = i18next.t('Evaluations');
    activityChart.update();
  }
}

/**
 * Interactive button click handlers
 */
function bindInteractiveEvents() {
  const btnStart = document.getElementById('btnStartNewTest');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      alert('Start New Test wizard initiated.');
    });
  }

  // Quick action tiles click feedback
  document.querySelectorAll('.action-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const label = tile.querySelector('h4')?.textContent || 'Action';
      console.log(`Action triggered: ${label}`);
    });
  });
}

