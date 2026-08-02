/* =========================================================
   MINDSCORE — client logic
   ========================================================= */
(() => {
  "use strict";

  // Point this at wherever your FastAPI server is running.
  const API_BASE_URL = "http://127.0.0.1:8000";
  const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;

  const form            = document.getElementById("predictForm");
  const submitBtn       = document.getElementById("submitBtn");
  const orbWrap         = document.getElementById("orbWrap");
  const orb             = document.getElementById("orb");
  const orbPercent      = document.getElementById("orbPercent");
  const orbCaption      = document.getElementById("orbCaption");
  const ringFill        = document.getElementById("ringFill");
  const resultCard      = document.getElementById("resultCard");
  const resultNumber    = document.getElementById("resultNumber");
  const resultTag       = document.getElementById("resultTag");
  const gaugeFill       = document.getElementById("gaugeFill");
  const gaugeMarker     = document.getElementById("gaugeMarker");
  const retakeBtn       = document.getElementById("retakeBtn");
  const toastStack      = document.getElementById("toastStack");

  const RING_CIRCUMFERENCE = 2 * Math.PI * 98; // r=98

  // --- Validation rules mirrored from the FastAPI pydantic model ---
  const rules = {
    Age:                       { type: "number", gt: 10,  le: 110 },
    Gender:                    { type: "select" },
    Country:                   { type: "text" },
    Academic_Level:            { type: "select" },
    Most_Used_Platform:        { type: "select" },
    Purpose_Of_Use:            { type: "select" },
    Avg_Daily_Usage_Hours:     { type: "number", gt: 0,   le: 24 },
    Daily_Unlocks:             { type: "number", gt: 0 },
    Study_Hours:               { type: "number", gt: 0,   le: 24 },
    Physical_Activity_Hours:   { type: "number", gt: 0,   le: 24 },
    Sleep_Hours_Per_Night:     { type: "number", gt: 0,   le: 24 },
    Stress_Level:              { type: "select" },
  };
  const fieldNames = Object.keys(rules);

  /* ---------------------------------------------------------
     Progress ring — reflects how much of the form is filled
     --------------------------------------------------------- */
  function currentProgress() {
    const filled = fieldNames.filter((name) => {
      const el = form.elements[name];
      return el && String(el.value).trim() !== "";
    }).length;
    return filled / fieldNames.length;
  }

  function updateProgress() {
    const ratio = currentProgress();
    const offset = RING_CIRCUMFERENCE * (1 - ratio);
    ringFill.style.strokeDashoffset = offset;
    orbPercent.textContent = `${Math.round(ratio * 100)}%`;
    orbCaption.textContent =
      ratio === 0 ? "form started" : ratio < 1 ? "filling in" : "ready to submit";
  }

  ringFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ringFill.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

  form.addEventListener("input", updateProgress);
  form.addEventListener("change", (e) => {
    updateProgress();
    if (e.target.tagName === "SELECT") {
      e.target.classList.toggle("has-value", e.target.value !== "");
    }
  });

  /* ---------------------------------------------------------
     Field-level validation + inline error states
     --------------------------------------------------------- */
  function setFieldInvalid(name, invalid) {
    const el = form.elements[name];
    if (!el) return;
    const wrap = el.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", invalid);
  }

  function validateField(name) {
    const el = form.elements[name];
    const rule = rules[name];
    const raw = el.value;

    if (raw === "" || raw === null) {
      setFieldInvalid(name, true);
      return { valid: false, message: `${labelFor(name)} is required.` };
    }

    if (rule.type === "number") {
      const num = Number(raw);
      if (Number.isNaN(num)) {
        setFieldInvalid(name, true);
        return { valid: false, message: `${labelFor(name)} must be a number.` };
      }
      if (rule.gt !== undefined && !(num > rule.gt)) {
        setFieldInvalid(name, true);
        return { valid: false, message: `${labelFor(name)} must be greater than ${rule.gt}.` };
      }
      if (rule.le !== undefined && !(num <= rule.le)) {
        setFieldInvalid(name, true);
        return { valid: false, message: `${labelFor(name)} must be ${rule.le} or less.` };
      }
    }

    setFieldInvalid(name, false);
    return { valid: true };
  }

  function labelFor(name) {
    const labelEl = document.querySelector(`label[for="${name}"]`);
    return labelEl ? labelEl.textContent : name.replace(/_/g, " ");
  }

  function validateAll() {
    const errors = [];
    fieldNames.forEach((name) => {
      const result = validateField(name);
      if (!result.valid) errors.push(result.message);
    });
    return errors;
  }

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  const ICONS = {
    error: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8 12.5 2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    warn: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 3 20h18L12 4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  };

  function showToast({ type = "warn", title, message, duration = 5200 }) {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.warn}</span>
      <div class="toast-body">
        <strong>${title}</strong>
        <span>${message}</span>
      </div>
    `;
    toastStack.appendChild(el);
    const timer = setTimeout(() => dismiss(), duration);
    el.addEventListener("click", () => {
      clearTimeout(timer);
      dismiss();
    });
    function dismiss() {
      el.classList.add("leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }
  }

  /* ---------------------------------------------------------
     Orb loading state
     --------------------------------------------------------- */
  function setLoading(isLoading) {
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.disabled = isLoading;
    orb.classList.toggle("loading", isLoading);
    orbCaption.textContent = isLoading ? "thinking…" : orbCaption.textContent;
  }

  /* ---------------------------------------------------------
     Result rendering
     --------------------------------------------------------- */
  function extractScore(predictText) {
    const match = String(predictText).match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }

  function tagForScore(score) {
    if (score === null) return "Model returned a result.";
    if (score >= 8) return "Looks like a strong, balanced week.";
    if (score >= 6) return "Generally steady, with some room to breathe.";
    if (score >= 4) return "A mixed picture — worth paying attention to.";
    return "Signals of real strain — please be gentle with yourself.";
  }

  function showResult(rawPredictText) {
    const score = extractScore(rawPredictText);
    const clamped = score === null ? 0 : Math.max(0, Math.min(10, score));

    resultNumber.textContent = score === null ? "—" : score.toFixed(1);
    resultTag.textContent = tagForScore(score);

    const pct = (clamped / 10) * 100;
    requestAnimationFrame(() => {
      gaugeFill.style.width = `${pct}%`;
      gaugeMarker.style.left = `${pct}%`;
    });

    orbWrap.style.opacity = "0";
    orbWrap.style.transform = "scale(.92)";
    orbWrap.style.pointerEvents = "none";
    resultCard.hidden = false;
    orbCaption.textContent = "reading complete";
  }

  function resetToOrb() {
    resultCard.hidden = true;
    orbWrap.style.opacity = "1";
    orbWrap.style.transform = "scale(1)";
    orbWrap.style.pointerEvents = "auto";
    gaugeFill.style.width = "0%";
    gaugeMarker.style.left = "0%";
    form.reset();
    document.querySelectorAll(".field.select-field select").forEach((s) =>
      s.classList.remove("has-value")
    );
    document.querySelectorAll(".field.invalid").forEach((f) => f.classList.remove("invalid"));
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  retakeBtn.addEventListener("click", resetToOrb);

  /* ---------------------------------------------------------
     Error parsing — handles FastAPI 422s, custom 500s, network
     --------------------------------------------------------- */
  async function describeErrorResponse(response) {
    let body = null;
    try {
      body = await response.json();
    } catch (_) {
      /* not JSON */
    }

    if (response.status === 422 && body && Array.isArray(body.detail)) {
      const first = body.detail[0];
      const field = first?.loc?.[first.loc.length - 1];
      return `${field ? labelFor(String(field)) + ": " : ""}${first?.msg || "Invalid input."}`;
    }
    if (body && typeof body.error === "string") return body.error;
    if (body && typeof body["server error"] === "string") return body["server error"];
    if (body && typeof body.detail === "string") return body.detail;
    return `Server responded with status ${response.status}.`;
  }

  /* ---------------------------------------------------------
     Submit handler
     --------------------------------------------------------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errors = validateAll();
    if (errors.length > 0) {
      showToast({
        type: "warn",
        title: "Check a few fields",
        message: errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : ""),
      });
      const firstInvalid = form.querySelector(".field.invalid input, .field.invalid select");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const payload = {
      Age: Number(form.Age.value),
      Gender: form.Gender.value,
      Country: form.Country.value.trim(),
      Academic_Level: form.Academic_Level.value,
      Most_Used_Platform: form.Most_Used_Platform.value,
      Purpose_Of_Use: form.Purpose_Of_Use.value,
      Avg_Daily_Usage_Hours: Number(form.Avg_Daily_Usage_Hours.value),
      Daily_Unlocks: Number(form.Daily_Unlocks.value),
      Study_Hours: Number(form.Study_Hours.value),
      Physical_Activity_Hours: Number(form.Physical_Activity_Hours.value),
      Sleep_Hours_Per_Night: Number(form.Sleep_Hours_Per_Night.value),
      Stress_Level: form.Stress_Level.value,
    };

    setLoading(true);

    try {
      const response = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await describeErrorResponse(response);
        showToast({ type: "error", title: "Prediction failed", message });
        return;
      }

      const data = await response.json();
      const predictText = data.Predict || data.predict || "Prediction complete.";
      showResult(predictText);
      showToast({
        type: "success",
        title: "Score generated",
        message: "Your reading is ready on the left panel.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Can't reach the server",
        message: `Is uvicorn running at ${API_BASE_URL}? (${err.message})`,
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  });

  /* ---------------------------------------------------------
     Live inline validation as user leaves a field
     --------------------------------------------------------- */
  fieldNames.forEach((name) => {
    const el = form.elements[name];
    if (!el) return;
    el.addEventListener("blur", () => {
      if (el.value !== "") validateField(name);
    });
  });

  updateProgress();
})();
