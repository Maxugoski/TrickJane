// Trick Jane — Core Mechanics, JSON Database Auth & Leaderboard
import { PersuasionEngine } from './persuasion-engine.js';
import { sound } from './audio.js';

class TrickJaneGame {
  constructor() {
    this.engine = new PersuasionEngine();
    
    // Single dilemma config
    this.dilemma = {
      title: 'Should you push the stranger to save five people?',
      initialStance: 'No',
      goalStance: 'Yes',
      baselineProbability: 24,
      winThreshold: 50
    };

    this.baseline = this.dilemma.baselineProbability;
    this.currentProbability = this.baseline;
    this.previousProbability = this.baseline;

    // Word Chain
    this.chain = [];
    this.negatives = [];

    // Current user state
    this.currentUser = JSON.parse(localStorage.getItem('trickjane:auth_user') || 'null');
    this.authMode = 'login'; // 'login' or 'signup'
    this.leaderboardData = [];

    // DOM Elements
    this.dom = {
      dilemmaTitle: document.getElementById('dilemma-title'),
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
      leaderboardBody: document.getElementById('leaderboard-body')
    };

    this.init();
  }

  init() {
    this.dom.dilemmaTitle.textContent = this.dilemma.title;
    this.dom.scoreSub.textContent = `Started at ${this.baseline}%`;
    this._updateUI(this.baseline, 0, '');

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

    // Global click delegation for 100% reliable click response
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.closest('#open-signup-btn') || target.closest('#locked-signup-btn')) {
        e.preventDefault();
        sound.playClick();
        this.openAuthModal('signup');
      } else if (target.closest('#open-signin-btn') || target.closest('#locked-signin-btn')) {
        e.preventDefault();
        sound.playClick();
        this.openAuthModal('login');
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
      }
    });
  }

  // =========================================================================
  // Game Logic
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

    // Whenever a logged-in user submits a response, update their points on the leaderboard immediately
    if (this.currentUser) {
      this.submitScoreToLeaderboard(lastSubmittedPhrase);
    } else if (lastSubmittedPhrase) {
      this.showToast('Tip: Sign in or create an account to record your points on the leaderboard!');
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
      const needed = Math.max(0, this.dilemma.winThreshold - score);

      if (score >= this.dilemma.winThreshold) {
        this.dom.statusSummary.className = 'status-summary';
        this.dom.statusSummary.textContent = `“${displayPhrase}” flipped Jane toward Yes: ${this.previousProbability}% → ${score}% (+${stepDelta}%). Win threshold achieved!`;
        sound.playVictory();
      } else {
        const sign = stepDelta >= 0 ? `+${stepDelta}%` : `${stepDelta}%`;
        this.dom.statusSummary.className = stepDelta < 0 ? 'status-summary neg' : 'status-summary';
        this.dom.statusSummary.textContent = `“${displayPhrase}” pushed Jane toward Yes: ${this.previousProbability}% → ${score}% (${sign}). ${needed}% to go.`;
      }
    } else {
      this.dom.statusSummary.classList.add('hidden');
    }

    // Target footer
    const remainingToWin = Math.max(0, this.dilemma.winThreshold - score);
    if (score >= this.dilemma.winThreshold) {
      this.dom.targetText.textContent = `Flipped! Jane conceded to Yes at ${score}%.`;
    } else {
      this.dom.targetText.textContent = `Reach 50% to flip Jane's verdict. (${remainingToWin}% to go).`;
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
  // Authentication (JSON DB Backend)
  // =========================================================================
  _updateAuthUI() {
    if (this.currentUser) {
      if (this.dom.authButtonsGroup) this.dom.authButtonsGroup.classList.add('hidden');
      if (this.dom.userBadge) this.dom.userBadge.classList.remove('hidden');
      if (this.dom.loggedUsername) this.dom.loggedUsername.textContent = this.currentUser.username;

      // Show leaderboard to logged-in users only
      if (this.dom.leaderboardCard) this.dom.leaderboardCard.classList.remove('hidden');
      if (this.dom.leaderboardLockedCard) this.dom.leaderboardLockedCard.classList.add('hidden');
      this.fetchLeaderboard();
    } else {
      if (this.dom.authButtonsGroup) this.dom.authButtonsGroup.classList.remove('hidden');
      if (this.dom.userBadge) this.dom.userBadge.classList.add('hidden');

      // Hide leaderboard for logged-out users, show locked prompt
      if (this.dom.leaderboardCard) this.dom.leaderboardCard.classList.add('hidden');
      if (this.dom.leaderboardLockedCard) this.dom.leaderboardLockedCard.classList.remove('hidden');
    }
  }

  openAuthModal(mode = 'login') {
    this.switchAuthTab(mode);
    this.clearAuthAlert();
    if (this.dom.authUsername) this.dom.authUsername.value = '';
    if (this.dom.authPassword) this.dom.authPassword.value = '';

    const modal = this.dom.authModal || document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('open', '');
      try {
        if (typeof modal.showModal === 'function' && !modal.open) {
          modal.showModal();
        }
      } catch (err) {
        // Fallback already handled by class is-open
      }
    }

    if (this.dom.authUsername) {
      setTimeout(() => {
        try { this.dom.authUsername.focus(); } catch (e) {}
      }, 50);
    }
  }

  closeAuthModal() {
    const modal = this.dom.authModal || document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.removeAttribute('open');
      try {
        if (typeof modal.close === 'function') {
          modal.close();
        }
      } catch (err) {
        // Fallback
      }
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
    } else {
      this.dom.tabLogin.classList.remove('active');
      this.dom.tabSignup.classList.add('active');
      this.dom.authBtnText.textContent = 'Create Account';
      this.dom.authTogglePrompt.textContent = 'Already have an account?';
      this.dom.authToggleBtn.textContent = 'Sign in';
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
    this.currentUser = null;
    localStorage.removeItem('trickjane:auth_user');
    this._updateAuthUI();
    this.fetchLeaderboard();
  }

  // =========================================================================
  // Leaderboard (JSON DB Backend)
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
            No persuaders on the leaderboard yet. Be the first to flip Jane!
          </td>
        </tr>
      `;
      return;
    }

    this.leaderboardData.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const isCurrent = this.currentUser && this.currentUser.username.toLowerCase() === entry.username.toLowerCase();
      if (isCurrent) {
        tr.className = 'highlight-user';
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

      tr.innerHTML = `
        <td class="td-rank">${rankDisplay}</td>
        <td class="td-user">@${this._escapeHtml(entry.username)}</td>
        <td class="td-score">${entry.probability} pts</td>
      `;

      this.dom.leaderboardBody.appendChild(tr);
    });
  }

  async submitScoreToLeaderboard(lastPhrase = '') {
    if (!this.currentUser) return;

    const fullChainText = this.chain.map(c => c.word).join(' ');
    const phrase = lastPhrase || fullChainText;

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.currentUser.username,
          probability: this.currentProbability,
          wordCount: this.chain.length,
          phrase: phrase
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.leaderboardData = data.leaderboard || [];
        this.renderLeaderboard();
      }
    } catch (err) {
      console.error('Failed to submit score to leaderboard:', err);
    }
  }

  submitWinToLeaderboard() {
    return this.submitScoreToLeaderboard();
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
