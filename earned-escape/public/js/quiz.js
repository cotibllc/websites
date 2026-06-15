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
    // Hide results, show questions
    resultsCard.style.display = 'none';
    questionsWrapper.style.display = 'block';
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
  }
});
