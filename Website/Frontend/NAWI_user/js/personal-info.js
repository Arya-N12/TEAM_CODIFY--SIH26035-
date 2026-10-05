/**
 * NAWI Test Management — Profile Management
 * Handles elegant in-place editing, real-time validation, and data synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  initInPlaceEditing();
});

function initInPlaceEditing() {
  const form = document.getElementById('profileForm');
  const body = document.body;
  
  // Buttons
  const btnTopEdit = document.getElementById('topBtnEdit');
  const btnTopCancel = document.getElementById('topBtnCancel');
  const btnTopSave = document.getElementById('topBtnSave');
  const btnCardEdit = document.getElementById('cardBtnEdit');
  
  // Display nodes that need syncing
  const dispName = document.getElementById('displayName');
  const dispDesignation = document.getElementById('displayDesignation');
  const dispLocation = document.getElementById('displayLocation');

  // Input nodes
  const inpFullName = document.getElementById('inpFullName');
  const inpDesignation = document.getElementById('inpDesignation');
  const inpLocation = document.getElementById('inpLocation');
  
  // State
  let isEditing = false;
  let originalValues = {};

  // Enter Edit Mode
  const enableEditMode = () => {
    isEditing = true;
    body.classList.add('edit-mode');
    
    // Toggle Buttons
    btnTopEdit.classList.add('hidden');
    btnCardEdit.classList.add('hidden');
    btnTopCancel.classList.remove('hidden');
    btnTopSave.classList.remove('hidden');

    // Store original values to allow canceling
    const editables = document.querySelectorAll('.editable-field');
    editables.forEach(input => {
      originalValues[input.id] = input.value;
      input.classList.remove('is-invalid');
    });

    // Focus first input automatically
    setTimeout(() => inpFullName.focus(), 100);
  };

  // Exit Edit Mode (Save or Cancel)
  const disableEditMode = () => {
    isEditing = false;
    body.classList.remove('edit-mode');
    
    // Toggle Buttons
    btnTopEdit.classList.remove('hidden');
    btnCardEdit.classList.remove('hidden');
    btnTopCancel.classList.add('hidden');
    btnTopSave.classList.add('hidden');
    
    // Clean up error states
    document.querySelectorAll('.editable-field').forEach(input => {
      input.classList.remove('is-invalid');
    });
  };

  // Cancel action
  const cancelEdit = () => {
    const editables = document.querySelectorAll('.editable-field');
    editables.forEach(input => {
      if (originalValues[input.id] !== undefined) {
        input.value = originalValues[input.id];
      }
    });
    disableEditMode();
  };

  // Save action with Validation
  const saveChanges = () => {
    let isValid = true;
    const editables = document.querySelectorAll('.editable-field');
    
    // Reset validation state
    editables.forEach(input => input.classList.remove('is-invalid'));

    // HTML5 Form Validation Loop
    editables.forEach(input => {
      if (!input.checkValidity()) {
        isValid = false;
        input.classList.add('is-invalid');
      }
    });

    if (!isValid) {
      // Find first invalid input and focus it
      const firstInvalid = document.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // If valid, sync the top header card display values
    dispName.textContent = inpFullName.value;
    dispDesignation.textContent = inpDesignation.value;
    dispLocation.textContent = inpLocation.value;

    disableEditMode();
    showToast();
  };

  // Event Listeners
  if (btnTopEdit) btnTopEdit.addEventListener('click', enableEditMode);
  if (btnCardEdit) btnCardEdit.addEventListener('click', enableEditMode);
  if (btnTopCancel) btnTopCancel.addEventListener('click', cancelEdit);
  if (btnTopSave) btnTopSave.addEventListener('click', saveChanges);

  // Live validation removal on input change
  document.querySelectorAll('.editable-field').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid') && input.checkValidity()) {
        input.classList.remove('is-invalid');
      }
    });
  });
}

/**
 * Toast Notification Utility
 */
function showToast() {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  
  toast.classList.remove('show');
  
  // Tiny delay to ensure re-trigger works smoothly
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }, 50);
}