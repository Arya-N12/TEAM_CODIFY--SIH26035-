document.addEventListener('DOMContentLoaded', () => {
  // Read appNo from query string
  const urlParams = new URLSearchParams(window.location.search);
  const appNo = urlParams.get('appNo');
  if (appNo) {
    document.getElementById('wsAppNo').textContent = appNo;
  }

  // Set up workspace tabs
  const wsTabs = document.querySelectorAll('.ws-tab');
  wsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      openWorkspaceTab(target);
    });
  });
});

function openWorkspaceTab(tabName) {
  // Update Tabs
  document.querySelectorAll('.ws-tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.querySelector(`.ws-tab[data-tab="${tabName}"]`);
  if(activeTab) activeTab.classList.add('active');

  // Update Content
  document.querySelectorAll('.ws-tab-content').forEach(content => content.classList.remove('active'));
  const activeContent = document.getElementById(`tab-${tabName}`);
  if(activeContent) activeContent.classList.add('active');
}

// --- Evidence Photographs Data & Rendering Logic ---
const evidencePhotographs = [
  { id: 'photo-1', title: 'Front View', status: 'valid', size: '1.2 MB', url: 'https://placehold.co/600x400/eeeeee/333333?text=Front+View' },
  { id: 'photo-2', title: 'Side View', status: 'valid', size: '1.5 MB', url: 'https://placehold.co/600x400/eeeeee/333333?text=Side+View' },
  { id: 'photo-3', title: 'Nameplate', status: 'valid', size: '850 KB', url: 'https://placehold.co/600x400/eeeeee/333333?text=Nameplate' },
  { id: 'photo-4', title: 'Identification Plate', status: 'valid', size: '920 KB', url: 'https://placehold.co/600x400/eeeeee/333333?text=ID+Plate' },
  { id: 'photo-5', title: 'Eccentricity Test Setup', status: 'missing', size: '--', url: null }
];

function renderEvidencePhotographs() {
  const container = document.getElementById('evidence-photos-container');
  if (!container) return;

  container.innerHTML = evidencePhotographs.map(photo => {
    const isMissing = photo.status === 'missing';
    
    const imageContent = isMissing 
      ? `<div class="photo-placeholder">
           <i class="fa-regular fa-image"></i>
           <span>No Image Uploaded</span>
         </div>`
      : `<img src="${photo.url}" alt="${photo.title}" class="photo-card-img" />
         <button class="photo-action-btn" title="View Fullscreen" onclick="alert('View ${photo.title} fullscreen')">
           <i class="fa-solid fa-expand"></i>
         </button>`;

    const metaContent = isMissing 
      ? `<span><i class="fa-solid fa-minus mr-1"></i>${photo.size}</span>
         <span class="text-red"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Missing</span>`
      : `<span><i class="fa-regular fa-image mr-1"></i>${photo.size}</span>
         <span class="text-green"><i class="fa-solid fa-circle-check mr-1"></i>Verified</span>`;

    return `
      <div class="photo-card ${isMissing ? 'missing' : ''}">
        <div class="photo-card-img-wrapper">
          ${imageContent}
        </div>
        <div class="photo-card-body">
          <div class="photo-card-title">${photo.title}</div>
          <div class="photo-card-meta">
            ${metaContent}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Ensure the new rendering logic triggers on load alongside existing JS
document.addEventListener('DOMContentLoaded', () => {
  // Existing functionality...
  const urlParams = new URLSearchParams(window.location.search);
  const appNo = urlParams.get('appNo');
  if (appNo) {
    document.getElementById('wsAppNo').textContent = appNo;
  }

  const wsTabs = document.querySelectorAll('.ws-tab');
  wsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      openWorkspaceTab(target);
    });
  });
  
  // Render Photographs
  renderEvidencePhotographs();
});
