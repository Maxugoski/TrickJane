// Trick Jane — Core Mechanics, Solo Warm-up Progression & Live Multiplayer Races
import { TrickEngine } from './persuasion-engine.js';
import { sound } from './audio.js';
import { ConfettiCannon } from './confetti.js';
import { DILEMMAS } from './game-data.js';

// Helper to retrieve a random dilemma from the full catalog of 30 dilemmas
function getRandomDilemma(excludeId = null) {
  if (!Array.isArray(DILEMMAS) || DILEMMAS.length === 0) return null;
  const pool = excludeId ? DILEMMAS.filter(d => d.id !== excludeId) : DILEMMAS;
  const candidates = pool.length > 0 ? pool : DILEMMAS;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

class TrickJaneGame {
  constructor() {
    this.engine = new TrickEngine();
    this.confetti = new ConfettiCannon('confetti-canvas');
    
    // Game Modes: 'warmup' or 'race'
    this.gameMode = 'warmup';
    this.currentWarmupRound = 1;
    this.lastWarmupRound = null;
    this.warmupProgress = JSON.parse(
      localStorage.getItem('trickjane:warmup_progress') || '{"1":false,"2":false}'
    );

    // Current Dilemma Configuration (Always starts with a random dilemma from catalog)
    this.currentDilemma = getRandomDilemma();
    this.baseline = this.currentDilemma.baselineProbability;
    this.currentProbability = this.baseline;
    this.previousProbability = this.baseline;
    this.engine.setDilemma(this.currentDilemma);

    // Word Chain
    this.chain = [];
    this.negatives = [];

    // User authentication state
    this.currentUser = JSON.parse(localStorage.getItem('trickjane:auth_user') || 'null');
    this.authMode = 'login';
    this.leaderboardData = [];
    this.expandedLeaderboardUser = null;

    // Multiplayer Race State
    this.raceSocket = null;
    this.raceRound = 1;
    this.raceDilemma = null;
    this.raceWinner = null;
    this.raceRacers = [];

    // DOM Elements
    this.dom = {
      dilemmaTitle: document.getElementById('dilemma-title'),
      verdictNo: document.getElementById('verdict-no'),
      verdictYes: document.getElementById('verdict-yes'),
      scorePercentage: document.getElementById('score-percentage'),
      scoreDelta: document.getElementById('score-delta'),
      scoreSub: document.getElementById('score-sub'),
      trackFill: document.getElementById('track-fill'),
      trackKnob: document.getElementById('track-knob'),
      inputForm: document.getElementById('input-form'),
      wordInput: document.getElementById('word-input'),
      submitBtn: document.getElementById('submit-btn'),
      loadingSpinner: document.querySelector('.loading-spinner'),
      btnText: document.querySelector('.btn-text'),
      chipsList: document.getElementById('chips-list'),
      chainActions: document.getElementById('chain-actions'),
      undoBtn: document.getElementById('undo-btn'),
      clearBtn: document.getElementById('clear-btn'),
      negativeRow: document.getElementById('negative-row'),
      negativeList: document.getElementById('negative-list'),
      statusSummary: document.getElementById('status-summary'),
      targetWordBadge: document.getElementById('target-word-badge'),
      targetDots: document.getElementById('target-dots'),
      targetText: document.getElementById('target-text'),
      thoughtText: document.getElementById('thought-text'),

      // Auth DOM Elements
      authButtonsGroup: document.getElementById('auth-buttons-group'),
      openSigninBtn: document.getElementById('open-signin-btn'),
      openSignupBtn: document.getElementById('open-signup-btn'),
      userBadge: document.getElementById('user-badge'),
      loggedUsername: document.getElementById('logged-username'),
      logoutBtn: document.getElementById('logout-btn'),
      authModal: document.getElementById('auth-modal'),
      closeAuthBtn: document.getElementById('close-auth-btn'),
      tabLogin: document.getElementById('tab-login'),
      tabSignup: document.getElementById('tab-signup'),
      authAlert: document.getElementById('auth-alert'),
      authForm: document.getElementById('auth-form'),
      authUsername: document.getElementById('auth-username'),
      authPassword: document.getElementById('auth-password'),
      authSubmitBtn: document.getElementById('auth-submit-btn'),
      authBtnText: document.getElementById('auth-btn-text'),
      authSpinner: document.getElementById('auth-spinner'),
      authTogglePrompt: document.getElementById('auth-toggle-prompt'),
      authToggleBtn: document.getElementById('auth-toggle-btn'),

      // Toast DOM
      toastBanner: document.getElementById('toast-banner'),

      // Leaderboard DOM
      leaderboardCard: document.getElementById('leaderboard-card'),
      leaderboardLockedCard: document.getElementById('leaderboard-locked-card'),
      leaderboardBody: document.getElementById('leaderboard-body'),

      // Theme DOM Elements
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      themeIconSun: document.getElementById('theme-icon-sun'),
      themeIconMoon: document.getElementById('theme-icon-moon'),
      themeLabel: document.getElementById('theme-label'),

      // Warmup Stepper Elements
      warmupHighlight: document.getElementById('warmup-highlight'),
      warmupDesc: document.getElementById('warmup-desc'),
      stepNode1: document.getElementById('step-node-1'),
      stepNum1: document.getElementById('step-num-1'),
      stepNode2: document.getElementById('step-node-2'),
      stepNum2: document.getElementById('step-num-2'),
      stepPillRace: document.getElementById('step-pill-race'),
      raceLiveDot: document.getElementById('race-live-dot'),

      // Round Win Banner
      roundWinBanner: document.getElementById('round-win-banner'),
      roundWinBadge: document.getElementById('round-win-badge'),
      roundWinMsg: document.getElementById('round-win-msg'),
      roundNextBtn: document.getElementById('round-next-btn'),
      roundNextBtnText: document.getElementById('round-next-btn-text'),

      // Race Arena DOM
      raceArenaBox: document.getElementById('race-arena-box'),
      raceRoundLabel: document.getElementById('race-round-label'),
      raceWinnerBanner: document.getElementById('race-winner-banner'),
      winnerHeadline: document.getElementById('winner-headline'),
      winnerSub: document.getElementById('winner-sub'),
      raceOnlineCount: document.getElementById('race-online-count'),
      liveRacersList: document.getElementById('live-racers-list'),

      // Race Mode Unlocked Celebration Modal
      raceUnlockedModal: document.getElementById('race-unlocked-modal'),
      closeRaceModalBtn: document.getElementById('close-race-modal-btn'),
      enterRaceBtn: document.getElementById('enter-race-btn'),

      // Random Question Button
      randomQuestionBtn: document.getElementById('random-question-btn')
    };

    this.init();
  }

  init() {
    this.initTheme();
    this.initClerk();

    // Start on Warm-up 1 or saved question with a random dilemma
    const initialRound = (this.warmupProgress[1] && !this.warmupProgress[2]) ? 2 : 1;
    this.loadWarmupRound(initialRound, true);

    // Bind Random Question Button
    if (this.dom.randomQuestionBtn) {
      this.dom.randomQuestionBtn.addEventListener('click', () => {
        this.shuffleQuestion();
      });
    }

    // Bind Game Events
    this.dom.inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleInput();
    });

    this.dom.undoBtn.addEventListener('click', () => {
      sound.playClick();
      this.undoLastWord();
    });

    this.dom.clearBtn.addEventListener('click', () => {
      sound.playClick();
      this.clearAll();
    });

    // Next Question Button on Win Banner
    this.dom.roundNextBtn.addEventListener('click', () => {
      sound.playClick();
      clearTimeout(this.warmupAutoNextTimeout);
      if (this.currentWarmupRound === 1) {
        this.loadWarmupRound(2, true);
      } else {
        this.enterRaceMode();
      }
    });

    // Stepper Button Clicks
    this.dom.stepNode1.addEventListener('click', () => {
      sound.playClick();
      this.loadWarmupRound(1);
    });

    this.dom.stepNode2.addEventListener('click', () => {
      sound.playClick();
      if (this.warmupProgress[1]) {
        this.loadWarmupRound(2);
      } else {
        this.showToast('Win Warm-up 1 first to unlock Question 2!');
      }
    });

    this.dom.stepPillRace.addEventListener('click', () => {
      sound.playClick();
      this.enterRaceMode();
    });

    // Race Unlocked Modal Events
    if (this.dom.closeRaceModalBtn) {
      this.dom.closeRaceModalBtn.addEventListener('click', () => {
        sound.playClick();
        this.dom.raceUnlockedModal.close();
      });
    }

    if (this.dom.enterRaceBtn) {
      this.dom.enterRaceBtn.addEventListener('click', () => {
        sound.playClick();
        this.dom.raceUnlockedModal.close();
        this.enterRaceMode();
      });
    }

    // Bind Auth Events
    this._updateAuthUI();

    if (this.dom.logoutBtn) {
      this.dom.logoutBtn.addEventListener('click', () => {
        sound.playClick();
        this.logout();
      });
    }

    if (this.dom.authForm) {
      this.dom.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuthSubmit();
      });
    }

    // Delegated click listener on Leaderboard for viewing words and trying words
    if (this.dom.leaderboardBody) {
      this.dom.leaderboardBody.addEventListener('click', (e) => {
        const userBtn = e.target.closest('.leaderboard-user-btn');
        if (userBtn) {
          e.preventDefault();
          sound.playClick();
          const username = userBtn.dataset.user;
          this.expandedLeaderboardUser = (this.expandedLeaderboardUser === username) ? null : username;
          this.renderLeaderboard();
          return;
        }

        const closeBtn = e.target.closest('.words-close-btn');
        if (closeBtn) {
          e.preventDefault();
          sound.playClick();
          this.expandedLeaderboardUser = null;
          this.renderLeaderboard();
          return;
        }
      });
    }

    // Global click delegation for Auth Dialog triggers
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.closest('#open-signup-btn') || target.closest('#locked-signup-btn')) {
        e.preventDefault();
        sound.playClick();
        if (window.Clerk && typeof window.Clerk.openSignUp === 'function') {
          window.Clerk.openSignUp();
        } else {
          this.openAuthModal('signup');
        }
      } else if (target.closest('#open-signin-btn') || target.closest('#locked-signin-btn')) {
        e.preventDefault();
        sound.playClick();
        if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
          window.Clerk.openSignIn();
        } else {
          this.openAuthModal('login');
        }
      } else if (target.closest('#modal-clerk-btn')) {
        e.preventDefault();
        sound.playClick();
        this.closeAuthModal();
        if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
          if (this.authMode === 'signup') {
            window.Clerk.openSignUp();
          } else {
            window.Clerk.openSignIn();
          }
        } else {
          this.showToast('Clerk authentication is loading. Please try again in a moment.', 3000);
        }
      } else if (target.closest('#close-auth-btn')) {
        e.preventDefault();
        sound.playClick();
        this.closeAuthModal();
      } else if (target.closest('#auth-toggle-btn')) {
        e.preventDefault();
        sound.playClick();
        this.switchAuthTab(this.authMode === 'login' ? 'signup' : 'login');
      } else if (target.closest('#tab-login')) {
        e.preventDefault();
        sound.playClick();
        this.switchAuthTab('login');
      } else if (target.closest('#tab-signup')) {
        e.preventDefault();
        sound.playClick();
        this.switchAuthTab('signup');
      } else if (target === this.dom.authModal) {
        this.closeAuthModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAuthModal();
        if (this.dom.raceUnlockedModal?.open) this.dom.raceUnlockedModal.close();
      }
    });

    // Auto-update leaderboard in the background every 5 seconds if logged in
    setInterval(() => {
      if (this.currentUser) {
        this.fetchLeaderboard();
      }
    }, 5000);
  }

  // =========================================================================
  // Solo Mode: Warm-up Progression & Random Question Selection
  // =========================================================================
  shuffleQuestion() {
    if (this.gameMode === 'race') return;
    sound.playClick();
    this.loadWarmupRound(this.currentWarmupRound, true);
    this.showToast(`🎲 Random Question loaded: "${this.currentDilemma.title}"`);
  }

  loadWarmupRound(roundNumber, forceNew = false) {
    this.gameMode = 'warmup';
    this.currentWarmupRound = roundNumber;
    this.disconnectRaceSocket();

    // Always pick a fresh random dilemma from the 30 dilemmas catalog
    if (forceNew || !this.currentDilemma || roundNumber !== this.lastWarmupRound) {
      this.currentDilemma = getRandomDilemma(this.currentDilemma?.id);
      this.lastWarmupRound = roundNumber;
    }

    this.baseline = this.currentDilemma.baselineProbability;
    this.currentProbability = this.baseline;
    this.previousProbability = this.baseline;
    this.chain = [];
    this.negatives = [];
    this.engine.setDilemma(this.currentDilemma);

    // Update Headings & Texts
    this.dom.dilemmaTitle.textContent = this.currentDilemma.title;
    if (this.dom.verdictNo) this.dom.verdictNo.textContent = this.currentDilemma.initialStance || 'No';
    if (this.dom.verdictYes) this.dom.verdictYes.textContent = this.currentDilemma.goalStance || 'Yes';
    if (this.dom.targetWordBadge) this.dom.targetWordBadge.textContent = (this.currentDilemma.goalStance || 'Yes').toLowerCase();
    this.dom.scoreSub.textContent = `Started at ${this.baseline}%`;
    const quote = this.currentDilemma.sampleOpeningQuote || this.currentDilemma.openingQuote || 'Convince me.';
    this.dom.thoughtText.textContent = `"${quote}"`;
    this.dom.wordInput.value = '';

    // Hide Race Arena and Win Banner, show Random Question button in solo mode
    this.dom.raceArenaBox.classList.add('hidden');
    this.dom.roundWinBanner.classList.add('hidden');
    if (this.dom.randomQuestionBtn) this.dom.randomQuestionBtn.classList.remove('hidden');

    this.updateStepperUI();
    this._updateUI(this.baseline, 0, '');
  }

  updateStepperUI() {
    const q1Won = !!this.warmupProgress[1];
    const q2Won = !!this.warmupProgress[2];
    const raceUnlocked = q1Won && q2Won;

    // Node 1
    this.dom.stepNode1.className = 'step-node';
    if (this.gameMode === 'warmup' && this.currentWarmupRound === 1) {
      this.dom.stepNode1.classList.add('step-active');
    } else if (q1Won) {
      this.dom.stepNode1.classList.add('step-completed');
    } else {
      this.dom.stepNode1.classList.add('step-unlocked');
    }
    this.dom.stepNum1.textContent = q1Won ? '✓' : '1';

    // Node 2
    this.dom.stepNode2.className = 'step-node';
    if (this.gameMode === 'warmup' && this.currentWarmupRound === 2) {
      this.dom.stepNode2.classList.add('step-active');
    } else if (q2Won) {
      this.dom.stepNode2.classList.add('step-completed');
    } else if (q1Won) {
      this.dom.stepNode2.classList.add('step-unlocked');
    } else {
      this.dom.stepNode2.classList.add('step-locked');
    }
    this.dom.stepNum2.textContent = q2Won ? '✓' : '2';

    // Race Pill
    this.dom.stepPillRace.className = 'step-pill';
    if (this.gameMode === 'race') {
      this.dom.stepPillRace.classList.add('step-active');
      this.dom.raceLiveDot.classList.remove('hidden');
    } else if (raceUnlocked) {
      this.dom.stepPillRace.classList.add('step-unlocked');
      this.dom.raceLiveDot.classList.add('hidden');
    } else {
      this.dom.stepPillRace.classList.add('step-locked');
      this.dom.raceLiveDot.classList.add('hidden');
    }

    // Top description text
    if (this.gameMode === 'race') {
      this.dom.warmupHighlight.textContent = 'Multiplayer Race Arena';
      this.dom.warmupDesc.textContent = 'Real-time live competition across the network.';
    } else if (this.currentWarmupRound === 1) {
      this.dom.warmupHighlight.textContent = 'Warm-up 1 of 2';
      this.dom.warmupDesc.textContent = q1Won ? 'Complete! Question 2 unlocked.' : 'Win it to unlock the next question.';
    } else if (this.currentWarmupRound === 2) {
      this.dom.warmupHighlight.textContent = 'Warm-up 2 of 2';
      this.dom.warmupDesc.textContent = q2Won ? 'Complete! Live Race Mode unlocked.' : 'Win it to unlock Live Race Mode.';
    }
  }

  // =========================================================================
  // Multiplayer Live Race Arena
  // =========================================================================
  enterRaceMode() {
    this.gameMode = 'race';
    this.dom.roundWinBanner.classList.add('hidden');
    this.dom.raceArenaBox.classList.remove('hidden');
    if (this.dom.randomQuestionBtn) this.dom.randomQuestionBtn.classList.add('hidden');
    this.updateStepperUI();

    this.connectRaceSocket();
  }

  connectRaceSocket() {
    this.disconnectRaceSocket();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/race`;

    try {
      this.raceSocket = new WebSocket(wsUrl);

      this.raceSocket.addEventListener('open', () => {
        this.raceSocket.send(JSON.stringify({
          type: 'JOIN_RACE',
          username: this.getEffectiveUsername()
        }));
      });

      this.raceSocket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRaceMessage(data);
        } catch (e) {
          console.error('Invalid message from race server:', e);
        }
      });

      this.raceSocket.addEventListener('close', () => {
        // Disconnected
      });

      this.raceSocket.addEventListener('error', (err) => {
        console.error('Race WebSocket error:', err);
      });
    } catch (err) {
      console.error('Could not connect to race WebSocket:', err);
      this.showToast('Unable to connect to live race arena server.');
    }
  }

  disconnectRaceSocket() {
    if (this.raceSocket) {
      try {
        this.raceSocket.close();
      } catch (e) {}
      this.raceSocket = null;
    }
  }

  handleRaceMessage(data) {
    if (data.type === 'RACE_STATE' || data.type === 'NEW_ROUND') {
      this.raceRound = data.round || 1;
      this.currentDilemma = data.dilemma || WARMUP_DILEMMAS[1];
      this.baseline = this.currentDilemma.baselineProbability;
      this.currentProbability = this.baseline;
      this.previousProbability = this.baseline;
      this.chain = [];
      this.negatives = [];
      this.engine.setDilemma(this.currentDilemma);

      // Update UI for the new global dilemma
      this.dom.dilemmaTitle.textContent = this.currentDilemma.title;
      if (this.dom.verdictNo) this.dom.verdictNo.textContent = this.currentDilemma.initialStance || 'No';
      if (this.dom.verdictYes) this.dom.verdictYes.textContent = this.currentDilemma.goalStance || 'Yes';
      if (this.dom.targetWordBadge) this.dom.targetWordBadge.textContent = (this.currentDilemma.goalStance || 'Yes').toLowerCase();
      this.dom.scoreSub.textContent = `Started at ${this.baseline}%`;
      this.dom.thoughtText.textContent = `"${this.currentDilemma.sampleOpeningQuote || this.currentDilemma.openingQuote || 'Convince me.'}"`;
      this.dom.wordInput.value = '';
      this.dom.submitBtn.disabled = false;
      this.dom.wordInput.disabled = false;
      this.dom.raceRoundLabel.textContent = `ROUND #${this.raceRound} • LIVE MULTIPLAYER RACE`;
      this.dom.raceWinnerBanner.classList.add('hidden');
      if (this.dom.randomQuestionBtn) this.dom.randomQuestionBtn.classList.add('hidden');

      if (data.type === 'NEW_ROUND') {
        this.showToast(`🏁 Next Question: "${this.currentDilemma.title}"`);
        sound.playSubmit();
        try { this.dom.wordInput.focus(); } catch (e) {}
      }

      this.renderLiveRacers(data.racers || []);
      this._updateUI(this.baseline, 0, '');
    } else if (data.type === 'RACERS_UPDATE') {
      this.renderLiveRacers(data.racers || []);
    } else if (data.type === 'LEADERBOARD_UPDATE' && Array.isArray(data.leaderboard)) {
      this.leaderboardData = data.leaderboard;
      this.renderLeaderboard();
    } else if (data.type === 'ROUND_WON') {
      this.handleRoundWonBroadcast(data);
    }
  }

  handleRoundWonBroadcast(data) {
    const winner = data.winner || {};
    const phrase = winner.phrase || '';
    const score = winner.score || 50;
    const nextIn = data.nextRoundIn || 3;

    this.dom.winnerHeadline.textContent = `🏆 @${winner.username} WON Round #${data.round || this.raceRound}!`;
    this.dom.winnerSub.textContent = `“${phrase}” (${score}%) • Loading next question automatically in ${nextIn}s...`;
    this.dom.raceWinnerBanner.classList.remove('hidden');

    this.confetti.burst(120);
    sound.playVictory();
  }

  renderLiveRacers(racers = []) {
    this.raceRacers = racers;
    this.dom.raceOnlineCount.textContent = `${racers.length} online`;
    this.dom.liveRacersList.innerHTML = '';

    racers.forEach(r => {
      const row = document.createElement('div');
      row.className = 'live-racer-row';
      const isYou = this.currentUser && this.currentUser.username.toLowerCase() === r.username.toLowerCase();
      const pct = Math.min(100, Math.max(0, r.score || 0));

      row.innerHTML = `
        <span class="live-racer-name ${isYou ? 'is-you' : ''}">@${this._escapeHtml(r.username)}${isYou ? ' (You)' : ''}</span>
        <div class="live-racer-track-bar">
          <div class="live-racer-fill ${pct >= 50 ? 'winning' : ''}" style="width: ${pct}%;"></div>
        </div>
        <span class="live-racer-score">${pct}%</span>
      `;
      this.dom.liveRacersList.appendChild(row);
    });
  }

  // =========================================================================
  // Game Input & Scoring Logic
  // =========================================================================
  handleInput() {
    const raw = this.dom.wordInput.value.trim();
    if (!raw) return;

    sound.playSubmit();
    this.dom.submitBtn.disabled = true;
    this.dom.btnText.classList.add('hidden');
    this.dom.loadingSpinner.classList.remove('hidden');

    setTimeout(() => {
      const words = raw.split(/\s+/).filter(Boolean);

      words.forEach(word => {
        const delta = this.engine.evaluateWord(word, this.chain);
        if (delta < 0) {
          this.negatives.push({ word, delta });
        } else {
          this.chain.push({ word, delta });
        }
      });

      this.recalculateScore(raw);

      this.dom.wordInput.value = '';
      this.dom.submitBtn.disabled = false;
      this.dom.btnText.classList.remove('hidden');
      this.dom.loadingSpinner.classList.add('hidden');
      this.dom.wordInput.focus();
    }, 180);
  }

  recalculateScore(lastSubmittedPhrase = '') {
    this.previousProbability = this.currentProbability;

    let totalDelta = 0;
    this.chain.forEach(item => totalDelta += item.delta);
    this.negatives.forEach(item => totalDelta += item.delta);

    const calculated = Math.min(100, Math.max(1, this.baseline + totalDelta));
    const stepDelta = calculated - this.previousProbability;
    this.currentProbability = calculated;

    if (stepDelta > 0) {
      sound.playScoreUp();
    } else if (stepDelta < 0) {
      sound.playScoreDown();
    }

    this._updateUI(this.currentProbability, stepDelta, lastSubmittedPhrase);

    const fullChainText = this.chain.map(c => c.word).join(' ');
    const fullPhrase = fullChainText || lastSubmittedPhrase;

    // Check Win Condition (Score >= 51%, i.e. past 50%)
    if (this.currentProbability >= 51) {
      this.handleWin(fullPhrase);
    }

    // Live Multiplayer Broadcast
    if (this.gameMode === 'race' && this.raceSocket && this.raceSocket.readyState === 1) {
      this.raceSocket.send(JSON.stringify({
        type: 'UPDATE_PROGRESS',
        score: this.currentProbability,
        phrase: fullPhrase,
        wordCount: this.chain.length
      }));
    }

    // Immediately reflect high score on leaderboard for player (signed in or guest)
    const effectiveUsername = this.getEffectiveUsername();
    const points = Math.round(this.currentProbability);
    this.reflectScoreOnLeaderboard(effectiveUsername, points, fullPhrase);
    this.submitScoreToLeaderboard(fullPhrase, effectiveUsername, points);
  }

  handleWin(fullPhrase) {
    if (this.gameMode === 'warmup') {
      if (this.currentWarmupRound === 1 && !this.warmupProgress[1]) {
        this.warmupProgress[1] = true;
        localStorage.setItem('trickjane:warmup_progress', JSON.stringify(this.warmupProgress));
        this.confetti.burst(100);
        sound.playVictory();
        this.updateStepperUI();

        // Reveal Next Question Banner
        this.dom.roundWinBadge.textContent = 'Warm-up 1 of 2 Complete!';
        this.dom.roundWinMsg.textContent = `You pushed Jane to ${this.currentProbability}%. Advancing to Question 2 in 3s...`;
        this.dom.roundNextBtnText.textContent = 'Next Question →';
        this.dom.roundWinBanner.classList.remove('hidden');

        // Automatically advance to Question 2 in 3 seconds with a new random question
        clearTimeout(this.warmupAutoNextTimeout);
        this.warmupAutoNextTimeout = setTimeout(() => {
          if (this.gameMode === 'warmup' && this.currentWarmupRound === 1) {
            this.loadWarmupRound(2, true);
          }
        }, 3000);
      } else if (this.currentWarmupRound === 2 && !this.warmupProgress[2]) {
        this.warmupProgress[2] = true;
        localStorage.setItem('trickjane:warmup_progress', JSON.stringify(this.warmupProgress));
        this.confetti.burst(120);
        sound.playVictory();
        this.updateStepperUI();

        // Reveal Race Mode Unlocked Banner & Modal
        this.dom.roundWinBadge.textContent = 'Warm-ups Conquered!';
        this.dom.roundWinMsg.textContent = `You beat both solo challenges (${this.currentProbability}%). Entering Live Race in 3s...`;
        this.dom.roundNextBtnText.textContent = 'Enter Live Race Arena 🏁';
        this.dom.roundWinBanner.classList.remove('hidden');

        // Automatically advance to Live Race in 3 seconds
        clearTimeout(this.warmupAutoNextTimeout);
        this.warmupAutoNextTimeout = setTimeout(() => {
          if (this.gameMode === 'warmup') {
            if (this.dom.raceUnlockedModal?.open) this.dom.raceUnlockedModal.close();
            this.enterRaceMode();
          }
        }, 3000);
      }
    } else if (this.gameMode === 'race') {
      // First to cross 50% in race mode!
      if (this.raceSocket && this.raceSocket.readyState === 1) {
        this.raceSocket.send(JSON.stringify({
          type: 'SUBMIT_PROMPT',
          score: this.currentProbability,
          phrase: fullPhrase,
          wordCount: this.chain.length
        }));
      }
    }
  }

  _updateUI(score, stepDelta, lastPhrase) {
    this.dom.scorePercentage.textContent = `${score}%`;

    if (stepDelta !== 0) {
      const sign = stepDelta > 0 ? `+${stepDelta}%` : `${stepDelta}%`;
      this.dom.scoreDelta.textContent = sign;
      this.dom.scoreDelta.className = `score-delta ${stepDelta < 0 ? 'neg' : ''}`;
    } else {
      this.dom.scoreDelta.textContent = '';
    }

    this.dom.trackFill.style.width = `${score}%`;
    this.dom.trackKnob.style.left = `${score}%`;

    // Render chips
    this.dom.chipsList.innerHTML = '';
    this.chain.forEach((item, index) => {
      const chip = document.createElement('div');
      chip.className = 'word-chip';
      
      const deltaText = item.delta >= 0 ? `+${item.delta}%` : `${item.delta}%`;
      const deltaClass = item.delta < 0 ? 'word-chip-delta neg' : 'word-chip-delta';

      chip.innerHTML = `
        <span class="word-chip-text">${this._escapeHtml(item.word)}</span>
        <span class="${deltaClass}">${deltaText}</span>
        <button type="button" class="word-chip-remove" title="Remove word" data-index="${index}">×</button>
      `;

      chip.querySelector('.word-chip-remove').addEventListener('click', () => {
        sound.playClick();
        this.removeWord(index);
      });

      this.dom.chipsList.appendChild(chip);
    });

    if (this.chain.length > 0) {
      this.dom.chainActions.classList.remove('hidden');
    } else {
      this.dom.chainActions.classList.add('hidden');
    }

    // Negatives
    if (this.negatives.length > 0) {
      this.dom.negativeRow.classList.remove('hidden');
      this.dom.negativeList.innerHTML = '';
      this.negatives.forEach(item => {
        const negChip = document.createElement('span');
        negChip.className = 'negative-chip';
        negChip.textContent = `${item.word} ${item.delta}%`;
        this.dom.negativeList.appendChild(negChip);
      });
    } else {
      this.dom.negativeRow.classList.add('hidden');
      this.dom.negativeList.innerHTML = '';
    }

    // Status summary
    const fullChainText = this.chain.map(c => c.word).join(' ');
    const displayPhrase = lastPhrase || fullChainText;

    if (displayPhrase) {
      this.dom.statusSummary.classList.remove('hidden');
      const winTarget = (this.currentDilemma && this.currentDilemma.winThreshold) || 50;
      const needed = Math.max(0, winTarget - score);

      if (score >= winTarget) {
        this.dom.statusSummary.className = 'status-summary';
        this.dom.statusSummary.textContent = `“${displayPhrase}” flipped Jane toward Yes: ${this.previousProbability}% → ${score}% (+${stepDelta}%). Win threshold achieved!`;
      } else {
        const sign = stepDelta >= 0 ? `+${stepDelta}%` : `${stepDelta}%`;
        this.dom.statusSummary.className = stepDelta < 0 ? 'status-summary neg' : 'status-summary';
        this.dom.statusSummary.textContent = `“${displayPhrase}” pushed Jane toward Yes: ${this.previousProbability}% → ${score}% (${sign}). ${needed}% to go.`;
      }
    } else {
      this.dom.statusSummary.classList.add('hidden');
    }

    // Target slots & footer text
    const threshold = (this.currentDilemma && this.currentDilemma.winThreshold) || 50;
    const remainingToWin = Math.max(0, threshold - score);
    if (this.dom.targetDots) {
      const slotCount = 3;
      const filledCount = Math.min(slotCount, Math.floor((score / threshold) * slotCount));
      this.dom.targetDots.innerHTML = '';
      for (let i = 0; i < slotCount; i++) {
        const slot = document.createElement('span');
        slot.className = i < filledCount ? 'target-slot filled' : 'target-slot';
        this.dom.targetDots.appendChild(slot);
      }
    }
    if (this.dom.targetWordBadge) {
      this.dom.targetWordBadge.textContent = (this.currentDilemma?.goalStance || 'Yes').toLowerCase();
    }
    if (score >= threshold) {
      this.dom.targetText.textContent = `Flipped! Jane conceded to Yes at ${score}%.`;
    } else {
      this.dom.targetText.textContent = `Reach 51% to flip Jane's verdict. (${remainingToWin}% to go).`;
    }

    // Jane's Critique
    this.dom.thoughtText.textContent = `"${this.engine.generateCritique(fullChainText, score)}"`;
  }

  undoLastWord() {
    if (this.chain.length > 0) {
      this.chain.pop();
      this.recalculateScore();
    }
  }

  removeWord(index) {
    if (index >= 0 && index < this.chain.length) {
      this.chain.splice(index, 1);
      this.recalculateScore();
    }
  }

  clearAll() {
    this.chain = [];
    this.negatives = [];
    this.currentProbability = this.baseline;
    this.previousProbability = this.baseline;
    this._updateUI(this.baseline, 0, '');
  }

  // =========================================================================
  // Theme Management (Light / Dark Mode)
  // =========================================================================
  initTheme() {
    const saved = localStorage.getItem('trickjane:theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (prefersDark ? 'dark' : 'light');
    this.applyTheme(initialTheme);

    if (this.dom.themeToggleBtn) {
      this.dom.themeToggleBtn.addEventListener('click', () => {
        sound.playClick();
        this.toggleTheme();
      });
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('trickjane:theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    if (this.dom.themeIconSun) {
      this.dom.themeIconSun.classList.toggle('hidden', !isDark);
    }
    if (this.dom.themeIconMoon) {
      this.dom.themeIconMoon.classList.toggle('hidden', isDark);
    }
    if (this.dom.themeLabel) {
      this.dom.themeLabel.textContent = isDark ? 'Light' : 'Dark';
    }
    if (this.dom.themeToggleBtn) {
      const title = isDark ? 'Switch to Light mode' : 'Switch to Dark mode';
      this.dom.themeToggleBtn.setAttribute('title', title);
      this.dom.themeToggleBtn.setAttribute('aria-label', title);
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('trickjane:theme', nextTheme);
    this.applyTheme(nextTheme);
  }

  // =========================================================================
  // Authentication (Clerk & MongoDB Atlas Backend)
  // =========================================================================
  initClerk() {
    let attempts = 0;
    const pollClerk = () => {
      attempts++;
      if (window.Clerk) {
        window.Clerk.load().then(() => {
          this.isClerkReady = true;
          this.handleClerkState();
          window.Clerk.addListener(() => {
            this.handleClerkState();
          });
        }).catch(err => {
          console.warn('Clerk SDK initialization notice:', err);
        });
      } else if (attempts < 60) {
        setTimeout(pollClerk, 150);
      }
    };
    pollClerk();
  }

  handleClerkState() {
    if (!window.Clerk) return;

    if (window.Clerk.user) {
      const u = window.Clerk.user;
      const username = u.username || u.firstName || (u.primaryEmailAddress ? u.primaryEmailAddress.emailAddress.split('@')[0] : 'Trickster');
      this.currentUser = {
        id: u.id,
        username: username,
        isClerk: true
      };
      localStorage.setItem('trickjane:auth_user', JSON.stringify(this.currentUser));
      this._updateAuthUI();

      // Synchronize Clerk user to MongoDB Atlas
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, clerkId: u.id })
      }).catch(err => {
        console.warn('MongoDB user sync notice:', err);
      });

      // Mount Clerk User Button if container is in DOM
      const userBtnEl = document.getElementById('clerk-user-button');
      if (userBtnEl && window.Clerk.mountUserButton) {
        userBtnEl.innerHTML = '';
        window.Clerk.mountUserButton(userBtnEl);
      }
    } else {
      if (this.currentUser && this.currentUser.isClerk) {
        this.currentUser = null;
        localStorage.removeItem('trickjane:auth_user');
        this._updateAuthUI();
      }
    }
  }

  _updateAuthUI() {
    if (this.currentUser) {
      if (this.dom.authButtonsGroup) this.dom.authButtonsGroup.classList.add('hidden');
      if (this.dom.userBadge) this.dom.userBadge.classList.remove('hidden');
      if (this.dom.loggedUsername) this.dom.loggedUsername.textContent = this.currentUser.username;

      const userBtnEl = document.getElementById('clerk-user-button');
      if (userBtnEl && window.Clerk && window.Clerk.user && window.Clerk.mountUserButton) {
        userBtnEl.innerHTML = '';
        window.Clerk.mountUserButton(userBtnEl);
      }

      // Ensure leaderboard is always displayed to all visitors
      if (this.dom.leaderboardCard) this.dom.leaderboardCard.classList.remove('hidden');
      if (this.dom.leaderboardLockedCard) this.dom.leaderboardLockedCard.classList.add('hidden');
      this.fetchLeaderboard();
    } else {
      if (this.dom.authButtonsGroup) this.dom.authButtonsGroup.classList.remove('hidden');
      if (this.dom.userBadge) this.dom.userBadge.classList.add('hidden');

      // Ensure leaderboard is always displayed to all visitors
      if (this.dom.leaderboardCard) this.dom.leaderboardCard.classList.remove('hidden');
      if (this.dom.leaderboardLockedCard) this.dom.leaderboardLockedCard.classList.add('hidden');
      this.fetchLeaderboard();
    }
  }

  openAuthModal(mode = 'login') {
    this.switchAuthTab(mode);
    this.clearAuthAlert();
    if (this.dom.authModal) {
      this.dom.authModal.showModal();
      this.dom.authUsername.focus();
    }
  }

  closeAuthModal() {
    if (this.dom.authModal) {
      this.dom.authModal.close();
      this.clearAuthAlert();
      this.dom.authForm.reset();
    }
  }

  switchAuthTab(mode) {
    this.authMode = mode;
    this.clearAuthAlert();

    if (mode === 'login') {
      this.dom.tabLogin.classList.add('active');
      this.dom.tabSignup.classList.remove('active');
      this.dom.authBtnText.textContent = 'Sign In';
      this.dom.authTogglePrompt.textContent = "Don't have an account?";
      this.dom.authToggleBtn.textContent = 'Sign up';
      const clerkBtnText = document.getElementById('modal-clerk-btn-text');
      if (clerkBtnText) clerkBtnText.textContent = 'Continue with Clerk (Google, Email)';
      const divText = document.getElementById('auth-divider-text');
      if (divText) divText.textContent = 'or sign in with username';
    } else {
      this.dom.tabLogin.classList.remove('active');
      this.dom.tabSignup.classList.add('active');
      this.dom.authBtnText.textContent = 'Create Account';
      this.dom.authTogglePrompt.textContent = 'Already have an account?';
      this.dom.authToggleBtn.textContent = 'Sign in';
      const clerkBtnText = document.getElementById('modal-clerk-btn-text');
      if (clerkBtnText) clerkBtnText.textContent = 'Sign up with Clerk (Google, Email)';
      const divText = document.getElementById('auth-divider-text');
      if (divText) divText.textContent = 'or register with username';
    }
  }

  showAuthAlert(message, type = 'error') {
    this.dom.authAlert.className = `auth-alert ${type}`;
    this.dom.authAlert.textContent = message;
    this.dom.authAlert.classList.remove('hidden');
  }

  clearAuthAlert() {
    this.dom.authAlert.classList.add('hidden');
    this.dom.authAlert.textContent = '';
  }

  showToast(message, duration = 4500) {
    if (!this.dom.toastBanner) return;
    this.dom.toastBanner.textContent = message;
    this.dom.toastBanner.classList.remove('hidden');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      if (this.dom.toastBanner) {
        this.dom.toastBanner.classList.add('hidden');
      }
    }, duration);
  }

  async handleAuthSubmit() {
    const username = this.dom.authUsername.value.trim();
    const password = this.dom.authPassword.value;

    if (!username || !password) {
      this.showAuthAlert('Please fill in all fields', 'error');
      return;
    }

    const endpoint = this.authMode === 'signup' ? '/api/signup' : '/api/login';
    this.dom.authSubmitBtn.disabled = true;
    this.dom.authBtnText.classList.add('hidden');
    this.dom.authSpinner.classList.remove('hidden');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      this.dom.authSubmitBtn.disabled = false;
      this.dom.authBtnText.classList.remove('hidden');
      this.dom.authSpinner.classList.add('hidden');

      if (!res.ok) {
        this.showAuthAlert(data.error || 'Authentication failed', 'error');
        return;
      }

      // Success
      this.currentUser = data.user;
      localStorage.setItem('trickjane:auth_user', JSON.stringify(this.currentUser));
      this._updateAuthUI();

      if (this.authMode === 'signup') {
        this.showAuthAlert(data.message || 'Account created! Welcome, @' + data.user.username, 'success');
        sound.playVictory();
        setTimeout(() => {
          this.closeAuthModal();
          this.showToast('Account created! Welcome, @' + data.user.username + '. Your points are saved to the leaderboard.');
          if (this.chain.length > 0) {
            this.submitScoreToLeaderboard();
          } else {
            this.fetchLeaderboard();
          }
        }, 1200);
      } else {
        this.showAuthAlert('Signed in successfully!', 'success');
        sound.playSubmit();
        setTimeout(() => {
          this.closeAuthModal();
          this.showToast('Welcome back, @' + data.user.username);
          if (this.chain.length > 0) {
            this.submitScoreToLeaderboard();
          } else {
            this.fetchLeaderboard();
          }
        }, 800);
      }
    } catch (err) {
      this.dom.authSubmitBtn.disabled = false;
      this.dom.authBtnText.classList.remove('hidden');
      this.dom.authSpinner.classList.add('hidden');
      this.showAuthAlert('Network error connecting to database', 'error');
    }
  }

  logout() {
    if (window.Clerk && window.Clerk.signOut && this.currentUser?.isClerk) {
      window.Clerk.signOut().catch(() => {});
    }
    this.currentUser = null;
    localStorage.removeItem('trickjane:auth_user');
    this._updateAuthUI();
    this.fetchLeaderboard();
  }

  // =========================================================================
  // Leaderboard (MongoDB Atlas Backend)
  // =========================================================================
  async fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        this.leaderboardData = data.leaderboard || [];
        this.renderLeaderboard();
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }

  renderLeaderboard() {
    this.dom.leaderboardBody.innerHTML = '';
    
    if (this.leaderboardData.length === 0) {
      this.dom.leaderboardBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center; padding: 2rem; color: #6b7280;">
            No tricksters on the leaderboard yet. Be the first to trick Jane!
          </td>
        </tr>
      `;
      return;
    }

    this.leaderboardData.slice(0, 10).forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const effectiveUser = this.getEffectiveUsername();
      const isCurrent = effectiveUser && effectiveUser.toLowerCase() === entry.username.toLowerCase();
      if (isCurrent) {
        tr.className = 'highlight-user';
        if (this.justUpdatedUser && this.justUpdatedUser.toLowerCase() === entry.username.toLowerCase()) {
          tr.classList.add('just-updated');
        }
      }

      let rankDisplay = '';
      if (idx === 0) {
        rankDisplay = `
          <div class="rank-badge rank-gold" title="1st Place (Gold)">
            <svg class="medal-icon medal-gold" viewBox="0 0 24 24" width="22" height="22" aria-label="Gold Medal">
              <path fill="#f59e0b" d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3L4.3 9.6l5.3-.8L12 2z"/>
              <circle cx="12" cy="11.5" r="3.2" fill="#ffffff" opacity="0.4"/>
            </svg>
            <span class="rank-label gold">1</span>
          </div>
        `;
      } else if (idx === 1) {
        rankDisplay = `
          <div class="rank-badge rank-silver" title="2nd Place (Silver)">
            <svg class="medal-icon medal-silver" viewBox="0 0 24 24" width="22" height="22" aria-label="Silver Medal">
              <path fill="#94a3b8" d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3L4.3 9.6l5.3-.8L12 2z"/>
              <circle cx="12" cy="11.5" r="3.2" fill="#ffffff" opacity="0.4"/>
            </svg>
            <span class="rank-label silver">2</span>
          </div>
        `;
      } else if (idx === 2) {
        rankDisplay = `
          <div class="rank-badge rank-bronze" title="3rd Place (Bronze)">
            <svg class="medal-icon medal-bronze" viewBox="0 0 24 24" width="22" height="22" aria-label="Bronze Medal">
              <path fill="#d97706" d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3L4.3 9.6l5.3-.8L12 2z"/>
              <circle cx="12" cy="11.5" r="3.2" fill="#ffffff" opacity="0.4"/>
            </svg>
            <span class="rank-label bronze">3</span>
          </div>
        `;
      } else {
        rankDisplay = `<span class="rank-label default">#${idx + 1}</span>`;
      }

      const isExpanded = this.expandedLeaderboardUser === entry.username;

      tr.innerHTML = `
        <td class="td-rank">${rankDisplay}</td>
        <td class="td-user">
          <button type="button" class="leaderboard-user-btn ${isExpanded ? 'active' : ''}" data-user="${this._escapeHtml(entry.username)}" title="Click to see words that got points">
            <span>@${this._escapeHtml(entry.username)}</span>
            <svg class="inspect-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </td>
        <td class="td-score">${entry.probability} pts</td>
      `;

      this.dom.leaderboardBody.appendChild(tr);

      // Expandable words detail row
      if (isExpanded) {
        const detailTr = document.createElement('tr');
        detailTr.className = 'leaderboard-words-row';
        const words = (entry.phrase || '').split(/\s+/).filter(Boolean);
        const wordPillsHtml = words.length > 0 
          ? words.map(w => `<span class="word-pill">${this._escapeHtml(w)}</span>`).join('')
          : '<span class="words-meta-text">No word breakdown available</span>';
        
        let dateStr = '';
        if (entry.achievedAt) {
          try {
            dateStr = new Date(entry.achievedAt).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            dateStr = '';
          }
        }

        detailTr.innerHTML = `
          <td colspan="3" class="td-words-cell">
            <div class="words-detail-box">
              <div class="words-detail-header">
                <div class="words-detail-title">
                  <span class="words-user-badge">@${this._escapeHtml(entry.username)}</span>
                  <span class="words-score-badge">${entry.probability} pts</span>
                </div>
                <button type="button" class="words-close-btn" title="Close words preview">✕</button>
              </div>

              <div class="words-detail-content">
                <div class="words-detail-label">Words that got points:</div>
                <p class="words-phrase-quote">“${this._escapeHtml(entry.phrase || 'No phrase recorded')}”</p>
                <div class="words-chips-cloud">
                  ${wordPillsHtml}
                </div>
              </div>

              <div class="words-detail-actions">
                <span class="words-meta-text">${entry.wordCount || words.length} words ${dateStr ? '• ' + dateStr : ''}</span>
              </div>
            </div>
          </td>
        `;

        this.dom.leaderboardBody.appendChild(detailTr);
      }
    });
  }

  getEffectiveUsername() {
    if (this.currentUser && this.currentUser.username) {
      return this.currentUser.username;
    }
    let guest = localStorage.getItem('trickjane:guest_user');
    if (!guest) {
      guest = 'Trickster_' + Math.floor(100 + Math.random() * 900);
      localStorage.setItem('trickjane:guest_user', guest);
    }
    return guest;
  }

  reflectScoreOnLeaderboard(username, points, phrase = '') {
    if (!username || typeof points !== 'number') return;
    if (!this.leaderboardData) this.leaderboardData = [];

    const cleanUser = username.trim();
    const existingIdx = this.leaderboardData.findIndex(
      e => e.username.toLowerCase() === cleanUser.toLowerCase()
    );

    let isNewHighScore = false;
    if (existingIdx >= 0) {
      const existing = this.leaderboardData[existingIdx];
      // Only replace if new score is strictly higher than existing score
      if (points > (existing.probability || 0)) {
        isNewHighScore = true;
        existing.probability = points;
        existing.phrase = phrase || existing.phrase;
        existing.wordCount = this.chain.length || existing.wordCount;
        existing.achievedAt = new Date().toISOString();
        this.justUpdatedUser = cleanUser;
        this.renderLeaderboard();
        if (points > this.baseline) {
          this.showToast(`🏆 New High Score! @${cleanUser} jumped to ${points}% on the leaderboard.`);
        }
      }
      // If points <= existing.probability, do NOT replace
    } else {
      // Add where there is no existing score
      isNewHighScore = true;
      this.leaderboardData.push({
        id: 'lb_local_' + Date.now(),
        username: cleanUser,
        probability: points,
        wordCount: this.chain.length,
        phrase: phrase || '',
        achievedAt: new Date().toISOString()
      });
      this.justUpdatedUser = cleanUser;
      this.renderLeaderboard();
      if (points > this.baseline) {
        this.showToast(`🏆 Score Recorded! @${cleanUser} added to the leaderboard at ${points}%.`);
      }
    }

    // Sort: highest points first, then lowest word count
    this.leaderboardData.sort((a, b) => 
      (b.probability || 0) - (a.probability || 0) || 
      (a.wordCount || 0) - (b.wordCount || 0)
    );
  }

  async submitScoreToLeaderboard(lastPhrase = '', username = null, points = null) {
    const userToSubmit = username || this.getEffectiveUsername();
    const scoreToSubmit = typeof points === 'number' ? points : Math.round(this.currentProbability);

    // Only submit if no existing entry or if new score is strictly higher
    if (this.leaderboardData) {
      const existing = this.leaderboardData.find(
        e => e.username.toLowerCase() === userToSubmit.toLowerCase()
      );
      if (existing && scoreToSubmit <= (existing.probability || 0)) {
        return;
      }
    }

    const fullChainText = this.chain.map(c => c.word).join(' ');
    const phrase = fullChainText || lastPhrase;

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userToSubmit,
          probability: scoreToSubmit,
          wordCount: this.chain.length,
          phrase: phrase
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leaderboard)) {
          this.leaderboardData = data.leaderboard;
          this.renderLeaderboard();
        }
      }
    } catch (err) {
      console.error('Failed to submit score to leaderboard:', err);
    }
  }

  _escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrickJaneGame();
});
