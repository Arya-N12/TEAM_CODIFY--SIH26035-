/**
 * NAWI Test Management — Test Evaluation Engine
 * Handles UI stepper transitions, automated MPE calculations, and live validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initStepper();
  initCalculations();
});

let currentStep = 3; // Start on Repeatability Test (03) for the demo flow
const totalSteps = 5;

/**
 * 1. Stepper Navigation Controller
 */
function initStepper() {
  const steps = document.querySelectorAll('.step-item');
  const sections = document.querySelectorAll('.test-section');
  const btnPrev = document.getElementById('btnPrevTest');
  const btnNext = document.getElementById('btnNextTest');
  const mainContainer = document.getElementById('evalMainContainer');

  function showStep(stepNum) {
    // Hide all sections, remove animation class
    sections.forEach(sec => {
      sec.style.display = 'none';
      sec.classList.remove('fade-in');
    });
    
    // Show target section and trigger animation
    const targetSection = document.getElementById(`step-${stepNum}`);
    if (targetSection) {
      targetSection.style.display = 'block';
      // Force DOM reflow to restart CSS animation
      void targetSection.offsetWidth; 
      targetSection.classList.add('fade-in');
    }

    // Update Sidebar Navigation visual states
    steps.forEach(st => {
      st.classList.remove('active');
      const num = parseInt(st.getAttribute('data-step'));
      if (num === stepNum) {
        st.classList.add('active');
      }
    });

    // Update Bottom Action Bar
    if(btnPrev) btnPrev.disabled = (stepNum === 1);
    
    if (btnNext) {
      if (stepNum === totalSteps) {
        btnNext.style.display = 'none';
      } else {
        btnNext.style.display = 'inline-flex';
      }
    }

    currentStep = stepNum;
    
    // Smooth scroll the main container to the top
    if (mainContainer && mainContainer.parentElement) {
      mainContainer.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Bind Sidebar Item Clicks
  steps.forEach(st => {
    st.addEventListener('click', () => {
      const stepNum = parseInt(st.getAttribute('data-step'));
      showStep(stepNum);
    });
  });

  // Bind Bottom Buttons
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) showStep(currentStep - 1);
    });
  }
  
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentStep < totalSteps) showStep(currentStep + 1);
    });
  }

  // Initialize view on load
  showStep(currentStep);
}

/**
 * 2. Automated Calculations & Validation Engine
 * Evaluates inputs against Reference values and MPE tolerances.
 */
function initCalculations() {
  const calcInputs = document.querySelectorAll('.calc-trigger');

  calcInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const row = e.target.closest('tr');
      const refVal = parseFloat(e.target.getAttribute('data-ref'));
      const mpeStr = e.target.getAttribute('data-mpe'); 
      const mpeVal = mpeStr ? parseFloat(mpeStr) : null;
      
      const indicatedVal = parseFloat(e.target.value);
      
      const errCell = row.querySelector('.calc-error');
      const resCell = row.querySelector('.calc-result');
      
      // Handle empty or invalid input
      if (isNaN(indicatedVal)) {
        errCell.textContent = '—';
        errCell.className = 'calc-error font-mono text-muted';
        resCell.innerHTML = '<span class="text-muted">—</span>';
        updateIntelligentWidget(null);
        return;
      }

      // Calculate absolute error
      const error = indicatedVal - refVal;
      const errorFormatted = (error > 0 ? '+' : '') + error.toFixed(3) + ' kg';
      
      errCell.textContent = errorFormatted;
      errCell.className = 'calc-error font-mono font-medium';

      let pass = true;
      if (mpeVal !== null) {
        pass = Math.abs(error) <= mpeVal;
      }

      // Render Inline Table Badge
      if (pass) {
        resCell.innerHTML = '<span class="badge badge-pass">PASS</span>';
        errCell.classList.add('text-main');
        errCell.classList.remove('text-red');
      } else {
        resCell.innerHTML = '<span class="badge badge-fail">FAIL</span>';
        errCell.classList.add('text-red');
        errCell.classList.remove('text-main');
      }

      // Push payload to the Intelligent Evaluation Widget
      updateIntelligentWidget({
        ref: refVal.toFixed(3),
        ind: indicatedVal.toFixed(3),
        err: errorFormatted,
        mpe: mpeVal !== null ? `± ${mpeVal.toFixed(3)} kg` : 'N/A',
        pass: pass
      });
    });
  });
}

/**
 * 3. Update the Intelligent Calculation Widget UI
 */
function updateIntelligentWidget(data) {
  // Elements inside the widget
  const dispRef = document.getElementById('disp-ref');
  const dispInd = document.getElementById('disp-ind');
  const dispErr = document.getElementById('disp-err');
  const dispMpe = document.getElementById('disp-mpe');
  const dispRes = document.getElementById('disp-res');

  if (!dispRef || !dispRes) return; // Safely exit if elements aren't in DOM

  if (!data) {
    // Reset state
    dispRef.textContent = '—';
    dispInd.textContent = '—';
    dispErr.textContent = '—';
    dispErr.className = 'metric-val font-mono';
    dispMpe.textContent = '—';
    dispRes.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> AWAITING INPUT';
    dispRes.className = 'final-result mt-3';
    dispRes.style.background = '#f1f5f9';
    dispRes.style.color = '#64748b';
    return;
  }

  // Populate data
  dispRef.textContent = `${data.ref} kg`;
  dispInd.textContent = `${data.ind} kg`;
  dispErr.textContent = data.err;
  dispMpe.textContent = data.mpe;

  if (data.pass) {
    dispErr.className = 'metric-val font-mono text-green';
    dispRes.innerHTML = '<i class="fa-solid fa-circle-check"></i> PASS COMPLIANCE';
    dispRes.className = 'final-result pass mt-3';
  } else {
    dispErr.className = 'metric-val font-mono text-red';
    dispRes.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> FAIL TOLERANCE';
    dispRes.className = 'final-result fail mt-3';
  }
}