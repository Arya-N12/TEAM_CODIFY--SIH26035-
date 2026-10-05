document.addEventListener('DOMContentLoaded', () => {
  // Read appNo from query string
  const urlParams = new URLSearchParams(window.location.search);
  const appNo = urlParams.get('appNo');
  if (appNo) {
    const appNoEl = document.getElementById('wsAppNo');
    if (appNoEl) appNoEl.textContent = appNo;
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

// --- Image Fullscreen Logic ---
function openFullscreenImage(btn) {
  // Find the closest image card wrapper
  const wrapper = btn.closest('.photo-card-img-wrapper');
  if (!wrapper) return;
  
  // Find the specific image source inside that wrapper
  const img = wrapper.querySelector('.photo-card-img');
  
  if (img) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('fullSizeImage');
    
    // Set the modal image source to the clicked image's source
    modalImg.src = img.src;
    
    // Show the modal overlay using flex to center the image
    modal.style.display = 'flex';
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) modal.style.display = 'none';
  
  // Clear source to prevent ghosting on next load
  const modalImg = document.getElementById('fullSizeImage');
  if (modalImg) modalImg.src = '';
}