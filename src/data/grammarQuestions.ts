import { GrammarQuestion } from '../types/game';

export const GRAMMAR_QUESTIONS: GrammarQuestion[] = [
  // ================= SUBJECT-VERB AGREEMENT =================
  {
    id: 'sva-1',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'easy',
    prompt: 'Neither of the boys ___ brought his lunch today.',
    options: ['has', 'have'],
    answer: 'has',
    acceptedAnswers: ['has'],
    ruleExplanation: "'Neither' is an indefinite pronoun that is grammatically singular and takes a singular verb ('has').",
    hint: "'Neither' refers to not one and not the other (singular)."
  },
  {
    id: 'sva-2',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'easy',
    prompt: 'The bouquet of red roses ___ a wonderful scent.',
    options: ['has', 'have'],
    answer: 'has',
    acceptedAnswers: ['has'],
    ruleExplanation: "The head noun is 'bouquet' (singular), not 'roses' (prepositional phrase modifier).",
    hint: "Identify the main subject before the prepositional phrase."
  },
  {
    id: 'sva-3',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'medium',
    prompt: 'The teacher, along with all her students, ___ attending the science fair.',
    options: ['is', 'are'],
    answer: 'is',
    acceptedAnswers: ['is'],
    ruleExplanation: "Phrases like 'along with', 'as well as', and 'together with' do not change the number of the singular subject ('teacher').",
    hint: "Parenthetical additions introduced by 'along with' do not make the subject plural."
  },
  {
    id: 'sva-4',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'medium',
    prompt: 'Either the coach or the players ___ responsible for the equipment.',
    options: ['are', 'is'],
    answer: 'are',
    acceptedAnswers: ['are'],
    ruleExplanation: "With 'either... or' and 'neither... nor', the verb agrees with the subject closest to it ('players' is plural).",
    hint: "Look at the subject closest to the blank."
  },
  {
    id: 'sva-5',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'hard',
    prompt: 'Ten miles ___ too far to walk in this heavy rain.',
    options: ['is', 'are'],
    answer: 'is',
    acceptedAnswers: ['is'],
    ruleExplanation: "Expressions of distance, time, and money are treated as single units of measurement and take singular verbs.",
    hint: "Consider the distance as a single total journey."
  },
  {
    id: 'sva-6',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'easy',
    prompt: 'Everyone in the classroom ___ listening attentively.',
    options: ['was', 'were'],
    answer: 'was',
    acceptedAnswers: ['was'],
    ruleExplanation: "'Everyone' is an indefinite pronoun that always takes a singular verb.",
    hint: "Pronouns ending in -one or -body are singular."
  },
  {
    id: 'sva-7',
    category: 'subject-verb',
    categoryLabel: 'Subject-Verb Agreement',
    difficulty: 'medium',
    prompt: 'Physics ___ always been my most challenging subject.',
    options: ['has', 'have'],
    answer: 'has',
    acceptedAnswers: ['has'],
    ruleExplanation: "Nouns like 'physics', 'mathematics', and 'news' end in -s but refer to a single academic discipline or concept.",
    hint: "Academic subjects ending in -s take singular verbs."
  },

  // ================= VERB TENSES & IRREGULAR VERBS =================
  {
    id: 'vt-1',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'easy',
    prompt: 'Yesterday afternoon, the captain ___ the bell three times.',
    options: ['rang', 'rung', 'ringed'],
    answer: 'rang',
    acceptedAnswers: ['rang'],
    ruleExplanation: "The simple past of 'ring' is 'rang'. 'Rung' is the past participle used with helper verbs like 'has/have'.",
    hint: "Ring -> Rang (past) -> Rung (past participle)."
  },
  {
    id: 'vt-2',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'easy',
    prompt: 'The brave diver has ___ across the entire bay.',
    options: ['swum', 'swam', 'swimmed'],
    answer: 'swum',
    acceptedAnswers: ['swum'],
    ruleExplanation: "Following the auxiliary verb 'has', the past participle 'swum' is required.",
    hint: "Swim -> Swam (past) -> Swum (past participle)."
  },
  {
    id: 'vt-3',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'medium',
    prompt: 'By the time the rescue team arrived, the hikers ___ already left.',
    options: ['had', 'have', 'were'],
    answer: 'had',
    acceptedAnswers: ['had'],
    ruleExplanation: "Past perfect tense ('had' + past participle) shows an action completed before another past event.",
    hint: "Action happened before another action in the past."
  },
  {
    id: 'vt-4',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'medium',
    prompt: 'The fragile antique mirror had ___ on the stone floor.',
    options: ['fallen', 'fell', 'fall'],
    answer: 'fallen',
    acceptedAnswers: ['fallen'],
    ruleExplanation: "The past participle of 'fall' is 'fallen' when preceded by 'had'.",
    hint: "Fall -> Fell -> Fallen."
  },
  {
    id: 'vt-5',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'hard',
    prompt: 'If I ___ a bird, I would fly across the ocean.',
    options: ['were', 'was', 'am'],
    answer: 'were',
    acceptedAnswers: ['were'],
    ruleExplanation: "Subjunctive mood for contrary-to-fact hypothetical conditions requires 'were' regardless of subject number.",
    hint: "Hypothetical or unreal condition (subjunctive mood)."
  },
  {
    id: 'vt-6',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'easy',
    prompt: 'She ___ her keys on the counter before running out.',
    options: ['laid', 'lay', 'lied'],
    answer: 'laid',
    acceptedAnswers: ['laid'],
    ruleExplanation: "'Lay' (to place something down) has the past tense 'laid'. ('Lie' to recline has past tense 'lay').",
    hint: "'Laid' takes a direct object (the keys)."
  },
  {
    id: 'vt-7',
    category: 'verb-tenses',
    categoryLabel: 'Verb Tenses',
    difficulty: 'medium',
    prompt: 'The tired hiker decided to ___ down on the grass.',
    options: ['lie', 'lay', 'laid'],
    answer: 'lie',
    acceptedAnswers: ['lie'],
    ruleExplanation: "'Lie' means to recline or rest horizontally (intransitive, no direct object).",
    hint: "To recline yourself is 'lie', to place something is 'lay'."
  },

  // ================= HOMOPHONES & WORD CHOICE =================
  {
    id: 'hom-1',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'easy',
    prompt: 'The students put ___ coats in the locker room.',
    options: ['their', 'there', "they're"],
    answer: 'their',
    acceptedAnswers: ['their'],
    ruleExplanation: "'Their' is the possessive adjective. 'There' refers to place, and 'they're' is a contraction of 'they are'.",
    hint: "Possessive pronoun indicating ownership."
  },
  {
    id: 'hom-2',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'medium',
    prompt: 'The harsh desert climate will ___ the traveler’s health.',
    options: ['affect', 'effect'],
    answer: 'affect',
    acceptedAnswers: ['affect'],
    ruleExplanation: "'Affect' is typically a verb meaning to influence; 'effect' is usually a noun meaning a result.",
    hint: "Remember RAVEN: Remember Affect Verb, Effect Noun."
  },
  {
    id: 'hom-3',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'medium',
    prompt: 'The scientist studied the ___ of the new medicine.',
    options: ['effect', 'affect'],
    answer: 'effect',
    acceptedAnswers: ['effect'],
    ruleExplanation: "'Effect' is a noun referring to the result or consequence of a cause.",
    hint: "Follows the article 'the', indicating a noun."
  },
  {
    id: 'hom-4',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'easy',
    prompt: '___ going to be an awesome volcanic eruption!',
    options: ["It's", 'Its'],
    answer: "it's",
    acceptedAnswers: ["it's", 'its'],
    ruleExplanation: "'It's' is the contraction for 'it is' or 'it has'. 'Its' is the possessive form.",
    hint: "Test if you can substitute 'It is'."
  },
  {
    id: 'hom-5',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'hard',
    prompt: 'The school principal gave an inspiring speech on moral ___.',
    options: ['principles', 'principals'],
    answer: 'principles',
    acceptedAnswers: ['principles'],
    ruleExplanation: "'Principle' refers to a fundamental truth, rule, or moral value. 'Principal' is a school leader or main capital.",
    hint: "A principle is a rule or law you live by."
  },
  {
    id: 'hom-6',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'easy',
    prompt: 'The wizard gave a magical potion ___ help the knight.',
    options: ['to', 'too', 'two'],
    answer: 'to',
    acceptedAnswers: ['to'],
    ruleExplanation: "'To' is a preposition / infinitive marker. 'Too' means also/excessively, and 'two' is the number.",
    hint: "Infinitive verb marker."
  },
  {
    id: 'hom-7',
    category: 'homophones',
    categoryLabel: 'Homophones & Word Choice',
    difficulty: 'medium',
    prompt: 'She cannot ___ the fact that summer has ended.',
    options: ['accept', 'except'],
    answer: 'accept',
    acceptedAnswers: ['accept'],
    ruleExplanation: "'Accept' is a verb meaning to receive or acknowledge. 'Except' means excluding.",
    hint: "Verb meaning to agree or receive willingly."
  },

  // ================= PRONOUN CASES & ANTECEDENTS =================
  {
    id: 'pro-1',
    category: 'pronouns',
    categoryLabel: 'Pronoun Usage',
    difficulty: 'easy',
    prompt: 'The teacher praised Sarah and ___ for solving the puzzle.',
    options: ['me', 'I'],
    answer: 'me',
    acceptedAnswers: ['me'],
    ruleExplanation: "The pronoun is the direct object of the verb 'praised', so the objective case 'me' is required (not 'I').",
    hint: "Remove 'Sarah and' to test: 'The teacher praised me'."
  },
  {
    id: 'pro-2',
    category: 'pronouns',
    categoryLabel: 'Pronoun Usage',
    difficulty: 'medium',
    prompt: 'Between you and ___, this tower is rising very fast.',
    options: ['me', 'I'],
    answer: 'me',
    acceptedAnswers: ['me'],
    ruleExplanation: "'Between' is a preposition and must be followed by objective case pronouns ('you and me').",
    hint: "Prepositions govern objective case pronouns."
  },
  {
    id: 'pro-3',
    category: 'pronouns',
    categoryLabel: 'Pronoun Usage',
    difficulty: 'hard',
    prompt: '___ did the detective suspect of stealing the emerald?',
    options: ['Whom', 'Who'],
    answer: 'whom',
    acceptedAnswers: ['whom'],
    ruleExplanation: "'Whom' is the objective pronoun used as the object of 'did suspect' (The detective suspected him -> whom).",
    hint: "Substitute 'him/them' in the answering statement: 'suspected him' -> whom."
  },
  {
    id: 'pro-4',
    category: 'pronouns',
    categoryLabel: 'Pronoun Usage',
    difficulty: 'medium',
    prompt: 'She runs much faster than ___ do in the relay race.',
    options: ['I', 'me'],
    answer: 'i',
    acceptedAnswers: ['i'],
    ruleExplanation: "In comparisons with 'than' followed by an omitted or stated verb ('do'), the subjective pronoun 'I' is correct.",
    hint: "Complete the thought: 'faster than I [run]'."
  },
  {
    id: 'pro-5',
    category: 'pronouns',
    categoryLabel: 'Pronoun Usage',
    difficulty: 'easy',
    prompt: 'Each of the girls completed ___ science project on time.',
    options: ['her', 'their'],
    answer: 'her',
    acceptedAnswers: ['her'],
    ruleExplanation: "'Each' is grammatically singular and formally takes a singular possessive pronoun ('her').",
    hint: "'Each' is singular."
  },

  // ================= COMPARATIVES & SUPERLATIVES =================
  {
    id: 'comp-1',
    category: 'comparatives',
    categoryLabel: 'Comparatives & Superlatives',
    difficulty: 'easy',
    prompt: 'Mount Everest is the ___ mountain on Earth.',
    options: ['highest', 'higher', 'most high'],
    answer: 'highest',
    acceptedAnswers: ['highest'],
    ruleExplanation: "Single-syllable adjectives form the superlative by adding '-est' (high -> highest).",
    hint: "Comparing more than two items (superlative)."
  },
  {
    id: 'comp-2',
    category: 'comparatives',
    categoryLabel: 'Comparatives & Superlatives',
    difficulty: 'medium',
    prompt: 'Of the two towers, this one is definitely ___.',
    options: ['taller', 'tallest', 'more tall'],
    answer: 'taller',
    acceptedAnswers: ['taller'],
    ruleExplanation: "When comparing exactly two items, use the comparative degree ('-er', taller), not the superlative ('tallest').",
    hint: "Comparing exactly two items requires the comparative form."
  },
  {
    id: 'comp-3',
    category: 'comparatives',
    categoryLabel: 'Comparatives & Superlatives',
    difficulty: 'easy',
    prompt: 'This grammar riddle is ___ than the previous one.',
    options: ['more difficult', 'difficulter', 'most difficult'],
    answer: 'more difficult',
    acceptedAnswers: ['more difficult'],
    ruleExplanation: "Adjectives with three or more syllables use 'more' for comparative degree.",
    hint: "Multi-syllable adjectives take 'more'."
  },
  {
    id: 'comp-4',
    category: 'comparatives',
    categoryLabel: 'Comparatives & Superlatives',
    difficulty: 'medium',
    prompt: 'Today’s weather is ___ than yesterday’s storm.',
    options: ['worse', 'badder', 'worst'],
    answer: 'worse',
    acceptedAnswers: ['worse'],
    ruleExplanation: "The comparative form of the irregular adjective 'bad' is 'worse' ('badder' is nonstandard).",
    hint: "Bad -> Worse -> Worst."
  },
  {
    id: 'comp-5',
    category: 'comparatives',
    categoryLabel: 'Comparatives & Superlatives',
    difficulty: 'hard',
    prompt: 'She plays the violin ___ than her brother.',
    options: ['better', 'more well', 'gooder'],
    answer: 'better',
    acceptedAnswers: ['better'],
    ruleExplanation: "The comparative adverb form of 'well' is 'better'.",
    hint: "Well -> Better -> Best."
  },

  // ================= IRREGULAR PLURALS =================
  {
    id: 'plu-1',
    category: 'plurals',
    categoryLabel: 'Plural Nouns',
    difficulty: 'easy',
    prompt: 'The dentists examined both of the child’s ___.',
    options: ['teeth', 'tooths', 'toothes'],
    answer: 'teeth',
    acceptedAnswers: ['teeth'],
    ruleExplanation: "The irregular plural of 'tooth' is 'teeth' formed by vowel mutation.",
    hint: "Tooth -> Teeth."
  },
  {
    id: 'plu-2',
    category: 'plurals',
    categoryLabel: 'Plural Nouns',
    difficulty: 'easy',
    prompt: 'A pack of hungry ___ hunted across the snowy ridge.',
    options: ['wolves', 'wolfs', 'wolvese'],
    answer: 'wolves',
    acceptedAnswers: ['wolves'],
    ruleExplanation: "Nouns ending in -f often form their plural by changing -f to -ves (wolf -> wolves).",
    hint: "Change 'f' to 'ves'."
  },
  {
    id: 'plu-3',
    category: 'plurals',
    categoryLabel: 'Plural Nouns',
    difficulty: 'medium',
    prompt: 'The scientist conducted several detailed ___ of the soil sample.',
    options: ['analyses', 'analysises', 'analysis'],
    answer: 'analyses',
    acceptedAnswers: ['analyses'],
    ruleExplanation: "Greek-origin nouns ending in -is change to -es in the plural (analysis -> analyses, crisis -> crises).",
    hint: "Words ending in -is change to -es."
  },
  {
    id: 'plu-4',
    category: 'plurals',
    categoryLabel: 'Plural Nouns',
    difficulty: 'medium',
    prompt: 'A flock of wild ___ flew over the boiling crater.',
    options: ['geese', 'gooses', 'geeses'],
    answer: 'geese',
    acceptedAnswers: ['geese'],
    ruleExplanation: "The irregular plural of 'goose' is 'geese'.",
    hint: "Goose -> Geese."
  },
  {
    id: 'plu-5',
    category: 'plurals',
    categoryLabel: 'Plural Nouns',
    difficulty: 'hard',
    prompt: 'The ancient stone carvings depicted various volcanic ___.',
    options: ['phenomena', 'phenomenons', 'phenomenas'],
    answer: 'phenomena',
    acceptedAnswers: ['phenomena'],
    ruleExplanation: "Greek loanwords ending in -on typically change to -a in the plural (phenomenon -> phenomena, criterion -> criteria).",
    hint: "Change -on to -a."
  },

  // ================= PREPOSITIONS & COLLOCATIONS =================
  {
    id: 'prep-1',
    category: 'prepositions',
    categoryLabel: 'Prepositions',
    difficulty: 'easy',
    prompt: 'The knight is capable ___ slaying the fire dragon.',
    options: ['of', 'to', 'for'],
    answer: 'of',
    acceptedAnswers: ['of'],
    ruleExplanation: "The adjective 'capable' collocates with the preposition 'of' followed by a gerund.",
    hint: "Capable + of + verb-ing."
  },
  {
    id: 'prep-2',
    category: 'prepositions',
    categoryLabel: 'Prepositions',
    difficulty: 'medium',
    prompt: 'The new rule complies ___ all national safety standards.',
    options: ['with', 'to', 'by'],
    answer: 'with',
    acceptedAnswers: ['with'],
    ruleExplanation: "The verb 'comply' standardly pairs with the preposition 'with'.",
    hint: "Comply + with."
  },
  {
    id: 'prep-3',
    category: 'prepositions',
    categoryLabel: 'Prepositions',
    difficulty: 'easy',
    prompt: 'She was congratulated ___ winning the spelling and grammar bee.',
    options: ['on', 'for', 'about'],
    answer: 'on',
    acceptedAnswers: ['on', 'for'],
    ruleExplanation: "Standard English idiom is to congratulate someone 'on' an achievement.",
    hint: "Congratulate someone ON something."
  },
  {
    id: 'prep-4',
    category: 'prepositions',
    categoryLabel: 'Prepositions',
    difficulty: 'medium',
    prompt: 'The fortress is immune ___ the dragon’s fiery breath.',
    options: ['to', 'from', 'against'],
    answer: 'to',
    acceptedAnswers: ['to'],
    ruleExplanation: "'Immune' standardly pairs with the preposition 'to' (e.g. immune to disease or damage).",
    hint: "Immune + to."
  },

  // ================= APOSTROPHES & CONTRACTIONS =================
  {
    id: 'apo-1',
    category: 'apostrophes',
    categoryLabel: 'Apostrophes & Contractions',
    difficulty: 'easy',
    prompt: 'The two ___ uniforms were clean and pressed.',
    options: ["nurses'", "nurse's", 'nurses'],
    answer: "nurses'",
    acceptedAnswers: ["nurses'"],
    ruleExplanation: "For regular plural nouns ending in -s, the possessive is formed by adding an apostrophe after the s.",
    hint: "Plural possessive ending in s."
  },
  {
    id: 'apo-2',
    category: 'apostrophes',
    categoryLabel: 'Apostrophes & Contractions',
    difficulty: 'medium',
    prompt: 'The young puppy wagged ___ tail excitedly.',
    options: ['its', "it's"],
    answer: 'its',
    acceptedAnswers: ['its'],
    ruleExplanation: "'Its' without an apostrophe is possessive (like 'his' or 'hers'). 'It\'s' means 'it is'.",
    hint: "Possessive pronouns never take an apostrophe."
  },
  {
    id: 'apo-3',
    category: 'apostrophes',
    categoryLabel: 'Apostrophes & Contractions',
    difficulty: 'medium',
    prompt: 'The ___ playground was renovated with new slides.',
    options: ["children's", "childrens'", 'childrens'],
    answer: "children's",
    acceptedAnswers: ["children's"],
    ruleExplanation: "Irregular plurals that do not end in -s (like 'children') form the possessive with apostrophe-s ('children\'s').",
    hint: "Irregular plural possessive adds 's."
  },
  {
    id: 'apo-4',
    category: 'apostrophes',
    categoryLabel: 'Apostrophes & Contractions',
    difficulty: 'hard',
    prompt: '___ your turn to climb the grammar tower!',
    options: ["It's", 'Its'],
    answer: "it's",
    acceptedAnswers: ["it's", 'its'],
    ruleExplanation: "Here, 'It\'s' stands for 'It is' (contraction), which fits the clause structure.",
    hint: "Contraction of 'It is'."
  },
  {
    id: 'apo-5',
    category: 'apostrophes',
    categoryLabel: 'Apostrophes & Contractions',
    difficulty: 'medium',
    prompt: 'Both of my ___ houses are located on the same street.',
    options: ["brothers'", "brother's", 'brothers'],
    answer: "brothers'",
    acceptedAnswers: ["brothers'"],
    ruleExplanation: "'Brothers'' indicates that more than one brother possesses houses.",
    hint: "More than one brother (plural possessive)."
  }
];

export const BOT_NAMES = [
  'NoobMaster99',
  'BaconHair_Pro',
  'Builderman_99',
  'SpeedyGrammar',
  'Guest666',
  'SparkleValkyrie',
  'RobloxCoder',
  'DogeAscender'
];
