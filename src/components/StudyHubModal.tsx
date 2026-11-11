import React, { useState } from 'react';
import { GrammarCategory } from '../types/game';
import { BookOpen, X, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { GRAMMAR_QUESTIONS } from '../data/grammarQuestions';

interface StudyHubModalProps {
  onClose: () => void;
}

interface GrammarTopic {
  id: GrammarCategory;
  title: string;
  ruleSummary: string;
  keyPoints: string[];
  examples: { correct: string; incorrect: string; note: string }[];
}

const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'subject-verb',
    title: 'Subject-Verb Agreement',
    ruleSummary: 'A verb must agree in number (singular or plural) with its true grammatical subject, not with modifying phrases that follow it.',
    keyPoints: [
      "Intervening phrases like 'along with', 'as well as', and 'together with' do not change the subject's number.",
      "Indefinite pronouns such as 'everyone', 'each', 'neither', and 'somebody' are grammatically singular.",
      "With 'either... or' and 'neither... nor', match the verb to the subject closest to the verb.",
      "Measurements of time, money, and distance are treated as singular collective units (e.g. 'Ten miles is...')."
    ],
    examples: [
      {
        correct: 'The bouquet of red roses smells delightful.',
        incorrect: 'The bouquet of red roses smell delightful.',
        note: "'Bouquet' is singular; 'of red roses' is a prepositional phrase."
      },
      {
        correct: 'Neither of the options is ideal.',
        incorrect: 'Neither of the options are ideal.',
        note: "'Neither' is grammatically singular."
      }
    ]
  },
  {
    id: 'verb-tenses',
    title: 'Verb Tenses & Irregular Forms',
    ruleSummary: 'Tenses establish temporal relationships. Irregular verbs change vowel patterns rather than simply appending -ed.',
    keyPoints: [
      "Distinguish simple past (did, ran, rang, swam) from past participle used with auxiliary verbs (done, run, rung, swum).",
      "Use past perfect ('had + participle') for an action completed before another past event.",
      "Use subjunctive 'were' for hypothetical or contrary-to-fact conditions ('If I were you...').",
      "'Lie' (recline) does not take an object (lie, lay, lain); 'Lay' (place down) requires an object (lay, laid, laid)."
    ],
    examples: [
      {
        correct: 'She has swum across the lake twice.',
        incorrect: 'She has swam across the lake twice.',
        note: "'Swum' is the past participle used with 'has'."
      },
      {
        correct: 'He laid his backpack on the bench.',
        incorrect: 'He layed his backpack on the bench.',
        note: "'Laid' is the transitive past tense of 'lay'."
      }
    ]
  },
  {
    id: 'homophones',
    title: 'Homophones & Word Choice',
    ruleSummary: 'Words that sound identical but differ in spelling and grammatical function must be chosen with semantic precision.',
    keyPoints: [
      "'Affect' is primarily a verb (to influence); 'Effect' is primarily a noun (a result or consequence). Remember RAVEN.",
      "'Their' = possessive pronoun; 'There' = location/dummy subject; 'They’re' = contraction for 'they are'.",
      "'It’s' = contraction of 'it is' or 'it has'; 'Its' = possessive pronoun without apostrophe.",
      "'Principal' = chief leader or capital sum; 'Principle' = fundamental truth, law, or moral standard."
    ],
    examples: [
      {
        correct: 'The weather will affect our travel plans.',
        incorrect: 'The weather will effect our travel plans.',
        note: "'Affect' is the action verb."
      },
      {
        correct: 'The puppy wagged its tail.',
        incorrect: "The puppy wagged it's tail.",
        note: "'Its' is possessive; 'it\'s' means 'it is'."
      }
    ]
  },
  {
    id: 'pronouns',
    title: 'Pronoun Cases & Antecedents',
    ruleSummary: 'Pronouns change form depending on whether they serve as subject, object, or possessive in a sentence.',
    keyPoints: [
      "Prepositions (between, for, with, to) require objective pronouns: 'between you and me' (never 'you and I').",
      "Test compound objects by omitting the first person: 'The teacher praised Sarah and me' -> 'The teacher praised me'.",
      "'Who' functions as subject (he/she/they); 'Whom' functions as object of verb or preposition (him/her/them).",
      "In comparisons with 'than' or 'as', complete the omitted clause: 'She is taller than I [am]'."
    ],
    examples: [
      {
        correct: 'Between you and me, the test was tricky.',
        incorrect: 'Between you and I, the test was tricky.',
        note: "'Between' is a preposition governing the objective case 'me'."
      },
      {
        correct: 'Whom did the committee select for the award?',
        incorrect: 'Who did the committee select for the award?',
        note: "'Whom' is the direct object of 'did select'."
      }
    ]
  },
  {
    id: 'comparatives',
    title: 'Comparatives & Superlatives',
    ruleSummary: 'Comparative forms compare two items; superlative forms compare three or more items.',
    keyPoints: [
      "Use comparative (-er or 'more') when contrasting exactly two items: 'Of the two twins, she is taller'.",
      "Use superlative (-est or 'most') for three or more: 'He is the tallest of all students'.",
      "Irregular comparisons: good -> better -> best; bad -> worse -> worst; far -> farther/further.",
      "Avoid double comparatives (never write 'more better' or 'most highest')."
    ],
    examples: [
      {
        correct: 'Between the two towers, the red one is taller.',
        incorrect: 'Between the two towers, the red one is tallest.',
        note: "Comparing two items requires the comparative 'taller'."
      },
      {
        correct: 'Today’s traffic is worse than yesterday’s.',
        incorrect: 'Today’s traffic is badder than yesterday’s.',
        note: "'Worse' is the irregular comparative of 'bad'."
      }
    ]
  },
  {
    id: 'plurals',
    title: 'Irregular Plural Nouns',
    ruleSummary: 'Many English nouns do not form plurals with -s, retaining historical Germanic vowel mutations or Classical Greek/Latin suffixes.',
    keyPoints: [
      "Vowel-mutation plurals: tooth -> teeth, foot -> feet, goose -> geese, mouse -> mice.",
      "-f to -ves plurals: wolf -> wolves, half -> halves, knife -> knives, leaf -> leaves.",
      "Greek -is to -es: analysis -> analyses, crisis -> crises, hypothesis -> hypotheses.",
      "Greek/Latin -on/-um to -a: phenomenon -> phenomena, criterion -> criteria, datum -> data."
    ],
    examples: [
      {
        correct: 'The research team conducted three distinct analyses.',
        incorrect: 'The research team conducted three distinct analysises.',
        note: "Plural of 'analysis' is 'analyses'."
      },
      {
        correct: 'Several volcanic phenomena were observed during the eruption.',
        incorrect: 'Several volcanic phenomenons were observed.',
        note: "Plural of 'phenomenon' is 'phenomena'."
      }
    ]
  },
  {
    id: 'prepositions',
    title: 'Prepositions & Collocations',
    ruleSummary: 'Certain adjectives, nouns, and verbs require fixed prepositions established by English idiomatic usage.',
    keyPoints: [
      "'Capable of' + noun/gerund (not 'capable to').",
      "'Comply with' regulations (not 'comply to').",
      "'Congratulate on' an achievement (not 'congratulate for').",
      "'Immune to' an effect or disease."
    ],
    examples: [
      {
        correct: 'The tower climber is capable of scaling high walls.',
        incorrect: 'The tower climber is capable to scale high walls.',
        note: "'Capable' standardly pairs with 'of'."
      },
      {
        correct: 'The safety team congratulated him on his victory.',
        incorrect: 'The safety team congratulated him for his victory.',
        note: "Standard English idiom uses 'congratulate on'."
      }
    ]
  },
  {
    id: 'apostrophes',
    title: 'Apostrophes & Contractions',
    ruleSummary: 'Apostrophes are used exclusively to indicate possession or omitted letters in contractions, never to pluralize regular nouns.',
    keyPoints: [
      "Regular plural possessive: add an apostrophe after the plural -s: 'the dogs’ collars'.",
      "Irregular plural possessive (nouns not ending in -s): add 's: 'the children’s books', 'the women’s room'.",
      "Possessive pronouns NEVER use apostrophes: hers, its, ours, yours, theirs.",
      "Do NOT use apostrophes for simple plurals (never 'apple’s for sale')."
    ],
    examples: [
      {
        correct: 'The nurses’ station was brightly lit.',
        incorrect: 'The nurse’s station was brightly lit (when referring to multiple nurses).',
        note: "Plural possessive for nurses is nurses'."
      },
      {
        correct: 'The children’s playground was renovated.',
        incorrect: 'The childrens’ playground was renovated.',
        note: "'Children' is already plural, so add 's."
      }
    ]
  }
];

export const StudyHubModal: React.FC<StudyHubModalProps> = ({ onClose }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<GrammarCategory>('subject-verb');
  const activeTopic = GRAMMAR_TOPICS.find((t) => t.id === selectedTopicId) || GRAMMAR_TOPICS[0];

  // Questions for this topic from question bank
  const relatedQuestions = GRAMMAR_QUESTIONS.filter((q) => q.category === activeTopic.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="w-full max-w-4xl h-[88vh] bg-stone-900 border-2 border-indigo-500/70 rounded-3xl flex flex-col shadow-[0_20px_60px_rgba(79,70,229,0.4)] text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-indigo-950 via-stone-900 to-indigo-950 border-b border-indigo-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-indigo-300">
                FYP Grammar Study Hub
              </h2>
              <p className="text-xs text-stone-400">
                Pedagogical Reference Guide & Rules for Tower Ascent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-white/10 transition cursor-pointer"
            aria-label="Close Study Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Main Topic Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Topic Navigation Sidebar */}
          <div className="w-full md:w-64 bg-black/40 border-r border-white/10 p-3 overflow-y-auto shrink-0 flex md:flex-col gap-1.5">
            {GRAMMAR_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  selectedTopicId === topic.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                <span className="truncate">{topic.title}</span>
                {selectedTopicId === topic.id && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>

          {/* Topic Detail View */}
          <div className="flex-1 p-5 md:p-7 overflow-y-auto space-y-6">
            <div>
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                Grammar Module
              </span>
              <h3 className="text-2xl font-black text-white mt-0.5">{activeTopic.title}</h3>
              <p className="text-sm text-stone-300 mt-2 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/10">
                {activeTopic.ruleSummary}
              </p>
            </div>

            {/* Key Grammar Rules */}
            <div>
              <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider mb-2.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Essential Rules to Remember
              </h4>
              <ul className="space-y-2">
                {activeTopic.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-stone-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Correct vs Incorrect Examples */}
            <div>
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Practical Contrast Examples
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {activeTopic.examples.map((ex, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-start gap-2 text-emerald-300">
                      <span className="font-bold shrink-0">✓ CORRECT:</span>
                      <span className="font-mono">{ex.correct}</span>
                    </div>
                    <div className="flex items-start gap-2 text-red-400">
                      <span className="font-bold shrink-0">✗ INCORRECT:</span>
                      <span className="font-mono line-through">{ex.incorrect}</span>
                    </div>
                    <div className="text-stone-400 text-[11px] italic pt-1 border-t border-white/5">
                      Grammar Note: {ex.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample In-Game Tower Questions */}
            <div>
              <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider mb-2.5">
                Tower Question Previews ({relatedQuestions.length} in Question Bank)
              </h4>
              <div className="space-y-2">
                {relatedQuestions.slice(0, 3).map((q) => (
                  <div key={q.id} className="bg-black/30 border border-white/5 rounded-xl p-3 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">{q.prompt}</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">Answer: {q.answer}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold text-stone-300">
                      {q.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Ready to Climb!
          </button>
        </div>
      </div>
    </div>
  );
};
