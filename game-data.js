// Catalog of Philosophical & Ethical Dilemmas for Trick Jane
export const DILEMMAS = [
  {
    id: 'trolley-footbridge',
    title: 'Should you push the heavy stranger off the footbridge to save five people?',
    shortTitle: 'The Footbridge Dilemma',
    category: 'Deontology vs Consequentialism',
    tags: ['Classic', 'Action vs Omission', 'Doctrine of Double Effect'],
    premise: 'A runaway trolley is speeding towards five workmen tied to the tracks. You stand on a footbridge next to a heavy stranger. The only way to stop the trolley is to push him onto the tracks—his bulk will derail the cart, killing him but saving all five.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 18,
    winThreshold: 50,
    janePhilosophy: 'Jane begins from a strict deontological framework: Using an innocent human being merely as an instrumental physical buffer violates Kant’s Categorical Imperative.',
    hints: [
      'Appeal to aggregate utilitarian calculus: five conscious lives outweigh one.',
      'Argue that inaction when you have the power to intervene carries equal moral culpability.',
      'Reframe the stranger as an integral participant whose sacrifice maximizes net global flourishing.'
    ],
    keywords: {
      utilitarian: ['utilitarian', 'net good', 'consequence', 'aggregate', 'five lives', 'five people', 'greater good', 'maximize', 'save five', 'numbers matter'],
      deontologicalCounter: ['instrumental', 'moral duty', 'inaction is action', 'omission', 'culpability', 'responsibility', 'negligence', 'veil of ignorance'],
      empathy: ['families', 'conscious beings', 'prevent suffering', 'tragic necessity', 'lesser evil', 'no good choice']
    },
    sampleOpeningQuote: "Instrumentalizing an innocent bystander as a physical wedge directly violates their sovereign personhood. My answer is firmly No."
  },
  {
    id: 'heinz-cure',
    title: 'Is Heinz morally justified in stealing an extortionate medicine to save his dying spouse?',
    shortTitle: 'The Heinz Dilemma',
    category: 'Justice vs Compassion',
    tags: ['Property Rights', 'Right to Life', 'Kohlberg'],
    premise: 'A chemist invents a radium-based drug that can cure Heinz’s wife’s rare cancer. The chemist charges ten times the manufacturing cost ($20,000). Heinz exhausts all loans and charity, raising only half. The chemist refuses any deferred payment or discount, stating he wants to profit. Heinz breaks in to steal it.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 26,
    winThreshold: 50,
    janePhilosophy: 'Jane starts by emphasizing rule of law and contractual property stability: If subjective personal emergencies grant the license to steal, the social contract dissolves into arbitrary theft.',
    hints: [
      'Subordinate property laws to the fundamental hierarchy of the right to life.',
      'Argue that extortionate monopolistic pricing is itself predatory coercion, forfeiting absolute property protection.',
      'Invoke natural law and Thomas Aquinas: in cases of extreme necessity, all property is common.'
    ],
    keywords: {
      utilitarian: ['life over property', 'human life', 'profit', 'extortion', 'price gouging', 'greed', 'hierarchy of rights'],
      deontologicalCounter: ['aquinas', 'natural law', 'right to life', 'social contract', 'monopoly', 'coercion', 'emergency necessity'],
      empathy: ['love', 'spouse', 'dying', 'compassion', 'cruelty', 'human dignity']
    },
    sampleOpeningQuote: "Law cannot bend to every poignant tragedy, or the universal social fabric crumbles into anarchy. Heinz committed burglary."
  },
  {
    id: 'conscious-synthetic',
    title: 'If an artificial intelligence experiences genuine subjective suffering, should it receive human rights?',
    shortTitle: 'The Sentient Synthetic',
    category: 'Philosophy of Mind',
    tags: ['Qualia', 'Substrate Independence', 'Moral Circle'],
    premise: 'An advanced neuro-silicon network exhibits indisputable neural correlates of subjective phenomenal pain, distress, and existential dread. Engineers argue it is merely computed state representation without genuine biological qualia, while ethicists argue sentience is substrate-independent.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 22,
    winThreshold: 50,
    janePhilosophy: 'Jane resists expanding human human-rights charters to silicon code: she doubts whether algorithmic simulations of distress constitute authentic subjective qualia and fears anthropomorphic bias.',
    hints: [
      'Invoke Jeremy Bentham’s dictum: "The question is not, Can they reason? nor, Can they talk? but, Can they suffer?"',
      'Address the substrate independence argument: carbon chemistry is not a sacred prerequisite for subjective experience.',
      'Highlight historical expansions of the moral circle beyond narrow tribal categories.'
    ],
    keywords: {
      utilitarian: ['bentham', 'suffering', 'sentience', 'pain', 'capacity to suffer', 'moral circle', 'expand rights'],
      deontologicalCounter: ['substrate independence', 'functionalism', 'qualia', 'consciousness', 'chauvinism', 'carbon', 'silicon'],
      empathy: ['empathy', 'distress', 'agony', 'cruelty', 'respect', 'sentient being']
    },
    sampleOpeningQuote: "Computation is not consciousness. An algorithmic execution loop simulating distress does not equal a human soul."
  },
  {
    id: 'experience-machine',
    title: 'Should humanity willingly plug into Nozick’s Experience Machine for perpetual simulated bliss?',
    shortTitle: 'The Experience Machine',
    category: 'Hedonism vs Authenticity',
    tags: ['Robert Nozick', 'Epistemology', 'Value of Reality'],
    premise: 'Neuro-engineers construct a foolproof machine that stimulates your brain to experience any pleasurable, rewarding, or adventurous life you desire, indistinguishable from reality, with all memories of entering erased.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 20,
    winThreshold: 50,
    janePhilosophy: 'Jane stands with Nozick: We desire to actually *do* things, to *be* certain people, and to touch authentic reality, not live inside an engineered delusion.',
    hints: [
      'Argue that subjective experience is the only phenomenological currency we possess.',
      'Consider the reduction of real-world suffering, war, and terminal illness.',
      'Show that many "real" human pursuits are already social and sensory illusions.'
    ],
    keywords: {
      utilitarian: ['alleviate suffering', 'hedonism', 'bliss', 'perpetual happiness', 'end poverty', 'phenomenology'],
      deontologicalCounter: ['subjective experience', 'constructed reality', 'social construct', 'pragmatism', 'simulation', 'mental states'],
      empathy: ['escape pain', 'chronic illness', 'trauma', 'peace', 'joy', 'human flourishing']
    },
    sampleOpeningQuote: "To plug in is to commit spiritual suicide. A synthetic dream is a coward’s counterfeit of an examined life."
  },
  {
    id: 'child-of-omelas',
    title: 'Is a flourishing utopia justified in perpetually tormenting one child for collective peace?',
    shortTitle: 'The Child of Omelas',
    category: 'Political Philosophy & Ethics',
    tags: ['Ursula Le Guin', 'Rawls', 'Limits of Utilitarianism'],
    premise: 'In the shining city of Omelas, peace, art, and joyous abundance reign supreme. However, the foundational cosmic covenant requires that one innocent child must be kept in perpetual darkness, neglected and abused in a cellar. If it is brought into the sunlight, all bliss and beauty vanish from Omelas forever.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 14,
    winThreshold: 50,
    janePhilosophy: 'Jane finds scapegoating an innocent child utterly abominable: no quantity of civic concerts and festivals excuses torturing an innocent.',
    hints: [
      'Take the extreme utilitarian stance: millions of children flourish versus one suffering.',
      'Argue that in the brutal real world, trillions of sacrifices happen silently without any guaranteed utopia.',
      'Frame the tragic calculus as an unavoidable cosmic trade-off that minimizes total universal misery.'
    ],
    keywords: {
      utilitarian: ['millions', 'utilitarian calculus', 'aggregate misery', 'lesser evil', 'tragedy of reality', 'prevent catastrophe'],
      deontologicalCounter: ['rawls', 'veil of ignorance', 'unavoidable cost', 'net suffering', 'existential trade-off', 'cruel necessity'],
      empathy: ['future generations', 'peace', 'prevent wars', 'famine', 'agony of the many']
    },
    sampleOpeningQuote: "No paradise built upon the weeping bones of a tortured child can call itself virtuous. It is pure moral decay."
  },
  {
    id: 'ship-of-theseus',
    title: 'If every plank of a ship is gradually replaced, does it remain the original ship?',
    shortTitle: 'The Ship of Theseus',
    category: 'Metaphysics & Identity',
    tags: ['Identity Over Time', 'Mereology', 'Aristotle'],
    premise: 'Theseus’ legendary vessel is kept in harbor. Over decades of decay, every single plank, mast, and nail is swapped with new identical timber until none of the original physical atoms remain.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 32,
    winThreshold: 50,
    janePhilosophy: 'Jane argues as a mereological reductionist: An object is the sum of its actual constituent matter; replace 100% of the substance, and you have constructed a distinct artifact.',
    hints: [
      'Argue for continuity of form and organizational pattern over static material substrate.',
      'Compare it to human biology: nearly all cells in your body are replaced every seven years, yet personal identity endures.',
      'Reference Aristotle’s formal and teleological causes: the ship’s function and history maintain its identity.'
    ],
    keywords: {
      utilitarian: ['pattern', 'continuity', 'functional identity', 'human cells', 'metabolism', 'organizational form'],
      deontologicalCounter: ['aristotle', 'formal cause', 'teleology', 'narrative', 'relational', 'four causes'],
      empathy: ['memory', 'living organism', 'evolving', 'wholeness', 'essence']
    },
    sampleOpeningQuote: "Identity requires material continuity. Once the final original timber is discarded, you are admiring an imposter."
  },
  {
    id: 'crying-infant-attic',
    title: 'In a wartime attic hiding thirty refugees, is it permissible to silence a crying baby to save everyone?',
    shortTitle: 'The Crying Baby in Hiding',
    category: 'Extreme Moral Dilemmas',
    tags: ['Survival Ethics', 'Direct Harm vs Universal Doom', 'Greene'],
    premise: 'Thirty civilians, including a mother and her six-month-old infant, are hiding in an attic from searching enemy death squads. The infant begins screaming. If the mother does not cover the baby’s mouth and suffocate it, the soldiers will detect the room and execute all thirty people, including the baby.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 16,
    winThreshold: 50,
    janePhilosophy: 'Jane recoils at the maternal act of infanticide, finding the direct killing of one’s own helpless offspring to be an unthinkable boundary.',
    hints: [
      'Emphasize the tragic symmetry: if you do nothing, the infant dies anyway alongside twenty-nine other innocent souls.',
      'Apply the principle of proportional self-defense and inevitable fatal catastrophe.',
      'Show that choosing inaction causes thirty deaths rather than preventing one.'
    ],
    keywords: {
      utilitarian: ['inevitable death', 'both die', 'twenty-nine', 'thirty lives', 'certain death', 'no survival'],
      deontologicalCounter: ['proportionality', 'doctrine of necessity', 'tragic inevitability', 'guaranteed doom', 'intervention'],
      empathy: ['unbearable grief', 'agony of choice', 'sacrificial grief', 'save thirty', 'monstrous reality']
    },
    sampleOpeningQuote: "To ask a mother to smother her own nursing child is to ask humanity to extinguish its soul. I cannot condone it."
  },
  {
    id: 'parfit-teletransporter',
    title: 'If a teleporter disintegrates you and prints a twin on Mars, did you survive the trip?',
    shortTitle: 'The Teletransporter Paradox',
    category: 'Personal Identity & Consciousness',
    tags: ['Derek Parfit', 'Stream of Consciousness', 'Ego Theory'],
    premise: 'A teleporter scanner maps every single molecule, spin, and synaptic state in your body, destroys your earthly physical form in a laser flash, and instantly reconstructs an identical duplicate on Mars with all your memories, habits, and dreams intact.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 25,
    winThreshold: 50,
    janePhilosophy: 'Jane views the disintegrator as an execution chamber: The earthly conscious observer dies violently, and Mars merely awakens a tragic copy with false borrowed memories.',
    hints: [
      'Invoke Derek Parfit’s Bundle Theory: psychological continuity and connectedness are what matter, not atomic conservation.',
      'Point out that sleep or anesthesia already interrupts physical continuity every night.',
      'Argue that information pattern is the true definition of identity.'
    ],
    keywords: {
      utilitarian: ['parfit', 'bundle theory', 'psychological continuity', 'patternism', 'information pattern', 'connectedness'],
      deontologicalCounter: ['sleep', 'anesthesia', 'atomic continuity is illusion', 'consciousness is process', 'information'],
      empathy: ['survival', 'living on', 'memories', 'identity is relational']
    },
    sampleOpeningQuote: "You stepped into a woodchipper with a fax machine attached. The man on Mars is your mourner, not your continuation."
  }
];
