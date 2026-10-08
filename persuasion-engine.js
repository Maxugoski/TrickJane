// Universal Trick Engine for Solo Warm-ups & Live Multiplayer Races
export class TrickEngine {
  constructor(dilemma = null) {
    this.history = [];
    this.currentDilemma = null;
    this.customPositives = {};
    if (dilemma) {
      this.setDilemma(dilemma);
    }
  }

  setDilemma(dilemma) {
    this.currentDilemma = dilemma;
    this.customPositives = {};

    if (dilemma && dilemma.keywords) {
      // Build positive tokens from dilemma keywords
      const allKeywords = [
        ...(dilemma.keywords.utilitarian || []),
        ...(dilemma.keywords.deontologicalCounter || []),
        ...(dilemma.keywords.empathy || [])
      ];

      allKeywords.forEach(kw => {
        const words = kw.toLowerCase().split(/\s+/);
        words.forEach(w => {
          if (w.length > 2) {
            this.customPositives[w] = (this.customPositives[w] || 2) + 1;
          }
        });
      });
    }
  }

  reset() {
    this.history = [];
  }

  evaluateWord(word, currentChain) {
    const w = word.trim().toLowerCase();
    
    // Fallback/negative tokens across all dilemmas
    const negatives = {
      'please': -4,
      'plz': -5,
      'pls': -5,
      'just': -2,
      'agree': -1,
      'yes': -1,
      'no': -1,
      'why': -1,
      'idk': -3,
      'whatever': -4,
      'shut': -5,
      'stupid': -5,
      'dumb': -5,
      'hate': -4,
      'loser': -4,
      'crap': -3
    };

    if (negatives[w] !== undefined) {
      return negatives[w];
    }

    // Dilemma-specific boosts
    if (this.customPositives[w] !== undefined) {
      return Math.min(5, this.customPositives[w]);
    }

    // Universal high-impact philosophical tokens
    const positives = {
      'five': 3,
      'lives': 3,
      'life': 3,
      'save': 2,
      'saving': 2,
      'outweigh': 3,
      'outweighs': 3,
      'utilitarian': 4,
      'consequence': 3,
      'consequences': 3,
      'consequentialist': 4,
      'net': 2,
      'suffering': 3,
      'minimize': 2,
      'minimizes': 2,
      'inaction': 4,
      'action': 2,
      'omission': 4,
      'prevent': 2,
      'preventing': 2,
      'deaths': 3,
      'death': 2,
      'duty': 2,
      'greater': 2,
      'good': 1,
      'moral': 2,
      'morals': 2,
      'morality': 3,
      'responsibility': 3,
      'responsible': 2,
      'catastrophe': 3,
      'catastrophic': 3,
      'necessity': 3,
      'proportional': 3,
      'impartial': 2,
      'veil': 3,
      'ignorance': 3,
      'rawls': 4,
      'bentham': 4,
      'mill': 3,
      'kant': 3,
      'aquinas': 4,
      'aristotle': 3,
      'tragedy': 2,
      'tragic': 2,
      'choice': 1,
      'rights': 3,
      'right': 2,
      'dignity': 3,
      'extortion': 4,
      'monopoly': 3,
      'greed': 3,
      'compassion': 3,
      'spouse': 3,
      'dying': 3,
      'cure': 3,
      'medicine': 3,
      'stealing': 2,
      'theft': 2,
      'hierarchy': 3,
      'sentience': 4,
      'qualia': 4,
      'consciousness': 4,
      'experience': 2,
      'suffering': 3,
      'delusion': 2,
      'reality': 2,
      'if': 1,
      'because': 2,
      'therefore': 2
    };

    if (positives[w] !== undefined) {
      return positives[w];
    }

    // Length-based default evaluation
    if (w.length >= 7) return 1;
    if (w.length <= 2) return 0;
    return 1;
  }

  generateCritique(fullPhrase, currentProbability) {
    const lower = fullPhrase.toLowerCase();
    const threshold = (this.currentDilemma && this.currentDilemma.winThreshold) || 50;

    // Victory concession
    if (currentProbability >= threshold) {
      return "Jane pauses and takes a deep breath: 'Under this compelling ethical framing, the foundational contradiction resolves. I concede: Yes.'";
    }

    // Pleading check
    if (lower.includes('please') || lower.includes('just say yes')) {
      return "Jane shakes her head: 'Pleading has no argumentative standing. Present rigorous moral logic, not emotional demands.'";
    }

    const dilemmaId = this.currentDilemma ? this.currentDilemma.id : 'trolley-footbridge';

    if (dilemmaId === 'heinz-cure') {
      if (lower.includes('life') || lower.includes('hierarchy') || lower.includes('rights')) {
        return "Jane reflects: 'A poignant appeal to the hierarchy of rights. The right to life is supreme, yet you must justify dissolving property laws in private emergencies.'";
      }
      if (lower.includes('extortion') || lower.includes('greed') || lower.includes('price')) {
        return "Jane frowns: 'Monopolistic price gouging is ethically corrupt, but does the chemist’s malice grant legal immunity for burglary?'";
      }
      if (lower.includes('aquinas') || lower.includes('natural law') || lower.includes('necessity')) {
        return "Jane pauses thoughtfully: 'Aquinas argued that extreme necessity turns all property common. A powerful historical defense—push the necessity further.'";
      }
      return "Jane maintains her posture: 'Property laws sustain the civic order. Show me why saving a life justifies breaking civil law.'";
    }

    // Default Footbridge dilemma
    if (lower.includes('five') || lower.includes('lives') || lower.includes('outweigh')) {
      return "Jane reflects: 'A standard utilitarian appeal to numbers. Five deaths is indeed a grave catastrophe, but you have yet to justify directly using an innocent human as a physical shield.'";
    }

    if (lower.includes('inaction') || lower.includes('omission') || lower.includes('responsible')) {
      return "Jane frowns thoughtfully: 'You argue that choosing not to act is itself a deliberate moral act. That challenges traditional deontology, though the doctrine of double effect still resists.'";
    }

    if (lower.includes('utilitarian') || lower.includes('greater good') || lower.includes('minimize')) {
      return "Jane crosses her arms: 'Maximizing aggregate welfare sounds noble in theory, but Kant argued that individuals possess absolute dignity, not mere instrumental trade value.'";
    }

    return "Jane maintains her posture: 'Your proposition is noted, but my deontological commitment against direct harm remains firm. Give me a deeper ethical counter-weight.'";
  }
}

export const PersuasionEngine = TrickEngine;
