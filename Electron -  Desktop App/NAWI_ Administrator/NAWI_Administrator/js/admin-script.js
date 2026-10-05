/**
 * Shared Administrator JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Setup tabs if they exist on the page
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and content
        btn.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if(targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // Setup Modals
  const modalOpenBtns = document.querySelectorAll('[data-modal-target]');
  const modalCloseBtns = document.querySelectorAll('.modal-close, [data-modal-close]');
  
  modalOpenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      if(modal) {
        modal.classList.add('show');
      }
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if(modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Sidebar link handling - set active based on current URL
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.sidebar .nav-item');
  
  navItems.forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href');
    if (href) {
      const hrefPath = href.split('/').pop();
      if (hrefPath === currentPath) {
        item.classList.add('active');
      }
    }
  });

});
