(() => {
  const apiBase = "http://127.0.0.1:8005";
  const buttons = [...document.querySelectorAll("[data-voice-section]")];
  let activeSession = null;
  let isProcessing = false;

  buttons.forEach((button) => {
    button.dataset.idleLabel = button.getAttribute("aria-label") || "Enable voice input";
  });

  function getStatusElement(button) {
    const section = button.closest(".section-card");
    let status = section.querySelector(".voice-status");

    if (!status) {
      status = document.createElement("div");
      status.className = "voice-status";
      status.setAttribute("aria-live", "polite");
      section.insertBefore(status, section.querySelector(".section-header").nextSibling);
    }

    return status;
  }

  function showStatus(button, message, state = "info", transcript = "") {
    const status = getStatusElement(button);
    status.className = `voice-status is-visible is-${state}`;
    status.replaceChildren();

    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    status.append(messageElement);

    if (transcript) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const transcriptText = document.createElement("p");
      summary.textContent = "View transcript";
      transcriptText.textContent = transcript;
      details.append(summary, transcriptText);
      status.append(details);
    }
  }

  function setButtonState(button, state) {
    const recording = state === "recording";
    button.classList.toggle("is-recording", recording);
    button.classList.toggle("is-busy", state === "busy");
    button.setAttribute("aria-pressed", String(recording));
    button.setAttribute(
      "aria-label",
      recording
        ? "Stop voice input"
        : state === "busy"
          ? "Voice input processing"
          : button.dataset.idleLabel
    );
    button.innerHTML = recording
      ? '<i class="fa-solid fa-stop"></i>'
      : '<i class="fa-solid fa-microphone"></i>';
  }

  function resetSession(session) {
    if (session.stream) {
      session.stream.getTracks().forEach((track) => track.stop());
    }
    setButtonState(session.button, "idle");
    if (activeSession === session) {
      activeSession = null;
    }
  }

  async function checkService() {
    let response;
    try {
      response = await fetch(`${apiBase}/api/voice/health`);
    } catch {
      throw new Error("Voice service is unavailable. Start it on port 8005 and try again.");
    }

    if (!response.ok) {
      throw new Error(`Voice service health check failed (${response.status}).`);
    }

    const health = await response.json();
    if (!health.model_loaded) {
      throw new Error("The voice recognition model is not loaded.");
    }
  }

  function applyFields(fields) {
    let applied = 0;
    const warnings = [];

    fields.forEach((field) => {
      if (field.type === "table_row") {
        const row = document.querySelector(field.selector);
        if (!row || !field.value || typeof field.value !== "object") {
          warnings.push(`${field.label}: matching test row was not found.`);
          return;
        }

        const actual = row.querySelector(".test-actual");
        const indicated = row.querySelector(".test-indicated");
        if (actual && field.value.actual !== "") {
          actual.value = field.value.actual;
          actual.dispatchEvent(new Event("input", { bubbles: true }));
          applied += 1;
        }
        if (indicated && field.value.indicated !== "") {
          indicated.value = field.value.indicated;
          indicated.dispatchEvent(new Event("input", { bubbles: true }));
          applied += 1;
        }
        return;
      }

      if (field.value === "" || field.value == null) {
        return;
      }

      const input = document.querySelector(field.selector);
      if (!input) {
        warnings.push(`${field.label}: matching form field was not found.`);
        return;
      }

      if (input.type === "checkbox") {
        input.checked = field.value === true || field.value === "true";
      } else {
        input.value = String(field.value);
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      const unitSelect = input.parentElement?.querySelector(".unit-select");
      if (field.unit && unitSelect) {
        const unitOption = [...unitSelect.options].find(
          (option) => option.value === field.unit || option.textContent.trim() === field.unit
        );
        if (unitOption) {
          unitSelect.value = unitOption.value;
          unitSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      applied += 1;
    });

    return { applied, warnings };
  }

  async function submitRecording(session, blob) {
    isProcessing = true;
    buttons.forEach((button) => {
      button.disabled = true;
    });
    setButtonState(session.button, "busy");
    showStatus(session.button, "Processing your recording…", "info");

    try {
      const formData = new FormData();
      const extension = blob.type.includes("ogg")
        ? "ogg"
        : blob.type.includes("mp4")
          ? "mp4"
          : "webm";
      formData.append("audio", blob, `voice-entry.${extension}`);
      formData.append("section_id", session.sectionId);
      formData.append("language", "en");

      const response = await fetch(`${apiBase}/api/voice/transcribe-extract`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || `Voice processing failed (${response.status}).`);
      }

      const { applied, warnings } = applyFields(result.fields || []);
      const message =
        applied > 0
          ? `Voice input complete. ${applied} field${applied === 1 ? "" : "s"} filled.`
          : "Voice input complete, but no form fields were matched.";
      const extra = [
        ...(result.warnings || []),
        ...warnings,
        result.unmatched_segments
          ? `Unmatched speech: ${result.unmatched_segments}`
          : "",
      ].filter(Boolean);

      showStatus(
        session.button,
        [message, ...extra].join(" "),
        applied > 0 ? "success" : "warning",
        result.transcript
      );
    } catch (error) {
      showStatus(session.button, error.message, "error");
    } finally {
      isProcessing = false;
      buttons.forEach((button) => {
        button.disabled = false;
      });
      setButtonState(session.button, "idle");
    }
  }

  async function startRecording(button) {
    const session = {
      button,
      sectionId: button.dataset.voiceSection,
      chunks: [],
      recorder: null,
      stream: null,
    };
    activeSession = session;
    setButtonState(button, "busy");
    showStatus(button, "Connecting to the voice service…", "info");

    try {
      await checkService();
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Audio recording is not supported by this browser.");
      }

      session.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      session.recorder = mimeType
        ? new MediaRecorder(session.stream, { mimeType })
        : new MediaRecorder(session.stream);

      session.recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          session.chunks.push(event.data);
        }
      });
      session.recorder.addEventListener("stop", () => {
        const blob = new Blob(session.chunks, {
          type: session.recorder.mimeType || "audio/webm",
        });
        resetSession(session);
        if (blob.size > 0) {
          submitRecording(session, blob);
        } else {
          showStatus(session.button, "No audio was recorded. Please try again.", "error");
        }
      }, { once: true });
      session.recorder.addEventListener("error", () => {
        resetSession(session);
        showStatus(session.button, "Recording failed. Please try again.", "error");
      }, { once: true });

      session.recorder.start();
      setButtonState(button, "recording");
      showStatus(button, "Listening… Select the microphone again to stop.", "recording");
    } catch (error) {
      resetSession(session);
      showStatus(button, error.message, "error");
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (isProcessing) {
        return;
      }
      if (activeSession) {
        if (activeSession.button === button && activeSession.recorder?.state === "recording") {
          activeSession.recorder.stop();
          showStatus(button, "Uploading recording…", "info");
        } else if (activeSession.button !== button) {
          showStatus(button, "Finish the current recording before starting another.", "warning");
        }
        return;
      }
      startRecording(button);
    });
  });
})();
