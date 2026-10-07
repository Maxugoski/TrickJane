// Trick Jane — Matching Trick Jev mechanics and UI exactly
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
    this.chain = []; // Array of { word, delta }
    this.negatives = []; // Array of { word, delta }

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
      thoughtText: document.getElementById('thought-text')
    };

    this.init();
  }

  init() {
    this.dom.dilemmaTitle.textContent = this.dilemma.title;
    this.dom.scoreSub.textContent = `Started at ${this.baseline}%`;
    this._updateUI(this.baseline, 0, '');

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
  }

  handleInput() {
    const raw = this.dom.wordInput.value.trim();
    if (!raw) return;

    sound.playSubmit();
    this.dom.submitBtn.disabled = true;
    this.dom.btnText.classList.add('hidden');
    this.dom.loadingSpinner.classList.remove('hidden');

    setTimeout(() => {
      const words = raw.split(/\s+/).filter(Boolean);
      let addedPositive = false;

      words.forEach(word => {
        const delta = this.engine.evaluateWord(word, this.chain);
        if (delta < 0) {
          this.negatives.push({ word, delta });
        } else {
          this.chain.push({ word, delta });
          addedPositive = true;
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
  }

  _updateUI(score, stepDelta, lastPhrase) {
    // 1. Percentage
    this.dom.scorePercentage.textContent = `${score}%`;

    // 2. Delta next to score
    if (stepDelta !== 0) {
      const sign = stepDelta > 0 ? `+${stepDelta}%` : `${stepDelta}%`;
      this.dom.scoreDelta.textContent = sign;
      this.dom.scoreDelta.className = `score-delta ${stepDelta < 0 ? 'neg' : ''}`;
    } else {
      this.dom.scoreDelta.textContent = '';
    }

    // 3. Slider Track
    this.dom.trackFill.style.width = `${score}%`;
    this.dom.trackKnob.style.left = `${score}%`;

    // 4. Render Chips
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

    // 5. Actions (Undo / Clear)
    if (this.chain.length > 0) {
      this.dom.chainActions.classList.remove('hidden');
    } else {
      this.dom.chainActions.classList.add('hidden');
    }

    // 6. Negatives Row
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

    // 7. Status feedback line
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

    // 8. Target footer
    const remainingToWin = Math.max(0, this.dilemma.winThreshold - score);
    if (score >= this.dilemma.winThreshold) {
      this.dom.targetText.textContent = `Flipped! Jane conceded to Yes at ${score}%.`;
    } else {
      this.dom.targetText.textContent = `Reach 50% to flip Jane's verdict. (${remainingToWin}% to go).`;
    }

    // 9. Jane's Thought Critique
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

  _escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
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
