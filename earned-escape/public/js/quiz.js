document.addEventListener('DOMContentLoaded', () => {
  const quizSection = document.getElementById('quiz-section');
  if (!quizSection) return;

  const steps = quizSection.querySelectorAll('.quiz-step');
  const progressBar = document.getElementById('quiz-progress');
  const stepCount = document.getElementById('quiz-step-count');
  const backBtn = document.getElementById('quiz-back-btn');
  const restartBtn = document.getElementById('quiz-restart-btn');
  const resultsCard = document.getElementById('quiz-results');
  const questionsWrapper = document.getElementById('quiz-questions');

  const resultsTitle = document.getElementById('results-title');
  const resultsDesc = document.getElementById('results-desc');
  const resultsDetailPace = document.getElementById('results-detail-pace');
  const resultsDetailParty = document.getElementById('results-detail-party');
  const ctaLink = document.getElementById('quiz-cta-link');

  let currentStepIndex = 0; // 0 to 3
  let turnstileWidgetId = null; // set once the quiz-results Turnstile widget is explicitly rendered
  let emailRequestId = 0; // bumped on restart so an in-flight /api/quiz response can't clobber a fresh attempt's UI
  const answers = {
    setting: null,      // cruise, parks, adventure, resort
    tripType: null,     // Royal Caribbean, Walt Disney World, Other
    tripTypeTag: null,  // Grand Adventure, Luxury Resort
    travelLabel: null,  // Ocean & Cruise Voyages, etc.
    travelers: null,    // travelers string
    partyLabel: null,   // Solo Journey, etc.
    pace: null,         // pace string
    paceLabel: null,    // Relaxed & Effortless, etc.
    supportTier: null,  // Full-Service, Advisory, etc.
    supportLabel: null  // Full-Service Planning, etc.
  };

  const optionBtns = quizSection.querySelectorAll('.quiz-option-btn');
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.closest('.quiz-step');
      const stepNum = parseInt(step.dataset.step, 10);

      // Save answer details
      if (stepNum === 1) {
        answers.setting = btn.dataset.value;
        answers.tripType = btn.dataset.trip;
        answers.travelLabel = btn.dataset.label;
        if (btn.dataset.tag) {
          answers.tripTypeTag = btn.dataset.tag;
        } else {
          answers.tripTypeTag = null;
        }
      } else if (stepNum === 2) {
        answers.travelers = btn.dataset.travelers;
        answers.partyLabel = btn.dataset.label;
      } else if (stepNum === 3) {
        answers.pace = btn.dataset.pace;
        answers.paceLabel = btn.dataset.label;
      } else if (stepNum === 4) {
        answers.supportTier = btn.dataset.tier;
        answers.supportLabel = btn.dataset.label;
      }

      // Proceed to next step
      if (currentStepIndex < steps.length - 1) {
        goToStep(currentStepIndex + 1);
      } else {
        showResults();
      }
    });
  });

  backBtn.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  });

  restartBtn.addEventListener('click', () => {
    // Reset answers
    for (const key in answers) {
      answers[key] = null;
    }

    // Invalidate any in-flight /api/quiz request so its response can't
    // overwrite the reset UI below after this click.
    emailRequestId += 1;

    // Hide results, show questions
    resultsCard.style.display = 'none';
    questionsWrapper.style.display = 'block';

    // Reset the "email me my results" form back to its initial state
    const emailForm = document.getElementById('quiz-email-form');
    const emailSuccess = document.getElementById('quiz-email-success');
    const emailError = document.getElementById('quiz-email-error');
    if (emailForm) {
      emailForm.reset();
      emailForm.style.display = 'block';
      const btn = document.getElementById('quiz-email-submit-btn');
      if (btn) {
        btn.textContent = 'Email Me My Results';
        btn.disabled = false;
      }
    }
    if (emailSuccess) emailSuccess.style.display = 'none';
    if (emailError) emailError.style.display = 'none';
    if (turnstileWidgetId !== null && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId);
    }

    goToStep(0);
  });

  function goToStep(index) {
    // Hide current step
    steps[currentStepIndex].style.display = 'none';
    steps[currentStepIndex].classList.remove('quiz-step--active');

    // Show new step
    currentStepIndex = index;
    steps[currentStepIndex].style.display = 'block';
    steps[currentStepIndex].classList.add('quiz-step--active');

    // Update progress bar
    const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update step count
    stepCount.textContent = `Step ${currentStepIndex + 1} of ${steps.length}`;

    // Update back button visibility
    if (currentStepIndex > 0) {
      backBtn.style.visibility = 'visible';
    } else {
      backBtn.style.visibility = 'hidden';
    }
  }

  function showResults() {
    questionsWrapper.style.display = 'none';
    resultsCard.style.display = 'block';
    progressBar.style.width = '100%';
    stepCount.textContent = 'Completed';
    backBtn.style.visibility = 'hidden';

    // Generate recommendation content
    let title = '';
    let desc = '';

    const travelersStr = answers.travelers;
    const paceStr = answers.pace;
    const setting = answers.setting;

    if (setting === 'cruise') {
      title = `${answers.partyLabel} Cruise Voyage`;
      desc = `A bespoke ocean cruise vacation with Royal Caribbean or Disney Cruise Line, personalized to your style. Chuck's deep cruise expertise will help you select the ideal class of ship, stateroom location, and dining rotation for a seamless voyage.`;
    } else if (setting === 'parks') {
      title = `${answers.partyLabel} Park Adventure`;
      desc = `An immersive, magical escape to Walt Disney World or Universal Orlando/Epic Universe. Chuck will handle the complex planning details – from resort selections and transport logistics to Lightning Lane and dining strategies – so you can focus on the fun.`;
    } else if (setting === 'adventure') {
      title = `Grand Bucket-List Adventure`;
      desc = `A highly customized international journey, like exploring Beijing, the Great Wall of China, Xi'an, Chongqing, or Singapore. Drawing on Chuck's firsthand travel experience, we'll design a high-precision, unforgettable itinerary.`;
    } else if (setting === 'resort') {
      title = `Luxury Resort Retreat`;
      desc = `A premium, relaxing escape at a world-class resort. From white-glove service to poolside relaxation and fine dining, we'll curate the perfect destination and room category to give you the rest you've earned.`;
    }

    resultsTitle.textContent = title;
    resultsDesc.textContent = desc;
    resultsDetailPace.textContent = answers.paceLabel;
    resultsDetailParty.textContent = answers.partyLabel;

    // Stash for the "email me my results" form below
    answers.resultTitle = title;
    answers.resultDesc = desc;

    // Generate pre-filled message
    let prefillTripType = answers.tripType;
    if (answers.tripTypeTag) {
      prefillTripType = `${answers.tripType} (${answers.tripTypeTag})`;
    }

    const paceMsg = paceStr;
    const travelersMsg = travelersStr;
    
    // Compose message
    let message = `Hi Chuck, we're planning a ${travelersMsg.toLowerCase()} trip focused on ${answers.travelLabel.toLowerCase()} with a ${paceMsg}. We're looking for ${answers.supportLabel.toLowerCase()} support.`;
    
    // Build query params
    const queryParams = new URLSearchParams({
      tripType: prefillTripType,
      supportTier: answers.supportTier,
      travelers: travelersStr,
      message: message
    });

    ctaLink.href = `/plan?${queryParams.toString()}#plan-form-section`;
    answers.resultTripType = prefillTripType;

    renderQuizTurnstile();
  }

  // The quiz-results Turnstile widget lives inside a box that's display:none
  // until showResults() runs, so it's deliberately excluded from Turnstile's
  // implicit auto-render scan (see quiz.njk) and rendered explicitly here,
  // once the container is actually visible. window.turnstile may not have
  // loaded yet (the script tag is async/defer), so retry briefly.
  function renderQuizTurnstile(attemptsLeft = 20) {
    if (turnstileWidgetId !== null) return; // already rendered
    const container = document.getElementById('quiz-turnstile-widget');
    if (!container) return; // no site key configured, nothing to render

    if (window.turnstile) {
      turnstileWidgetId = window.turnstile.render(container, {
        sitekey: container.dataset.sitekey,
        theme: container.dataset.theme || 'auto',
      });
    } else if (attemptsLeft > 0) {
      setTimeout(() => renderQuizTurnstile(attemptsLeft - 1), 250);
    }
  }

  // "Email me my results" form
  const emailForm = document.getElementById('quiz-email-form');
  if (emailForm) {
    const emailSubmitBtn = document.getElementById('quiz-email-submit-btn');
    const emailSuccess = document.getElementById('quiz-email-success');
    const emailError = document.getElementById('quiz-email-error');

    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      emailError.style.display = 'none';
      emailError.textContent = '';

      const name = document.getElementById('q-name').value.trim();
      const email = document.getElementById('q-email').value.trim();
      const website = document.getElementById('q-website').value;
      const turnstileToken = emailForm.querySelector('[name="cf-turnstile-response"]')?.value;

      const hasTurnstileWidget = !!document.getElementById('quiz-turnstile-widget');
      if (hasTurnstileWidget && !turnstileToken) {
        emailError.textContent = 'Please complete the security check before submitting.';
        emailError.style.display = 'block';
        return;
      }

      if (!name || !email) {
        emailError.textContent = 'Please provide both your first name and email address.';
        emailError.style.display = 'block';
        return;
      }

      const originalBtnText = emailSubmitBtn.textContent;
      emailSubmitBtn.textContent = 'Sending...';
      emailSubmitBtn.disabled = true;

      const requestId = emailRequestId;

      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            turnstileToken,
            website,
            resultTitle: answers.resultTitle,
            resultDesc: answers.resultDesc,
            paceLabel: answers.paceLabel,
            partyLabel: answers.partyLabel,
            tripType: answers.resultTripType,
            supportTier: answers.supportTier,
          }),
        });

        // The user may have hit "Restart Quiz" while this request was in
        // flight; if so, don't let this stale response touch the (already
        // reset) UI for a new attempt.
        if (requestId !== emailRequestId) return;

        let data = {};
        try {
          data = await res.json();
        } catch (parseErr) {
          // Non-JSON response (e.g. a proxy/500 HTML page) — fall through
          // to the generic error message below.
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to send your results.');
        }

        emailForm.style.display = 'none';
        emailSuccess.style.display = 'block';
      } catch (err) {
        if (requestId !== emailRequestId) return;
        emailError.textContent = err.message || 'Something went wrong. Please try again.';
        emailError.style.display = 'block';
        emailSubmitBtn.textContent = originalBtnText;
        emailSubmitBtn.disabled = false;
        if (turnstileWidgetId !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId);
        }
      }
    });
  }
});
