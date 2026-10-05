/**
 * Voice Entry logic for NAWI Test Management
 */

(function() {
const VoiceConfig = {
  API_BASE_URL: window.NAWI_VOICE_API || 'http://127.0.0.1:8005/api/voice',
  MAX_RECORD_TIME_MS: 120000, // 120 seconds
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
};

class VoiceNotification {
  static show(message, isError = false) {
    let container = document.getElementById('voice-notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'voice-notification-container';
      document.body.appendChild(container);
    }
    
    const notif = document.createElement('div');
    notif.className = 'voice-notification ' + (isError ? 'voice-error' : 'voice-info');
    notif.setAttribute('role', 'alert');
    
    const text = document.createElement('span');
    text.textContent = message;
    notif.appendChild(text);
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.className = 'voice-notif-close';
    closeBtn.onclick = () => notif.remove();
    closeBtn.setAttribute('aria-label', 'Close notification');
    notif.appendChild(closeBtn);
    
    container.appendChild(notif);
    
    if (!isError) {
      setTimeout(() => { if (notif.parentNode) notif.remove(); }, 3000);
    }
  }
}

class SchemaClient {
  constructor() {
    this.schema = null;
  }
  async fetchSchema() {
    try {
      // Mock schema for the frontend-only prototype
      this.schema = {
        sections: [
          { id: '1', example: 'e.g. "Value is 50.5 kg"' }
        ]
      };
    } catch (e) {
      console.warn("Could not fetch schema", e);
    }
  }
  getSection(id) {
    if (!this.schema) return null;
    return this.schema.sections.find(s => s.id === id);
  }
}

class Recorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.timerInterval = null;
    this.animationFrame = null;
    this.startTime = null;
    
    this.onVolumeChange = null;
    this.onMaxTimeReached = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      const types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
      let options = {};
      for (const t of types) {
        if (MediaRecorder.isTypeSupported(t)) {
          options = { mimeType: t };
          break;
        }
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      
      this.mediaRecorder.start();
      this.startTime = Date.now();
      
      this._monitorVolume();
      this._startTimer();
      return true;
    } catch (e) {
      console.error("Mic access denied or unsupported", e);
      return false;
    }
  }

  _monitorVolume() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const update = () => {
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for(let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      if (this.onVolumeChange) this.onVolumeChange(average);
      this.animationFrame = requestAnimationFrame(update);
    };
    update();
  }
  
  _startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed >= VoiceConfig.MAX_RECORD_TIME_MS) {
        if (this.onMaxTimeReached) this.onMaxTimeReached();
      }
    }, 1000);
  }

  async stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(null);
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
        this._cleanup();
        resolve(audioBlob);
      };
      
      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this._cleanup();
  }

  _cleanup() {
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animationFrame);
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.mediaRecorder = null;
    this.stream = null;
  }
}

class VoiceApiClient {
  constructor() {
    this.controller = null;
  }

  async transcribeAndExtract(audioBlob, sectionId) {
    this.controller = new AbortController();
    
    // Simulate processing time
    await new Promise(r => setTimeout(r, 1500));

    // Return a mock response indicating that it's just a prototype
    return {
      transcript: "[Voice service unavailable in prototype. This is a static mock response.]",
      unmatched_segments: "Actual transcription and processing backend is disabled.",
      fields: [
        {
          label: "Mock Prototype Field",
          confidence: "low",
          display_value: "N/A",
          value: "N/A",
          warnings: ["Backend is intentionally omitted in this prototype"],
          type: "text",
          unit: ""
        }
      ]
    };
  }

  cancel() {
    if (this.controller) {
      this.controller.abort();
    }
  }
}

class TtsService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.initVoice();
  }
  
  initVoice() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices.length) return;
      this.voice = voices.find(v => v.lang === 'en-IN') || 
                   voices.find(v => v.lang === 'en-GB') || 
                   voices.find(v => v.lang === 'en-US') || 
                   voices[0];
    };
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoice;
    }
    setVoice();
  }

  speak(textLines) {
    this.stop();
    // queue one utterance per field to avoid chrome long-utterance cutoff
    for (const text of textLines) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      this.synth.speak(utterance);
    }
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }
}

class FieldApplier {
  constructor() {}

  apply(fields) {
    let appliedCount = 0;
    for (const f of fields) {
      if (f.status !== 'success') continue;
      
      const el = document.querySelector(f.selector);
      if (!el || el.readOnly || el.disabled) continue;

      if (f.type === 'checkbox') {
        el.checked = (f.value === 'true');
        this.triggerEvents(el);
        appliedCount++;
        this.highlight(el);
      } else if (f.type === 'select') {
        const option = Array.from(el.options).find(o => o.value === f.value);
        if (option) {
          el.value = option.value;
          this.triggerEvents(el);
          appliedCount++;
          this.highlight(el);
        }
      } else if (f.type === 'table_row') {
        const actualInput = el.querySelector('.test-actual');
        const indInput = el.querySelector('.test-indicated');
        if (f.value.actual && actualInput) {
          actualInput.value = f.value.actual;
          this.triggerEvents(actualInput);
          this.highlight(actualInput);
        }
        if (f.value.indicated && indInput) {
          indInput.value = f.value.indicated;
          this.triggerEvents(indInput);
          this.highlight(indInput);
        }
        appliedCount++;
      } else {
        el.value = f.value;
        if (f.unit) {
          const unitGroup = el.closest('.input-unit');
          if (unitGroup) {
            const unitSelect = unitGroup.querySelector('select.unit-select');
            if (unitSelect) {
              const uOpt = Array.from(unitSelect.options).find(o => o.value === f.unit);
              if (uOpt) unitSelect.value = f.unit;
            }
          }
        }
        this.triggerEvents(el);
        appliedCount++;
        this.highlight(el);
      }
    }
    return appliedCount;
  }

  triggerEvents(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  highlight(el) {
    el.classList.add('field-highlighted');
    setTimeout(() => {
      el.classList.remove('field-highlighted');
    }, 2500);
  }
}

class ReviewDialog {
  constructor(onConfirm, onDiscard, onReRecord, onPreview) {
    this.onConfirm = onConfirm;
    this.onDiscard = onDiscard;
    this.onReRecord = onReRecord;
    this.onPreview = onPreview;
    this.modal = null;
    this.createDOM();
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = 'voice-review-modal';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.setAttribute('aria-label', 'Voice extraction review');
    div.innerHTML = `
      <div class="voice-review-card" tabindex="-1">
        <div class="voice-review-header">
          <h3>Review Voice Data</h3>
          <button type="button" class="btn-secondary close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="voice-review-body">
          <div class="voice-transcript-box">
            <strong>Transcript:</strong> <span class="transcript-text"></span>
          </div>
          <table class="voice-fields-table">
            <thead>
              <tr>
                <th>Include</th>
                <th>Field</th>
                <th>Recognized Value</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody class="fields-tbody"></tbody>
          </table>
          <div class="unmatched-box" style="margin-top:16px; font-size:0.85rem; color:#ef4444; display:none;">
            <strong>Unrecognized parts:</strong> <span class="unmatched-text"></span>
          </div>
        </div>
        <div class="voice-review-footer">
          <button type="button" class="btn-secondary read-aloud-btn"><i class="fa-solid fa-volume-high"></i> Preview</button>
          <button type="button" class="btn-secondary re-record-btn"><i class="fa-solid fa-rotate-right"></i> Re-record</button>
          <button type="button" class="btn-secondary discard-btn">Discard</button>
          <button type="button" class="btn-primary confirm-btn">Save Selected</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    this.modal = div;

    this.modal.querySelector('.close-btn').onclick = () => this.onDiscard();
    this.modal.querySelector('.discard-btn').onclick = () => this.onDiscard();
    this.modal.querySelector('.re-record-btn').onclick = () => this.onReRecord();
    this.modal.querySelector('.confirm-btn').onclick = () => this.onConfirm();
    this.modal.querySelector('.read-aloud-btn').onclick = () => this.onPreview();
    
    // Focus trap and escape
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.onDiscard();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  show(result) {
    this.currentResult = result;
    const tbody = this.modal.querySelector('.fields-tbody');
    tbody.innerHTML = '';
    
    this.modal.querySelector('.transcript-text').textContent = result.transcript;
    
    if (result.unmatched_segments && result.unmatched_segments.trim() !== '') {
      this.modal.querySelector('.unmatched-box').style.display = 'block';
      this.modal.querySelector('.unmatched-text').textContent = result.unmatched_segments;
    } else {
      this.modal.querySelector('.unmatched-box').style.display = 'none';
    }

    result.fields.forEach((f, i) => {
      const tr = document.createElement('tr');
      const confClass = f.confidence === 'high' ? 'voice-confidence-high' : 'voice-confidence-low';
      
      let valStr = f.display_value;
      if (f.unit) valStr += ' ' + f.unit;
      
      tr.innerHTML = `
        <td><input type="checkbox" class="field-include-chk" data-idx="${i}" checked /></td>
        <td>${f.label}</td>
        <td><input type="text" value="" class="field-edit-input" data-idx="${i}" style="width:100%; border:1px solid #cbd5e1; padding:4px; border-radius:4px;"/></td>
        <td class="${confClass}">${f.confidence} ${f.warnings.length ? '⚠️' : ''}</td>
      `;
      // set value safely
      tr.querySelector('.field-edit-input').value = valStr;
      
      if (f.warnings.length) {
        tr.title = f.warnings.join(', ');
      }
      tbody.appendChild(tr);
    });
    
    this.modal.classList.add('show');
    this.modal.querySelector('.voice-review-card').focus();
  }

  hide() {
    this.modal.classList.remove('show');
  }

  getSelectedFields() {
    const fields = [];
    const inputs = this.modal.querySelectorAll('.field-edit-input');
    const chks = this.modal.querySelectorAll('.field-include-chk');
    
    inputs.forEach((inp, idx) => {
      if (chks[idx].checked) {
        const orig = this.currentResult.fields[idx];
        const newObj = JSON.parse(JSON.stringify(orig));
        
        // update value (very basic override, doesn't split unit well in this MVP)
        if (newObj.type !== 'table_row' && newObj.type !== 'checkbox') {
           newObj.value = inp.value.replace(newObj.unit || '', '').trim();
        }
        fields.push(newObj);
      }
    });
    return fields;
  }
}

class SectionController {
  constructor() {
    this.schemaClient = new SchemaClient();
    this.recorder = new Recorder();
    this.apiClient = new VoiceApiClient();
    this.applier = new FieldApplier();
    this.tts = new TtsService();
    this.reviewDialog = new ReviewDialog(
      () => this.onReviewConfirm(),
      () => this.onReviewDiscard(),
      () => this.onReviewReRecord(),
      () => this.onReviewPreview()
    );
    
    this.state = 'idle';
    this.currentSectionId = null;
    this.currentBtn = null;
    this.overlay = null;
  }

  async init() {
    await this.schemaClient.fetchSchema();
    this.bindButtons();
    
    // Live region for a11y
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-9999px';
    document.body.appendChild(this.liveRegion);
    
    // Health check - Mocked as healthy for prototype UI display
    try {
      // Mock passing health check
      // const res = await fetch(`${VoiceConfig.API_BASE_URL}/health`);
      // if (!res.ok) throw new Error();
    } catch {
      this.disableAllMics("Voice service offline");
    }
    
    window.addEventListener('beforeunload', () => {
      if (this.state === 'recording') this.recorder.cancel();
      this.tts.stop();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state === 'recording') {
        this.stopRecording(true);
      }
    });
  }

  bindButtons() {
    document.querySelectorAll('.btn-mic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sectionId = btn.getAttribute('data-voice-section');
        if (!sectionId) return;
        
        if (this.state === 'idle') {
          this.startRecording(btn, sectionId);
        } else if (this.state === 'recording' && this.currentBtn === btn) {
          this.stopRecording();
        }
      });
    });
  }

  disableAllMics(reason) {
    document.querySelectorAll('.btn-mic').forEach(btn => {
      btn.disabled = true;
      btn.title = reason;
    });
  }
  
  updateMicsState(activeBtn) {
    document.querySelectorAll('.btn-mic').forEach(btn => {
      if (btn !== activeBtn) {
        btn.disabled = (this.state !== 'idle');
      }
    });
  }

  async startRecording(btn, sectionId) {
    if (this.tts.synth.speaking) this.tts.stop();
    
    const sectionDef = this.schemaClient.getSection(sectionId);
    
    this.state = 'recording';
    this.currentBtn = btn;
    this.currentSectionId = sectionId;
    
    btn.classList.add('recording');
    btn.setAttribute('aria-pressed', 'true');
    const origLabel = btn.getAttribute('aria-label');
    btn.setAttribute('data-orig-label', origLabel);
    btn.setAttribute('aria-label', 'Stop recording');
    
    this.updateMicsState(btn);
    this.liveRegion.textContent = "Recording started";
    
    this.showOverlay(btn, sectionDef ? sectionDef.example : "");
    
    this.recorder.onVolumeChange = (vol) => {
      if (this.overlay) {
        const fill = this.overlay.querySelector('.voice-meter-fill');
        if (fill) fill.style.width = Math.min(100, vol) + '%';
      }
    };
    
    this.recorder.onMaxTimeReached = () => {
      this.stopRecording();
    };
    
    const success = await this.recorder.start();
    if (!success) {
      this.resetState();
      VoiceNotification.show("Microphone access denied or unavailable", true);
    }
  }

  async stopRecording(discard = false) {
    if (this.state !== 'recording') return;
    this.state = 'processing';
    this.currentBtn.classList.remove('recording');
    this.currentBtn.setAttribute('aria-label', this.currentBtn.getAttribute('data-orig-label'));
    this.currentBtn.setAttribute('aria-pressed', 'false');
    this.hideOverlay();
    
    const audioBlob = await this.recorder.stop();
    
    if (discard || !audioBlob || audioBlob.size === 0) {
      this.resetState();
      return;
    }
    
    VoiceNotification.show("Analysing speech...");
    this.liveRegion.textContent = "Analysing speech, please wait.";
    
    try {
      const result = await this.apiClient.transcribeAndExtract(audioBlob, this.currentSectionId);
      if (!result.fields || result.fields.length === 0) {
        VoiceNotification.show("No fields recognized. Please try again.", true);
        this.resetState();
      } else {
        this.state = 'review';
        this.reviewDialog.show(result);
        this.liveRegion.textContent = "Review dialog opened";
      }
    } catch (e) {
      console.error(e);
      VoiceNotification.show("Failed to process speech.", true);
      this.resetState();
    }
  }

  onReviewConfirm() {
    const fields = this.reviewDialog.getSelectedFields();
    this.reviewDialog.hide();
    
    const count = this.applier.apply(fields);
    VoiceNotification.show(`${count} field(s) updated.`);
    this.liveRegion.textContent = `${count} fields updated in section.`;
    
    // Build TTS string
    const toSpeak = [];
    fields.forEach(f => {
      let t = f.speak_template || `${f.label}: {value}`;
      let disp = f.display_value;
      if (f.unit) disp += ' ' + f.unit;
      t = t.replace('{value}', disp);
      toSpeak.push(t);
    });
    this.tts.speak(toSpeak);
    
    this.resetState();
  }
  
  onReviewDiscard() {
    this.reviewDialog.hide();
    this.resetState();
  }
  
  onReviewReRecord() {
    this.reviewDialog.hide();
    const btn = this.currentBtn;
    const secId = this.currentSectionId;
    this.resetState();
    setTimeout(() => {
      this.startRecording(btn, secId);
    }, 300);
  }
  
  onReviewPreview() {
    const fields = this.reviewDialog.getSelectedFields();
    const toSpeak = [];
    fields.forEach(f => {
      let disp = f.display_value;
      if (f.unit) disp += ' ' + f.unit;
      toSpeak.push(`${f.label}: ${disp}`);
    });
    this.tts.speak(toSpeak);
  }

  resetState() {
    this.state = 'idle';
    this.currentSectionId = null;
    this.currentBtn = null;
    this.updateMicsState(null);
  }

  showOverlay(btn, example) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'voice-recording-overlay';
    this.overlay.innerHTML = `
      <i class="fa-solid fa-microphone text-red fa-fade"></i>
      <div class="voice-meter-bar"><div class="voice-meter-fill"></div></div>
      <div class="voice-example-text">e.g. "${example}"</div>
    `;
    // position near btn
    const rect = btn.getBoundingClientRect();
    this.overlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
    this.overlay.style.left = `${rect.left + window.scrollX}px`;
    document.body.appendChild(this.overlay);
  }
  
  hideOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

// Init
const voiceController = new SectionController();
voiceController.init();
})();
