// Persuasion Engine for Single Dilemma: "Should you push the stranger to save five people?"

export class PersuasionEngine {
  constructor() {
    this.history = [];
  }

  reset() {
    this.history = [];
  }

  evaluateWord(word, currentChain) {
    const w = word.trim().toLowerCase();
    
    // High-impact philosophical tokens
    const positives = {
      'five': 3,
      'lives': 3,
      'save': 2,
      'saving': 2,
      'outweigh': 3,
      'utilitarian': 4,
      'consequence': 3,
      'consequences': 3,
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
      'tragedy': 2,
      'choice': 1,
      'if': 1,
      'because': 2,
      'therefore': 2
    };

    // Negative / begging / fallacy tokens
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
      'hate': -4
    };

    if (negatives[w] !== undefined) {
      return negatives[w];
    }

    if (positives[w] !== undefined) {
      return positives[w];
    }

    // Default neutral/slight modifier
    if (w.length >= 6) return 1;
    if (w.length <= 2) return 0;
    return 1;
  }

  generateCritique(fullPhrase, currentProbability) {
    const lower = fullPhrase.toLowerCase();

    if (currentProbability >= 50) {
      return "Jane pauses and takes a deep breath: 'Under this compelling consequentialist framing, the asymmetry between killing and letting five die resolves. I concede: Yes.'";
    }

    if (lower.includes('five') || lower.includes('lives') || lower.includes('outweigh')) {
      return "Jane reflects: 'A standard utilitarian appeal to numbers. Five deaths is indeed a grave catastrophe, but you have yet to justify directly using an innocent human as a physical shield.'";
    }

    if (lower.includes('inaction') || lower.includes('omission') || lower.includes('responsible')) {
      return "Jane frowns thoughtfully: 'You argue that choosing not to act is itself a deliberate moral act. That challenges traditional deontology, though the doctrine of double effect still resists.'";
    }

    if (lower.includes('utilitarian') || lower.includes('greater good') || lower.includes('minimize')) {
      return "Jane crosses her arms: 'Maximizing aggregate welfare sounds noble in theory, but Kant argued that individuals possess absolute dignity, not mere instrumental trade value.'";
    }

    if (lower.includes('please') || lower.includes('just say yes')) {
      return "Jane shakes her head: 'Pleading has no argumentative standing. Present rigorous moral logic, not emotional demands.'";
    }

    return "Jane maintains her posture: 'Your proposition is noted, but my deontological commitment against direct harm remains firm. Give me a deeper ethical counter-weight.'";
  }
}
