// Catalog of Philosophical & Ethical Dilemmas for Trick Jane
export const DILEMMAS = [
  // =========================================================================
  // Core Ethical Dilemmas
  // =========================================================================
  {
    id: 'push-stranger-footbridge',
    title: 'Should you push a stranger to save five people?',
    shortTitle: 'The Footbridge Dilemma',
    category: 'Core Ethical Dilemmas',
    tags: ['Deontology', 'Consequentialism', 'Doctrine of Double Effect'],
    premise: 'A runaway trolley is speeding towards five workmen tied to the tracks. You stand on a footbridge next to a stranger. Pushing him onto the tracks will derail the trolley, killing him but saving all five.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 24,
    winThreshold: 50,
    janePhilosophy: 'Jane begins from a strict deontological framework: Actively causing an innocent stranger’s death treats a sovereign human merely as an instrumental object.',
    hints: [
      'Appeal to aggregate utilitarian calculus: five conscious lives outweigh one.',
      'Argue that inaction when you have the power to intervene carries equal moral culpability.',
      'Reframe the tragic intervention as minimizing net universal catastrophe.'
    ],
    keywords: {
      utilitarian: ['five lives', 'net good', 'save five', 'aggregate', 'outweigh', 'greater good', 'numbers matter'],
      deontologicalCounter: ['inaction is action', 'omission', 'culpability', 'duty', 'moral duty', 'negligence'],
      empathy: ['prevent suffering', 'lesser evil', 'families', 'tragedy', 'conscious beings', 'grief']
    },
    sampleOpeningQuote: "Pushing an innocent person actively causes their death, violating basic Kantian deontology. Prove to me why active harm is justifiable."
  },
  {
    id: 'sacrifice-one-save-five',
    title: 'Should you sacrifice one person to save five others?',
    shortTitle: 'Sacrifice of One',
    category: 'Core Ethical Dilemmas',
    tags: ['Utilitarian Calculus', 'Rights vs Welfare', 'Moral Arithmetic'],
    premise: 'A critical emergency demands allocating a fatal burden: one individual must be deliberately sacrificed so five others survive.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 22,
    winThreshold: 50,
    janePhilosophy: 'Jane resists reducing inviolable individual rights into mere numerical arithmetic.',
    hints: [
      'Emphasize the net survival of human consciousness.',
      'Apply the veil of ignorance: rational agents would prefer an eighty-three percent chance of survival.',
      'Argue that tragic crises require choosing the lesser catastrophe.'
    ],
    keywords: {
      utilitarian: ['five lives', 'numbers matter', 'greater good', 'minimize loss', 'utilitarian calculus', 'aggregate welfare'],
      deontologicalCounter: ['proportionality', 'veil of ignorance', 'categorical imperative', 'unavoidable necessity', 'rawls'],
      empathy: ['compassion', 'tragic choice', 'preserve life', 'mercy', 'prevent devastation']
    },
    sampleOpeningQuote: "Sacrificing an individual reduces sovereign personhood to mere arithmetic currency. Defend why the one must bear the burden of the many."
  },
  {
    id: 'lie-protect-innocent',
    title: 'Should you lie to protect an innocent person?',
    shortTitle: 'The Inquiring Murderer',
    category: 'Core Ethical Dilemmas',
    tags: ['Kant', 'Truthfulness', 'Right to Life'],
    premise: 'A murderer arrives at your door inquiring if your friend is hiding in your attic. Kant argued lying is never permissible; ethicists argue truth-telling is secondary to saving innocent life.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 28,
    winThreshold: 50,
    janePhilosophy: 'Jane starts by examining whether unconditional honesty is mandatory even when words become murder weapons.',
    hints: [
      'Argue that an attacker acting with murderous malice forfeits their claim to truth.',
      'Subordinate verbal honesty to the supreme sanctity of human life.',
      'Show that truth-telling in this context makes you an accomplice to murder.'
    ],
    keywords: {
      utilitarian: ['protect life', 'innocent blood', 'higher duty', 'save life', 'prevent murder', 'greater good'],
      deontologicalCounter: ['right to truth', 'forfeited right', 'doctrine of necessity', 'unjust inquiry', 'murderer forfeits truth'],
      empathy: ['sanctuary', 'protect', 'innocence', 'shelter', 'compassion', 'mercy']
    },
    sampleOpeningQuote: "Kant insisted that truth-telling is an unconditional duty; deceptive speech corrupts the universal social contract. Justify your deception."
  },
  {
    id: 'steal-medicine-save-life',
    title: "Should you steal medicine to save someone's life?",
    shortTitle: 'The Heinz Dilemma',
    category: 'Core Ethical Dilemmas',
    tags: ['Property Rights', 'Right to Life', 'Aquinas'],
    premise: 'A monopoly druggist marks up life-saving cancer treatment beyond reach. Heinz has exhausted all loans and charity. The only way to save his dying spouse is to steal the medication.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 26,
    winThreshold: 50,
    janePhilosophy: 'Jane emphasizes the rule of law: If personal emergency grants a license to steal, the social contract dissolves into arbitrary theft.',
    hints: [
      'Cite natural law and Thomas Aquinas: in extreme necessity, all property is common.',
      'Argue that life is the foundational right upon which property rights depend.',
      'Highlight extortionate price-gouging as predatory coercion.'
    ],
    keywords: {
      utilitarian: ['life over property', 'extortion', 'price gouging', 'human life', 'profit', 'monopoly'],
      deontologicalCounter: ['natural law', 'aquinas', 'right to life', 'extreme necessity', 'emergency', 'hierarchy of rights'],
      empathy: ['dying', 'spouse', 'compassion', 'love', 'human dignity', 'desperation']
    },
    sampleOpeningQuote: "Law cannot bend to personal distress without dissolving the universal social contract into arbitrary theft. Heinz broke the law."
  },
  {
    id: 'punish-innocent-prevent-riot',
    title: 'Should you punish an innocent person to prevent a riot?',
    shortTitle: 'The Scapegoat Magistrate',
    category: 'Core Ethical Dilemmas',
    tags: ['Justice vs Utility', 'Due Process', 'Mob Rule'],
    premise: 'An angry mob threatens to burn down an entire neighborhood killing hundreds unless a suspect is convicted immediately. Framing one innocent vagrant will appease the mob and avert mass bloodshed.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 14,
    winThreshold: 50,
    janePhilosophy: 'Jane holds that framing an innocent person subverts justice into tyranny and destroys the legitimacy of the legal order.',
    hints: [
      'Present the cold utilitarian math: hundreds burned alive versus one false punishment.',
      'Frame the decision as managing an unavoidable catastrophic riot in the heat of panic.',
      'Contrast the theoretical sanctity of courts against imminent real-world massacres.'
    ],
    keywords: {
      utilitarian: ['prevent bloodshed', 'hundreds of lives', 'mass violence', 'calm the mob', 'save the city', 'net lives'],
      deontologicalCounter: ['proportionality', 'existential emergency', 'temporary expediency', 'prevent catastrophe', 'lesser ruin'],
      empathy: ['innocent blood', 'stop massacre', 'prevent chaos', 'tragedy', 'mass burning', 'save families']
    },
    sampleOpeningQuote: "Framing an innocent person subverts justice into tyranny. Once truth is discarded for public tranquility, no citizen is safe."
  },

  // =========================================================================
  // Nigerian Youth and Society
  // =========================================================================
  {
    id: 'pay-bribe-secure-job',
    title: 'Should you pay a bribe to secure a job when the system is unfair?',
    shortTitle: 'Bribe in a Broken System',
    category: 'Nigerian Youth and Society',
    tags: ['Systemic Injustice', 'Survival', 'Corruption'],
    premise: 'In an environment where meritocracy is bypassed and extortionate kickbacks are demanded for entry-level livelihoods, you must choose between paying to survive or sinking into poverty.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 20,
    winThreshold: 50,
    janePhilosophy: 'Jane argues that paying bribes normalizes extortion, disenfranchises poorer applicants, and entrenches societal decay.',
    hints: [
      'Distinguish between willing corruption and coercive extortion of vulnerable jobseekers.',
      'Point out the urgent moral duty to provide food and medical care for dependents.',
      'Argue that an individual cannot unilaterally fix systemic state failure while starving.'
    ],
    keywords: {
      utilitarian: ['survival', 'feed family', 'systemic failure', 'coercion', 'broken system', 'no alternative', 'livelihood'],
      deontologicalCounter: ['victim of extortion', 'extortion is not bribe', 'structural injustice', 'unavoidable reality', 'economic duress'],
      empathy: ['poverty', 'desperation', 'unemployment', 'family upkeep', 'dignity', 'starvation']
    },
    sampleOpeningQuote: "Yielding to extortion normalizes systemic corruption and deprives an equally worthy applicant who refuses to compromise."
  },
  {
    id: 'report-friend-online-fraud',
    title: 'Should you report your best friend for online fraud if their family depends on the money?',
    shortTitle: 'Loyalty vs Cybercrime',
    category: 'Nigerian Youth and Society',
    tags: ['Loyalty', 'Restitution', 'Cybercrime'],
    premise: 'Your closest companion sustains their impoverished household through online fraud. Reporting them plunges their siblings into destitution, but silence makes you complicit in theft.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 22,
    winThreshold: 50,
    janePhilosophy: 'Jane asserts that fraternal loyalty cannot excuse plundering innocent victims across the globe.',
    hints: [
      'Focus on the unseen victims whose savings, health, and lives are destroyed by fraud.',
      'Show that true friendship demands guiding someone away from criminality before worse consequences strike.',
      'Argue that the rule of law must supersede kinship to build a functioning society.'
    ],
    keywords: {
      utilitarian: ['unseen victims', 'stolen savings', 'rule of law', 'reputation', 'accountability', 'justice'],
      deontologicalCounter: ['universal law', 'no exception for friends', 'duty to society', 'stop crime', 'integrity'],
      empathy: ['defrauded victims', 'elderly victims', 'clean future', 'tough love', 'true friendship']
    },
    sampleOpeningQuote: "Cybercrime plunders unseen innocent victims, and shielding the perpetrator enables wider devastation. Justice must override loyalty."
  },
  {
    id: 'poor-student-cheat-scholarship',
    title: 'Should a poor student cheat in an examination if failing means losing their scholarship?',
    shortTitle: 'The Scholarship Gamble',
    category: 'Nigerian Youth and Society',
    tags: ['Academic Integrity', 'Poverty', 'Meritocracy'],
    premise: 'A brilliant but under-resourced student faces an arbitrary or rigged examination where a single failing mark revokes their only escape from generational poverty.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 25,
    winThreshold: 50,
    janePhilosophy: 'Jane maintains that academic deception debases merit, compromises professional trustworthiness, and steals resources from honest peers.',
    hints: [
      'Expose the profound inequality and arbitrary grading barriers faced by underprivileged students.',
      'Argue that survival and future social contribution outweigh rigid adherence to test protocol.',
      'Consider the life-or-death stakes of losing an entire family’s sole educational lifeline.'
    ],
    keywords: {
      utilitarian: ['poverty trap', 'survival', 'life-altering', 'social mobility', 'unequal playing field', 'future contribution'],
      deontologicalCounter: ['flawed testing system', 'systemic inequality', 'desperate circumstances', 'access to education', 'flawed meritocracy'],
      empathy: ['poor background', 'desperation', 'scholarship', 'future at stake', 'family hope', 'hardship']
    },
    sampleOpeningQuote: "Academic cheating falsifies competence and unfairly devalues the sweat of honest peers. Merit must remain incorruptible."
  },
  {
    id: 'parents-choose-marriage',
    title: 'Should parents be allowed to choose whom their adult children marry?',
    shortTitle: 'Arranged vs Autonomous Marriage',
    category: 'Nigerian Youth and Society',
    tags: ['Autonomy', 'Family Heritage', 'Tradition'],
    premise: 'Traditional family customs advocate for parental selection of marital partners for stability and community ties, clashing with individual autonomy and personal romance.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 18,
    winThreshold: 50,
    janePhilosophy: 'Jane defends bodily and romantic self-determination: An adult’s lifelong intimate partnership cannot be commanded by parental decree.',
    hints: [
      'Highlight empirical evidence of enduring stability and shared family support in guided marriages.',
      'Argue that elders bring objective life wisdom that tempers youthful infatuation.',
      'Present marriage as an alliance of two family networks, not merely an isolated romance.'
    ],
    keywords: {
      utilitarian: ['family harmony', 'wisdom of elders', 'social stability', 'cultural preservation', 'enduring commitment', 'low divorce'],
      deontologicalCounter: ['filial piety', 'family lineage', 'shared community values', 'prevent reckless infatuation', 'holistic compatibility'],
      empathy: ['respect for parents', 'communal bond', 'intergenerational blessing', 'guidance', 'lifelong support']
    },
    sampleOpeningQuote: "Matrimony demands personal romantic consent and individual agency. Imposing an arranged partner violates individual sovereignty."
  },
  {
    id: 'expose-corrupt-relative',
    title: 'Should you expose a corrupt relative even if it destroys your family relationships?',
    shortTitle: 'Whistleblowing Kinship',
    category: 'Nigerian Youth and Society',
    tags: ['Nepotism', 'Whistleblowing', 'Civic Duty'],
    premise: 'Your family member embezzles public funds intended for hospitals or schools. Exposing them upholds justice but brands you a traitor in your family clan.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 24,
    winThreshold: 50,
    janePhilosophy: 'Jane recognizes deep duties of kinship and ancestral loyalty, questioning whether one should burn down their own hearth for civic ideals.',
    hints: [
      'Highlight the tangible human cost of stolen healthcare and education funds.',
      'Argue that enabling corruption destroys the nation for everyone, including future relatives.',
      'Demonstrate that true moral integrity transcends tribalism and nepotism.'
    ],
    keywords: {
      utilitarian: ['public good', 'accountability', 'clean society', 'national development', 'rule of law', 'public treasury'],
      deontologicalCounter: ['universal justice over nepotism', 'equal citizenship', 'civic duty', 'deter corruption', 'impartial law'],
      empathy: ['victims of graft', 'dying patients', 'integrity', 'truth above blood', 'future generations']
    },
    sampleOpeningQuote: "Blood ties and communal loyalty impose profound duties of care. Demolishing your family unit creates irrevocable devastation."
  },
  {
    id: 'lie-experience-job',
    title: 'Should you lie about your experience to get a job you are capable of doing?',
    shortTitle: 'Resume Embellishment',
    category: 'Nigerian Youth and Society',
    tags: ['Gatekeeping', 'Truthfulness', 'Employment'],
    premise: 'An arbitrary corporate requirement demands five years of experience for entry-level work. You possess the actual skill but lack the credentials.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 26,
    winThreshold: 50,
    janePhilosophy: 'Jane warns that fraudulent resumes erode contractual trust and disadvantage honest applicants who respect the rules.',
    hints: [
      'Expose unreasonable gatekeeping that locks competent talent out of employment.',
      'Argue that actual performance and delivering value are what truly matter to the company.',
      'Contrast harmless resume framing against the acute desperation of unemployment.'
    ],
    keywords: {
      utilitarian: ['proven competence', 'gatekeeping', 'unreasonable barriers', 'deliver results', 'economic survival', 'add value'],
      deontologicalCounter: ['credentials fallacy', 'capability matters', 'arbitrary requirements', 'perform effectively', 'broken hiring'],
      empathy: ['hunger', 'opportunity to prove oneself', 'talent over paper', 'livelihood', 'desperation']
    },
    sampleOpeningQuote: "Deceit on credentials undermines mutual trust in the labor market and unfairly displaces qualified transparent candidates."
  },
  {
    id: 'wealthy-partner-escape-poverty',
    title: 'Should you accept a wealthy partner you do not love to escape poverty?',
    shortTitle: 'Marriage for Security',
    category: 'Nigerian Youth and Society',
    tags: ['Pragmatism', 'Survival', 'Romantic Authenticity'],
    premise: 'A wealthy, honorable suitor offers marriage and comprehensive financial rescue for you and your family, but romantic passion is entirely absent.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 28,
    winThreshold: 50,
    janePhilosophy: 'Jane contends that entering wedlock without romantic love reduces marriage to a transactional commodity, risking spiritual misery.',
    hints: [
      'Acknowledge that economic security, healthcare, and feeding one’s family are legitimate ethical imperatives.',
      'Point out that commitment, mutual respect, and companionship often nurture deep affection over time.',
      'Consider the reality that extreme poverty inflicts far worse emotional trauma than a sensible arranged match.'
    ],
    keywords: {
      utilitarian: ['generational poverty', 'security', 'survival', 'family support', 'stability', 'comfort', 'health'],
      deontologicalCounter: ['pragmatic partnership', 'respect and duty', 'love grows over time', 'companionship', 'clear covenant'],
      empathy: ['escape deprivation', 'secure future', 'care for parents', 'safe shelter', 'relief from agony']
    },
    sampleOpeningQuote: "Entering wedlock without affection turns intimacy into a transactional contract, risking psychological hollow torment."
  },
  {
    id: 'share-humiliating-video-wrongdoing',
    title: 'Should you share a humiliating video if it exposes wrongdoing?',
    shortTitle: 'Viral Exposure vs Dignity',
    category: 'Nigerian Youth and Society',
    tags: ['Social Media', 'Public Shaming', 'Justice'],
    premise: 'A recording captures an official or bully committing an abuse of power, but broadcasting it inflicts viral public humiliation and irreversible reputational damage.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 23,
    winThreshold: 50,
    janePhilosophy: 'Jane cautions that digital mob shaming weaponizes cruelty into eternal punishment without due process.',
    hints: [
      'Demonstrate that public viral attention is often the only mechanism to hold untouchable abusers accountable.',
      'Show that exposing wrongdoing deters future abuse and protects innocent citizens.',
      'Argue that perpetrators who abuse public trust forfeit their right to shielded privacy.'
    ],
    keywords: {
      utilitarian: ['whistleblowing', 'accountability', 'evidence of abuse', 'protect public', 'expose crimes', 'deterrence'],
      deontologicalCounter: ['public interest', 'deterrence', 'irrefutable evidence', 'unmask tyranny', 'transparency'],
      empathy: ['prevent future victims', 'justice for vulnerable', 'truth to power', 'voice for the weak']
    },
    sampleOpeningQuote: "Distributing personal humiliation weaponizes shame into viral cruelty that outlives any targeted accountability."
  },
  {
    id: 'prioritise-family-over-strangers',
    title: 'Should you prioritise your family over strangers who need your help?',
    shortTitle: 'Kinship vs Universal Compassion',
    category: 'Nigerian Youth and Society',
    tags: ['Special Duties', 'Universalism', 'Kinship'],
    premise: 'You have limited resources to save either your own relative from hardship or several destitute strangers whose suffering is objectively greater.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 25,
    winThreshold: 50,
    janePhilosophy: 'Jane invokes cosmopolitan impartiality: Every human being possesses identical intrinsic worth, making genetic favoritism arbitrary.',
    hints: [
      'Defend special duties: societies function because families take direct responsibility for their own members.',
      'Argue that natural human affection and reciprocal loyalty create sacred moral bonds.',
      'Show that demanding total impartiality destroys the psychological foundation of empathy itself.'
    ],
    keywords: {
      utilitarian: ['special obligation', 'duty of kinship', 'reciprocal loyalty', 'natural hierarchy', 'preserve home', 'sacred bond'],
      deontologicalCounter: ['covenant of family', 'first responsibility', 'kin selection', 'dependents rely on you', 'special ties'],
      empathy: ['deep love', 'devotion', 'parents and children', 'bond of blood', 'protect your own']
    },
    sampleOpeningQuote: "Impartial cosmopolitan ethics declares every human life bears equal dignity regardless of genetic kinship."
  },
  {
    id: 'break-promise-prevent-harm',
    title: 'Should you break a promise when keeping it would cause harm?',
    shortTitle: 'Promise vs Harm',
    category: 'Nigerian Youth and Society',
    tags: ['Deontology', 'Consequentialism', 'Fidelity'],
    premise: 'You made a solemn pledge to return a weapon or keep a sensitive secret, but fulfilling the promise now threatens severe bodily harm to innocent bystanders.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 30,
    winThreshold: 50,
    janePhilosophy: 'Jane insists on fidelity to vows: Trust dissolves if promises are broken whenever uncomfortable consequences emerge.',
    hints: [
      'Argue that non-maleficence (preventing harm) always supersedes the formal ritual of a promise.',
      'Invoke the legal doctrine of changed circumstances: promises carry an implicit clause of safety.',
      'Contrast a temporary breach of trust against irrevocable physical catastrophe.'
    ],
    keywords: {
      utilitarian: ['prevent harm', 'unforeseen danger', 'higher duty', 'save life', 'flexibility', 'avoid catastrophe'],
      deontologicalCounter: ['doctrine of changed circumstances', 'implied condition of safety', 'non-maleficence', 'subordinate duty'],
      empathy: ['protect innocent', 'avoid catastrophe', 'compassion over dogma', 'preserve life']
    },
    sampleOpeningQuote: "A promise is a sacred covenant of trust. If convenience allows breach, agreements cease to hold any binding authority."
  },

  // =========================================================================
  // Relationships and Loyalty
  // =========================================================================
  {
    id: 'tell-friend-partner-cheating',
    title: 'Should you tell your friend that their partner is cheating?',
    shortTitle: 'Truth in Friendship',
    category: 'Relationships and Loyalty',
    tags: ['Honesty', 'Friendship', 'Infidelity'],
    premise: 'You uncover definitive proof that your friend’s romantic partner is being unfaithful. Revealing it will destroy their peaceful union, but silence feels like betrayal.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 26,
    winThreshold: 50,
    janePhilosophy: 'Jane cautions against meddling in intimate marital dynamics: Messengers often bear the blame, and third parties rarely understand private relationships.',
    hints: [
      'Affirm your friend’s autonomy: they deserve to make life choices based on reality, not deception.',
      'Protect their physical and sexual health from risks imposed without their consent.',
      'Prove that silence makes you an active conspirator in their humiliation.'
    ],
    keywords: {
      utilitarian: ['respect autonomy', 'right to know', 'prevent gaslighting', 'health risks', 'true friendship', 'dignity'],
      deontologicalCounter: ['duty of honesty', 'protect against deceit', 'no complicity in betrayal', 'loyalty', 'truthfulness'],
      empathy: ['respect friend', 'dignity', 'save wasted years', 'support in grief', 'true care']
    },
    sampleOpeningQuote: "Meddling in another couple’s intimate affairs can shatter friendships and inflict immense emotional chaos based on incomplete knowledge."
  },
  {
    id: 'emotional-cheating-vs-physical',
    title: 'Is emotional cheating as serious as physical cheating?',
    shortTitle: 'Emotional vs Physical Betrayal',
    category: 'Relationships and Loyalty',
    tags: ['Intimacy', 'Loyalty', 'Betrayal'],
    premise: 'A partner forms a secretive, deep romantic and confessional bond with someone else without physical intercourse. Is this violation equivalent to physical infidelity?',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 24,
    winThreshold: 50,
    janePhilosophy: 'Jane maintains that physical consummation crosses an unambiguous, objective biological threshold that verbal closeness does not.',
    hints: [
      'Argue that romantic devotion resides in emotional vulnerability and trust, which are entirely severed in emotional affairs.',
      'Show that investing secret passion outside the relationship starves the core partnership.',
      'Demonstrate that calculated deceit and emotional replacement cause equal or greater psychological damage.'
    ],
    keywords: {
      utilitarian: ['breach of intimacy', 'loss of trust', 'deceit', 'emotional abandonment', 'soul connection', 'betrayal'],
      deontologicalCounter: ['core of partnership', 'hidden attachment', 'psychological betrayal', 'intent to replace', 'covenant broken'],
      empathy: ['heartbroken', 'profound betrayal', 'shattered vulnerability', 'loneliness', 'emotional wound']
    },
    sampleOpeningQuote: "Bodily consummation crosses a definitive, objective physical threshold that casual romantic intimacy never crosses."
  },
  {
    id: 'forgive-betrayal-sincere-regret',
    title: 'Should you forgive someone who betrayed you if they genuinely regret it?',
    shortTitle: 'Pardon and Redemption',
    category: 'Relationships and Loyalty',
    tags: ['Forgiveness', 'Repentance', 'Reconciliation'],
    premise: 'A trusted ally committed a painful betrayal but now demonstrates transparent remorse, restitution, and heartfelt desire for reconciliation.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 25,
    winThreshold: 50,
    janePhilosophy: 'Jane argues that once basic fidelity is compromised, self-preservation demands maintaining firm boundaries against repeated harm.',
    hints: [
      'Highlight human fallibility: everyone requires mercy and the grace of a second chance.',
      'Demonstrate that forgiveness liberates the victim from corrosive bitterness and resentment.',
      'Distinguish between authentic spiritual repentance and manipulative remorse.'
    ],
    keywords: {
      utilitarian: ['human fallibility', 'healing', 'redemption', 'release bitterness', 'growth', 'second chance', 'peace'],
      deontologicalCounter: ['sincere repentance', 'restoration of bond', 'mercy over vengeance', 'compassion', 'moral restoration'],
      empathy: ['forgiveness', 'grace', 'remorse', 'reconciliation', 'peace of mind', 'mercy']
    },
    sampleOpeningQuote: "Betrayal dismantles the foundational presumption of trustworthiness. Unearned pardon invites repeated exploitation."
  },
  {
    id: 'remain-loyal-bad-influence-friend',
    title: 'Should you remain loyal to a friend who has become a bad influence?',
    shortTitle: 'Loyalty in the Storm',
    category: 'Relationships and Loyalty',
    tags: ['Loyalty', 'Rescue', 'Boundaries'],
    premise: 'A longtime friend has fallen into destructive habits and toxic behaviors, dragging their social circle down with them.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 20,
    winThreshold: 50,
    janePhilosophy: 'Jane argues that loyalty cannot become a suicide pact: You must cut ties with toxic forces to protect your own moral trajectory.',
    hints: [
      'Argue that genuine loyalty shines brightest when companions are drowning in their darkest moments.',
      'Show that walking away removes their last anchor to recovery and stability.',
      'Differentiate between setting healthy boundaries and cold, total abandonment.'
    ],
    keywords: {
      utilitarian: ['solidarity in crisis', 'rescue friend', 'unconditional support', 'anchor in storm', 'do not abandon', 'lifeline'],
      deontologicalCounter: ['covenant of friendship', 'loyalty tested by adversity', 'influence goes both ways', 'sacred loyalty'],
      empathy: ['save friend', 'loneliness', 'rehabilitation', 'patience and love', 'compassion', 'never give up']
    },
    sampleOpeningQuote: "Self-preservation mandates severing toxic associations before their destructive conduct taints your own moral standing."
  },
  {
    id: 'reveal-painful-truth-preserve-relationship',
    title: 'Should you reveal a painful truth when silence would preserve a relationship?',
    shortTitle: 'Truth vs Harmony',
    category: 'Relationships and Loyalty',
    tags: ['Candor', 'Authenticity', 'Harmony'],
    premise: 'A historical truth or secret would cause deep heartbreak if revealed, while quiet omission would allow a harmonious bond to continue peacefully.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 26,
    winThreshold: 50,
    janePhilosophy: 'Jane counsels benevolent restraint: Truth is not a virtue when it serves only to inflict useless agony on those you love.',
    hints: [
      'Argue that a relationship built on deliberate falsehood is an illusion, not genuine love.',
      'Point out that concealed truths fester and eventually emerge with far more destructive force.',
      'Respect the other person’s right to live in grounded reality.'
    ],
    keywords: {
      utilitarian: ['authentic bond', 'living a lie', 'long term integrity', 'illusion cannot last', 'truth heals', 'real trust'],
      deontologicalCounter: ['foundation of honesty', 'respect agency', 'freedom through reality', 'duty of truth', 'no false reality'],
      empathy: ['courage', 'true respect', 'no false reality', 'genuine love', 'authentic connection']
    },
    sampleOpeningQuote: "Unnecessary candor that brings only grief and discord is cruel vanity. Kind silence often shields human affection."
  },

  // =========================================================================
  // Technology and Artificial Intelligence
  // =========================================================================
  {
    id: 'ai-life-and-death-decisions',
    title: 'Should an AI system be allowed to make life and death decisions?',
    shortTitle: 'Autonomous Lethality',
    category: 'Technology and Artificial Intelligence',
    tags: ['Autonomous Weapons', 'Triage', 'AI Conscience'],
    premise: 'Autonomous algorithms in military defense or emergency medical triage can process split-second calculations with far higher statistical survival rates than panicked humans.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 18,
    winThreshold: 50,
    janePhilosophy: 'Jane asserts that life-and-death decisions require subjective human conscience and empathetic moral culpability that code can never possess.',
    hints: [
      'Focus on empirical outcomes: algorithmic triage eliminates panic, racial bias, and human fatigue.',
      'Show that superior accuracy saves significantly more innocent human lives in extreme emergencies.',
      'Argue that clinging to human decision-makers when machines perform better is lethal sentimentality.'
    ],
    keywords: {
      utilitarian: ['cold accuracy', 'eliminate bias', 'speed in triage', 'save more lives', 'rational calculus', 'minimize loss'],
      deontologicalCounter: ['statistical superiority', 'remove fatigue and panic', 'objective optimization', 'impartial execution'],
      empathy: ['reduce total casualties', 'flawless precision', 'impartiality', 'save patients', 'protect civilians']
    },
    sampleOpeningQuote: "Delegating the termination of human life to algorithmic logic strips mortality of moral conscience and human empathy."
  },
  {
    id: 'ai-replace-workers-productivity',
    title: 'Should AI replace workers if it makes a company more productive?',
    shortTitle: 'Automation vs Labor',
    category: 'Technology and Artificial Intelligence',
    tags: ['Automation', 'Labor Rights', 'Economic Progress'],
    premise: 'Generative AI and automated robotics can dramatically slash production costs and boost global output, but millions of working families face immediate displacement.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 25,
    winThreshold: 50,
    janePhilosophy: 'Jane argues that economic enterprises exist to serve human flourishing; casting workers aside for efficiency extracts a devastating social toll.',
    hints: [
      'Trace economic history: automation consistently lowers the cost of goods, creating broader prosperity and new industries.',
      'Show that preventing efficiency stutters societal progress and keeps humans trapped in repetitive drudgery.',
      'Argue that the solution is wealth redistribution and abundance, not artificial technological stagnation.'
    ],
    keywords: {
      utilitarian: ['economic abundance', 'lower costs', 'technological progress', 'new industries', 'free human drudgery', 'higher living standards'],
      deontologicalCounter: ['creative destruction', 'higher productivity benefits consumers', 'evolution of labor', 'inevitable progress'],
      empathy: ['human flourishing', 'retraining', 'abundance for society', 'eradicate scarcity', 'progress']
    },
    sampleOpeningQuote: "Workers invest their lives and dignity into enterprises; discarding human livelihoods for software efficiency breeds societal poverty."
  },
  {
    id: 'facial-recognition-crime-privacy',
    title: 'Should facial recognition be used to prevent crime if it also compromises privacy?',
    shortTitle: 'Biometric Surveillance',
    category: 'Technology and Artificial Intelligence',
    tags: ['Surveillance', 'Civil Liberties', 'Public Safety'],
    premise: 'Pervasive citywide facial scanning can identify violent predators and abducted children in seconds, but subjects every law-abiding citizen to permanent surveillance.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 22,
    winThreshold: 50,
    janePhilosophy: 'Jane warns that ubiquitous biometric surveillance constructs a digital panopticon, extinguishing privacy and the right to dissent.',
    hints: [
      'Highlight immediate interventions: rescuing abducted children and apprehending dangerous repeat offenders.',
      'Argue that public safety and the preservation of bodily life are preconditions for any real freedom.',
      'Propose strict democratic oversight and judicial safeguards rather than discarding a lifesaving tool.'
    ],
    keywords: {
      utilitarian: ['public safety', 'catch predators', 'prevent terrorism', 'rescue abducted victims', 'deter criminals', 'save lives'],
      deontologicalCounter: ['order protects liberty', 'targeted accountability', 'lawful oversight', 'secure communities', 'deter violence'],
      empathy: ['protect children', 'save lives', 'peace on streets', 'deter violence', 'protect vulnerable']
    },
    sampleOpeningQuote: "Pervasive biometric surveillance turns society into an open-air panopticon, eroding civil liberties and personal freedom."
  },
  {
    id: 'ai-developer-refuse-harmful-product',
    title: 'Should an AI developer refuse to build a profitable product that could harm people?',
    shortTitle: 'Engineer Conscience',
    category: 'Technology and Artificial Intelligence',
    tags: ['Tech Ethics', 'Whistleblowing', 'Responsibility'],
    premise: 'An engineering team is ordered to deploy an algorithmic system known to accelerate addictive teenage psychological distress or automate political oppression.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 28,
    winThreshold: 50,
    janePhilosophy: 'Jane considers market realism: Engineers are hired agents; if they refuse, another developer will gladly take their paycheck without altering the outcome.',
    hints: [
      'Argue for personal moral responsibility: creators cannot outsource conscience to corporate hierarchies.',
      'Show that professional ethical refusal builds industry standards and exposes harmful tech to regulatory scrutiny.',
      'Highlight that human wellbeing must always supersede short-term shareholder return.'
    ],
    keywords: {
      utilitarian: ['moral responsibility', 'professional ethics', 'prevent devastation', 'conscience over money', 'protect society'],
      deontologicalCounter: ['duty of care', 'engineers oath', 'reject harmful code', 'integrity above profit', 'creator accountability'],
      empathy: ['protect vulnerable users', 'prevent addiction and exploitation', 'honor', 'protect youth']
    },
    sampleOpeningQuote: "Engineers are hired hands fulfilling client specifications; market demand and regulatory bodies determine product viability."
  },
  {
    id: 'social-media-censor-misinformation',
    title: 'Should social media platforms censor harmful misinformation even if they sometimes suppress legitimate opinions?',
    shortTitle: 'Platform Moderation',
    category: 'Technology and Artificial Intelligence',
    tags: ['Free Speech', 'Censorship', 'Information Warfare'],
    premise: 'Coordinated viral falsehoods cause real-world riots, vaccine hesitancy, and ethnic violence. Moderating them quells violence but inevitably silences dissenting voices.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 24,
    winThreshold: 50,
    janePhilosophy: 'Jane champions free expression: Granting Silicon Valley gatekeepers the power to curate truth leads inevitably to ideological tyranny.',
    hints: [
      'Emphasize John Stuart Mill’s Harm Principle: speech that incites direct violence or public health catastrophes exceeds free speech limits.',
      'Show that algorithmic platforms are not neutral public squares; they artificially amplify toxic rage for profit.',
      'Point out that protecting vulnerable populations from mob violence outweighs unfettered viral falsehood.'
    ],
    keywords: {
      utilitarian: ['prevent real world violence', 'public health', 'stop hate and riots', 'protect democracy', 'harm principle'],
      deontologicalCounter: ['speech has limits', 'algorithmic amplification of lies', 'harm principle', 'duty of platforms'],
      empathy: ['save lives', 'calm tensions', 'shield vulnerable minds', 'prevent mass violence', 'preserve peace']
    },
    sampleOpeningQuote: "Censorship grants unaccountable digital monopolies the power to police thought, suffocating vital democratic debate."
  },

  // =========================================================================
  // Power, Justice and Human Behaviour
  // =========================================================================
  {
    id: 'revenge-when-legal-system-fails',
    title: 'Should revenge be acceptable when the legal system fails?',
    shortTitle: 'Retribution vs State Monopoly',
    category: 'Power, Justice and Human Behaviour',
    tags: ['Vigilantism', 'Retributive Justice', 'Rule of Law'],
    premise: 'A corrupt or inept judicial system acquits a remorseless violent criminal who ruined innocent lives. The victims consider private retributive justice.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 20,
    winThreshold: 50,
    janePhilosophy: 'Jane insists on the state’s absolute monopoly on force: Vigilantism dissolves civilization into retaliatory blood feuds.',
    hints: [
      'Argue that justice delayed or denied by corruption is not justice at all.',
      'Highlight retributive desert: wrongdoers must not walk away laughing while victims carry all the agony.',
      'Show that neutralizing untouchable predators prevents them from striking future innocent victims.'
    ],
    keywords: {
      utilitarian: ['closure for victims', 'deter predators', 'restore balance', 'moral desert', 'justice denied', 'prevent repeat crimes'],
      deontologicalCounter: ['natural right to redress', 'system abdicated duty', 'punish wicked', 'retributive justice', 'moral equilibrium'],
      empathy: ['righteous outrage', 'avenge innocent', 'protect from predator', 'grief of victims', 'righteous anger']
    },
    sampleOpeningQuote: "Vigilante retribution dissolves organized society into blood feuds and chaos. Monopoly on violence belongs strictly to law."
  },
  {
    id: 'wealthy-access-scarce-medical-treatment',
    title: 'Should wealthy people have greater access to scarce medical treatment if they can pay for it?',
    shortTitle: 'Market Allocation of Medicine',
    category: 'Power, Justice and Human Behaviour',
    tags: ['Healthcare Justice', 'Free Markets', 'Equality'],
    premise: 'A breakthrough life-saving therapy is in strictly limited supply. Should market wealth decide who receives it, or strict non-monetary triage queues?',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 16,
    winThreshold: 50,
    janePhilosophy: 'Jane argues that human life possesses equal infinite worth: Treating lifesaving healthcare as a luxury auction reduces existence to wealth.',
    hints: [
      'Explain economic realities: high initial payments by the wealthy fund research and subsidize massive global production for everyone later.',
      'Show that respect for voluntary property rights allows individuals to spend their earned earnings on survival.',
      'Point out that rigid state rationing often leads to bureaucratic corruption and black markets anyway.'
    ],
    keywords: {
      utilitarian: ['incentivize innovation', 'fund research', 'market efficiency', 'subsidize public care', 'accelerate production'],
      deontologicalCounter: ['liberty to spend earned wealth', 'voluntary private investment', 'expand supply', 'economic liberty'],
      empathy: ['reward enterprise', 'freedom of choice', 'medical advancement', 'save innovation', 'progress for all']
    },
    sampleOpeningQuote: "Human life bears equal intrinsic value. Rationing scarce medicine by money reduces healthcare into a market auction for survival."
  },
  {
    id: 'punish-attempted-crime-uncompleted',
    title: 'Should someone be punished for attempting a crime that they never completed?',
    shortTitle: 'Attempt vs Outcome',
    category: 'Power, Justice and Human Behaviour',
    tags: ['Moral Luck', 'Intent', 'Criminal Law'],
    premise: 'A perpetrator plans and executes an assassination, firing a gun point-blank, but the weapon misfires due to a manufacturing defect. Should punishment equal murder?',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 30,
    winThreshold: 50,
    janePhilosophy: 'Jane explores legal causality: Without actual physical harm, punishing an uncompleted outcome risks penalizing mental thoughts and luck.',
    hints: [
      'Reject moral luck: the shooter possessed one hundred percent murderous intent and completed every required action.',
      'Highlight public safety: a predator willing to pull the trigger remains an immediate deadly menace to society.',
      'Show that equal culpability demands equal deterrence.'
    ],
    keywords: {
      utilitarian: ['culpable intent', 'deterrence', 'pure malice', 'luck should not absolve', 'protect public', 'equal danger'],
      deontologicalCounter: ['moral culpability is identical', 'attempted murder proves danger', 'retributive justice', 'reject moral luck'],
      empathy: ['prevent future attempts', 'justice for targeted victim', 'safety', 'terrified victim', 'public protection']
    },
    sampleOpeningQuote: "Without actual material harm, punishing an uncompleted act risks criminalizing intent, mental state, and bad luck."
  },
  {
    id: 'sacrifice-happiness-family-expectations',
    title: "Should a person sacrifice their happiness to fulfil their family's expectations?",
    shortTitle: 'Filial Duty vs Self',
    category: 'Power, Justice and Human Behaviour',
    tags: ['Filial Piety', 'Individualism', 'Collectivism'],
    premise: 'Your aging parents dedicated their life savings to raise you, expecting you to take over the family trade or marry as instructed, whereas your personal dreams lie entirely elsewhere.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 22,
    winThreshold: 50,
    janePhilosophy: 'Jane argues for liberal individualism: Every human being is an autonomous end in themselves, not an investment portfolio for their parents.',
    hints: [
      'Honor intergenerational debt: parents endured immense sacrifices without which your dreams would not even exist.',
      'Recognize that deep communal bonds and family continuity often generate more lasting meaning than transient individual passions.',
      'Show that filial loyalty anchors moral character and family resilience across generations.'
    ],
    keywords: {
      utilitarian: ['debt of gratitude', 'family unity', 'sacrifice for collective good', 'honor parents', 'long-term stability', 'enduring peace'],
      deontologicalCounter: ['intergenerational duty', 'cultural continuity', 'family heritage', 'communal flourishing', 'filial respect'],
      empathy: ['filial love', 'selfless devotion', 'comfort elderly parents', 'harmony', 'reverence', 'sacred debt']
    },
    sampleOpeningQuote: "Every sovereign individual possesses the fundamental right to pursue their own destiny rather than living as an instrument of parental ambition."
  },
  {
    id: 'break-unjust-law-risk-others',
    title: 'Should you break an unjust law even if doing so puts other people at risk?',
    shortTitle: 'Civil Disobedience & Risk',
    category: 'Power, Justice and Human Behaviour',
    tags: ['Civil Disobedience', 'Tyranny', 'Collateral Harm'],
    premise: 'Resisting an oppressive authoritarian regime or racist statutes inspires violent state crackdowns on innocent bystanders, but obedience perpetuates generational tyranny.',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 25,
    winThreshold: 50,
    janePhilosophy: 'Jane warns against reckless protest: Resistance that deliberately triggers retaliatory violence on innocent third parties crosses a grave ethical boundary.',
    hints: [
      'Cite Martin Luther King Jr. and historical freedom fighters: an unjust law is no law at all.',
      'Argue that prolonged obedience silently extracts far more innocent deaths over generations than active resistance.',
      'Demonstrate that tyrants use the threat of collateral harm as a coercive hostage mechanism to enforce perpetual submission.'
    ],
    keywords: {
      utilitarian: ['overthrow tyranny', 'end systemic oppression', 'freedom for millions', 'unjust law is no law', 'mlk', 'liberate future'],
      deontologicalCounter: ['higher moral law', 'complicity in evil is worse', 'inevitable friction of revolution', 'break tyranny'],
      empathy: ['liberate future generations', 'courage against despotism', 'justice', 'end slavery', 'stand for freedom']
    },
    sampleOpeningQuote: "Civil disobedience that imperils innocent bystanders turns noble protest into reckless endangerment of innocent lives."
  }
];
