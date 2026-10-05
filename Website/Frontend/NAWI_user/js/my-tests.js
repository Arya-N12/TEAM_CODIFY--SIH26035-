/**
 * NAWI Test Management — My Tests Interactive Controller
 * Handles dynamic record rendering, multi-criteria filtering, search, pagination,
 * and the right-side sliding inspection drawer.
 */

// Dataset representing actual tests
const TESTS_DATA = [
  {
    id: "NAWI-2026-014",
    instrument: "Electronic Weighing Instrument",
    manufacturer: "Apex Weigh Systems",
    model: "AWS-3000",
    serial: "AWS3K-26-01842",
    date: "29 Sep 2026",
    progress: 78,
    stage: "Repeatability Test",
    status: "In Progress",
    accuracyClass: "Class III (Medium)",
    maxCap: "300 kg",
    minCap: "20 g",
    e: "100 g",
    d: "100 g",
    n: "3,000",
    appNo: "LM/NAWI/2026/014",
    officer: "Dr. Ananya Sharma",
    lab: "Regional Legal Metrology Laboratory",
    docs: 5,
    photos: 8,
    evidence: 6,
    result: "Under Evaluation",
    timeline: [
      { name: "Test Registration", date: "29 Sep 2026", state: "done" },
      { name: "Instrument Details Verified", date: "29 Sep 2026", state: "done" },
      { name: "Laboratory Conditions Recorded", date: "29 Sep 2026", state: "done" },
      { name: "Repeatability Test", date: "In Progress", state: "active" },
      { name: "Compliance Evaluation", date: "Pending", state: "pending" },
      { name: "Report Generation", date: "Pending", state: "pending" },
      { name: "Completed", date: "Pending", state: "pending" }
    ]
  },
  {
    id: "NAWI-2026-011",
    instrument: "Platform Scale",
    manufacturer: "Precision Instruments Ltd.",
    model: "PI-500",
    serial: "PI-500-8812",
    date: "27 Sep 2026",
    progress: 92,
    stage: "Final Evaluation",
    status: "Awaiting Review",
    accuracyClass: "Class III (Medium)",
    maxCap: "500 kg",
    minCap: "50 g",
    e: "200 g",
    d: "200 g",
    n: "2,500",
    appNo: "LM/NAWI/2026/011",
    officer: "Dr. Ananya Sharma",
    lab: "Regional Legal Metrology Laboratory",
    docs: 6,
    photos: 10,
    evidence: 9,
    result: "Pass",
    timeline: [
      { name: "Test Registration", date: "27 Sep 2026", state: "done" },
      { name: "Instrument Details Verified", date: "27 Sep 2026", state: "done" },
      { name: "Laboratory Conditions Recorded", date: "27 Sep 2026", state: "done" },
      { name: "Test Execution (All Tests)", date: "27 Sep 2026", state: "done" },
      { name: "Final Evaluation & Review", date: "Under Review", state: "active" },
      { name: "Report Generation", date: "Pending", state: "pending" }
    ]
  },
  {
    id: "NAWI-2026-009",
    instrument: "Electronic Weighing Instrument",
    manufacturer: "Metro Scale Technologies",
    model: "MST-200",
    serial: "MST-200-9941",
    date: "25 Sep 2026",
    progress: 100,
    stage: "Report Generated",
    status: "Completed",
    accuracyClass: "Class II (High)",
    maxCap: "200 g",
    minCap: "10 mg",
    e: "1 mg",
    d: "0.1 mg",
    n: "200,000",
    appNo: "LM/NAWI/2026/009",
    officer: "Dr. Ananya Sharma",
    lab: "Regional Legal Metrology Laboratory",
    docs: 7,
    photos: 6,
    evidence: 12,
    result: "Pass",
    timeline: [
      { name: "Test Registration", date: "25 Sep 2026", state: "done" },
      { name: "Testing Completed", date: "25 Sep 2026", state: "done" },
      { name: "Compliance Verified", date: "25 Sep 2026", state: "done" },
      { name: "Report Issued (RPT-2026-081)", date: "25 Sep 2026", state: "done" }
    ]
  },
  {
    id: "NAWI-2026-006",
    instrument: "Weighbridge",
    manufacturer: "Accurate Weigh Systems",
    model: "AWS-WB-50",
    serial: "WB-50T-004",
    date: "22 Sep 2026",
    progress: 35,
    stage: "Accuracy Test",
    status: "In Progress",
    accuracyClass: "Class IIII (Ordinary)",
    maxCap: "50,000 kg",
    minCap: "200 kg",
    e: "20 kg",
    d: "20 kg",
    n: "2,500",
    appNo: "LM/NAWI/2026/006",
    officer: "Dr. Ananya Sharma",
    lab: "National Metrology Field Station",
    docs: 4,
    photos: 12,
    evidence: 4,
    result: "Under Evaluation",
    timeline: [
      { name: "Test Registration", date: "22 Sep 2026", state: "done" },
      { name: "Corner & Strain Verification", date: "22 Sep 2026", state: "done" },
      { name: "Accuracy Test", date: "In Progress", state: "active" },
      { name: "Remaining Standard Evaluations", date: "Pending", state: "pending" }
    ]
  },
  {
    id: "NAWI-2026-003",
    instrument: "Platform Scale",
    manufacturer: "Global Measurement Ltd.",
    model: "GM-100",
    serial: "GM100-8401",
    date: "18 Sep 2026",
    progress: 100,
    stage: "Compliance Completed",
    status: "Rejected",
    accuracyClass: "Class III (Medium)",
    maxCap: "100 kg",
    minCap: "200 g",
    e: "50 g",
    d: "50 g",
    n: "2,000",
    appNo: "LM/NAWI/2026/003",
    officer: "Dr. Ananya Sharma",
    lab: "Regional Legal Metrology Laboratory",
    docs: 4,
    photos: 5,
    evidence: 8,
    result: "Fail",
    timeline: [
      { name: "Test Registration", date: "18 Sep 2026", state: "done" },
      { name: "Full Evaluation Run", date: "18 Sep 2026", state: "done" },
      { name: "Eccentricity Error > MPE", date: "18 Sep 2026", state: "done" },
      { name: "Notice of Non-Compliance", date: "18 Sep 2026", state: "done" }
    ]
  }
];

let activeFilterStatus = "All";
let searchQuery = "";
let currentOpenDropdown = null;

document.addEventListener("DOMContentLoaded", () => {
  renderTable(TESTS_DATA);
  initFilterEvents();
  initSearchEvent();
  initDrawerEvents();
  initGlobalClick();
});

/**
 * Renders table records dynamically with appropriate badge colors, progress bars, and actions
 */
function renderTable(data) {
  const tbody = document.getElementById("testsTableBody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #64748b;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 12px; display: block; color: #cbd5e1;"></i>
          <strong>No matching NAWI tests found</strong>
          <p style="font-size: 0.85rem; margin-top: 4px;">Try refining your search keyword or clearing the active filters.</p>
        </td>
      </tr>
    `;
    document.getElementById("tableRecordCount").textContent = "0 tests";
    document.getElementById("paginationInfo").textContent = "Showing 0 tests";
    return;
  }

  data.forEach((test, index) => {
    const tr = document.createElement("tr");

    // Action button text and class based on status
    let actionBtnText = "Continue";
    let actionBtnClass = "btn-action-continue";
    if (test.status === "Awaiting Review") {
      actionBtnText = "Review";
      actionBtnClass = "btn-action-review";
    } else if (test.status === "Completed") {
      actionBtnText = "View Report";
      actionBtnClass = "btn-action-view";
    } else if (test.status === "Rejected") {
      actionBtnText = "Correct & Resubmit";
      actionBtnClass = "btn-action-resubmit";
    }

    // Status Badge & Progress styling
    const badgeClass = getBadgeClass(test.status);
    const fillClass = getFillClass(test.status);

    tr.innerHTML = `
      <td><span class="test-id-code">${test.id}</span></td>
      <td><strong>${test.instrument}</strong></td>
      <td>${test.manufacturer}</td>
      <td>${test.model}</td>
      <td>${test.date}</td>
      <td class="progress-cell">
        <div class="progress-wrap">
          <div class="progress-bar-sm">
            <div class="fill ${fillClass}" style="width: ${test.progress}%;"></div>
          </div>
          <span class="progress-pct">${test.progress}%</span>
        </div>
      </td>
      <td>
        <span class="stage-text">
          <i class="fa-solid fa-chevron-right"></i> ${test.stage}
        </span>
      </td>
      <td>
        <span class="badge ${badgeClass}">${test.status}</span>
      </td>
      <td>
        <div class="indicators-row">
          <span class="ind-pill" title="Documents"><i class="fa-regular fa-file"></i> ${test.docs}</span>
          <span class="ind-pill" title="Photographs"><i class="fa-solid fa-camera"></i> ${test.photos}</span>
          <span class="ind-pill" title="Evidence"><i class="fa-solid fa-chart-line"></i> ${test.evidence}</span>
        </div>
      </td>
      <td class="action-cell">
        <div class="action-group">
          <button class="btn-row-action ${actionBtnClass}" onclick="handlePrimaryAction('${test.id}', event)">
            ${actionBtnText}
          </button>
          <button class="btn-more" onclick="toggleActionMenu(${index}, event)" title="More options">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>

        <!-- Action Dropdown Menu -->
        <div class="menu-dropdown" id="dropdown-${index}">
          <div class="menu-item" onclick="openTestDrawer('${test.id}')"><i class="fa-regular fa-eye"></i> View Details</div>
          <div class="menu-item" onclick="simulateAction('Edit', '${test.id}')"><i class="fa-regular fa-pen-to-square"></i> Edit Test</div>
          <div class="menu-item" onclick="simulateAction('Documents', '${test.id}')"><i class="fa-regular fa-folder-open"></i> View Documents</div>
          <div class="menu-item" onclick="simulateAction('Evidence', '${test.id}')"><i class="fa-solid fa-microscope"></i> View Evidence</div>
          <div class="menu-item" onclick="simulateAction('History', '${test.id}')"><i class="fa-solid fa-clock-rotate-left"></i> View Test History</div>
          ${test.status === "Completed" ? `<div class="menu-item" onclick="simulateAction('Download', '${test.id}')"><i class="fa-regular fa-file-pdf"></i> Download Report</div>` : ""}
          <div class="menu-divider"></div>
          <div class="menu-item menu-danger" onclick="simulateAction('Archive', '${test.id}')"><i class="fa-regular fa-box-archive"></i> Archive Test</div>
        </div>
      </td>
    `;

    // Row click opens drawer, excluding action buttons
    tr.addEventListener("click", (e) => {
      if (!e.target.closest(".action-cell")) {
        openTestDrawer(test.id);
      }
    });

    tbody.appendChild(tr);
  });

  document.getElementById("tableRecordCount").textContent = `${data.length} tests`;
  document.getElementById("paginationInfo").textContent = `Showing 1–${data.length} of ${data.length} tests`;
}

function getBadgeClass(status) {
  switch (status) {
    case "In Progress": return "badge-in-progress";
    case "Awaiting Review": return "badge-review";
    case "Completed": return "badge-completed";
    case "Rejected": return "badge-rejected";
    default: return "badge-draft";
  }
}

function getFillClass(status) {
  switch (status) {
    case "In Progress": return "fill-blue";
    case "Awaiting Review": return "fill-amber";
    case "Completed": return "fill-green";
    case "Rejected": return "fill-red";
    default: return "fill-slate";
  }
}

/**
 * Search and Filter Management
 */
function initFilterEvents() {
  // Summary card clicks filter table
  document.querySelectorAll(".kpi-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".kpi-card").forEach(c => c.classList.remove("active-card"));
      card.classList.add("active-card");

      const filterVal = card.getAttribute("data-filter");
      document.getElementById("filterStatus").value = filterVal === "all" ? "All" : filterVal;
      applyFilters();
    });
  });

  // Dropdown changes
  document.getElementById("filterStatus").addEventListener("change", applyFilters);
  document.getElementById("filterType").addEventListener("change", applyFilters);
  document.getElementById("filterResult").addEventListener("change", applyFilters);
  document.getElementById("sortBy").addEventListener("change", applyFilters);

  // Clear button
  document.getElementById("btnClearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterStatus").value = "All";
    document.getElementById("filterType").value = "All";
    document.getElementById("filterDate").value = "All";
    document.getElementById("filterResult").value = "All";
    document.getElementById("sortBy").value = "newest";
    document.querySelectorAll(".kpi-card").forEach(c => c.classList.remove("active-card"));
    renderTable(TESTS_DATA);
  });
}

function initSearchEvent() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });
}

function applyFilters() {
  const statusVal = document.getElementById("filterStatus").value;
  const typeVal = document.getElementById("filterType").value;
  const resultVal = document.getElementById("filterResult").value;
  const sortVal = document.getElementById("sortBy").value;
  searchQuery = document.getElementById("searchInput").value.toLowerCase().trim();

  let filtered = TESTS_DATA.filter(item => {
    const matchesStatus = statusVal === "All" || item.status === statusVal;
    const matchesType = typeVal === "All" || item.instrument === typeVal;
    const matchesResult = resultVal === "All" || item.result === resultVal;
    const matchesSearch = !searchQuery || 
      item.id.toLowerCase().includes(searchQuery) ||
      item.manufacturer.toLowerCase().includes(searchQuery) ||
      item.model.toLowerCase().includes(searchQuery) ||
      item.serial.toLowerCase().includes(searchQuery);

    return matchesStatus && matchesType && matchesResult && matchesSearch;
  });

  // Sorting
  if (sortVal === "oldest") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortVal === "newest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortVal === "progress") {
    filtered.sort((a, b) => b.progress - a.progress);
  }

  renderTable(filtered);
}

/**
 * Three-dot menu toggle
 */
function toggleActionMenu(index, event) {
  event.stopPropagation();
  const menu = document.getElementById(`dropdown-${index}`);
  if (currentOpenDropdown && currentOpenDropdown !== menu) {
    currentOpenDropdown.classList.remove("show");
  }
  menu.classList.toggle("show");
  currentOpenDropdown = menu.classList.contains("show") ? menu : null;
}

function initGlobalClick() {
  document.addEventListener("click", () => {
    if (currentOpenDropdown) {
      currentOpenDropdown.classList.remove("show");
      currentOpenDropdown = null;
    }
  });
}

/**
 * 8 & 9. Right-Side Drawer Controller
 */
function initDrawerEvents() {
  const backdrop = document.getElementById("drawerBackdrop");
  const drawer = document.getElementById("detailsDrawer");
  const closeBtn = document.getElementById("btnCloseDrawer");

  const closeDrawer = () => {
    drawer.classList.remove("open");
    backdrop.classList.remove("show");
  };

  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
}

function openTestDrawer(testId) {
  const test = TESTS_DATA.find(t => t.id === testId);
  if (!test) return;

  const drawer = document.getElementById("detailsDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  // Populate metadata
  document.getElementById("drawerStatusBadge").textContent = test.status;
  document.getElementById("drawerTestId").textContent = test.id;
  document.getElementById("drawerSubtitle").textContent = `${test.manufacturer} — ${test.model}`;
  document.getElementById("drawerProgressVal").textContent = `${test.progress}%`;
  document.getElementById("drawerProgressBar").style.width = `${test.progress}%`;
  document.getElementById("drawerStageName").textContent = test.stage;

  document.getElementById("drawerAppNo").textContent = test.appNo;
  document.getElementById("drawerDate").textContent = test.date;
  document.getElementById("drawerOfficer").textContent = test.officer;
  document.getElementById("drawerLab").textContent = test.lab;

  document.getElementById("drawerInstType").textContent = test.instrument;
  document.getElementById("drawerSerial").textContent = test.serial;
  document.getElementById("drawerClass").textContent = test.accuracyClass;
  document.getElementById("drawerCap").textContent = `Max: ${test.maxCap} | Min: ${test.minCap}`;
  document.getElementById("drawerInterval").textContent = `e: ${test.e} | d: ${test.d}`;
  document.getElementById("drawerN").textContent = test.n;

  document.getElementById("drawerDocCount").textContent = test.docs;
  document.getElementById("drawerPhotoCount").textContent = test.photos;
  document.getElementById("drawerEvidenceCount").textContent = test.evidence;

  // Build timeline
  const timelineEl = document.getElementById("drawerTimeline");
  timelineEl.innerHTML = "";
  test.timeline.forEach(step => {
    const li = document.createElement("li");
    li.className = "timeline-step";

    let iconHtml = '<i class="fa-solid fa-check"></i>';
    if (step.state === "active") iconHtml = '<i class="fa-solid fa-circle" style="font-size:6px;"></i>';
    if (step.state === "pending") iconHtml = '';

    li.innerHTML = `
      <div class="step-marker ${step.state}">${iconHtml}</div>
      <div class="step-text">
        <strong>${step.name}</strong>
        <span>${step.date}</span>
      </div>
    `;
    timelineEl.appendChild(li);
  });

  // Configure primary button
  const primaryBtn = document.getElementById("btnDrawerPrimaryAction");
  if (test.status === "Awaiting Review") {
    primaryBtn.innerHTML = 'Review Evaluation <i class="fa-solid fa-arrow-right"></i>';
  } else if (test.status === "Completed") {
    primaryBtn.innerHTML = 'View Full Report <i class="fa-regular fa-file-pdf"></i>';
  } else if (test.status === "Rejected") {
    primaryBtn.innerHTML = 'Correct & Resubmit <i class="fa-solid fa-rotate-left"></i>';
  } else {
    primaryBtn.innerHTML = 'Continue Evaluation <i class="fa-solid fa-arrow-right"></i>';
  }

  primaryBtn.onclick = () => {
    alert(`Proceeding to evaluation workspace for ${test.id}`);
  };

  // Open drawer
  drawer.classList.add("open");
  backdrop.classList.add("show");
}

function handlePrimaryAction(testId, event) {
  event.stopPropagation();
  const test = TESTS_DATA.find(t => t.id === testId);
  if (test) {
    if (test.status === "Completed") {
      alert(`Opening finalized OIML R-76 report for ${test.id}`);
    } else {
      alert(`Navigating to Test Evaluation module for ${test.id} (${test.stage})...`);
    }
  }
}

function simulateAction(actionName, testId) {
  alert(`${actionName} triggered for ${testId}`);
}