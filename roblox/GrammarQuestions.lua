--[[
    ReplicatedStorage/GrammarQuestions.lua
    Place this ModuleScript inside ReplicatedStorage named "GrammarQuestions"
]]

local GrammarQuestions = {
    {
        id = "sva-1",
        category = "Subject-Verb Agreement",
        prompt = "Neither of the boys ___ brought his lunch today.",
        options = {"has", "have"},
        answer = "has",
        explanation = "'Neither' is grammatically singular and takes a singular verb ('has').",
        hint = "'Neither' refers to not one and not the other."
    },
    {
        id = "sva-2",
        category = "Subject-Verb Agreement",
        prompt = "The bouquet of red roses ___ a wonderful scent.",
        options = {"has", "have"},
        answer = "has",
        explanation = "The true subject is 'bouquet' (singular), not 'roses'.",
        hint = "Identify the main noun before the preposition."
    },
    {
        id = "vt-1",
        category = "Verb Tenses",
        prompt = "Yesterday afternoon, the captain ___ the bell three times.",
        options = {"rang", "rung", "ringed"},
        answer = "rang",
        explanation = "Simple past of 'ring' is 'rang'.",
        hint = "Ring -> Rang (past) -> Rung (participle)."
    },
    {
        id = "hom-1",
        category = "Homophones",
        prompt = "The students put ___ coats in the locker room.",
        options = {"their", "there", "they're"},
        answer = "their",
        explanation = "'Their' is possessive; 'there' is location; 'they're' is 'they are'.",
        hint = "Indicates ownership."
    },
    {
        id = "hom-2",
        category = "Homophones",
        prompt = "The harsh desert climate will ___ the traveler’s health.",
        options = {"affect", "effect"},
        answer = "affect",
        explanation = "'Affect' is the verb meaning to influence.",
        hint = "Remember RAVEN: Affect Verb, Effect Noun."
    },
    {
        id = "pro-1",
        category = "Pronoun Usage",
        prompt = "Between you and ___, this tower is rising very fast.",
        options = {"me", "I"},
        answer = "me",
        explanation = "'Between' is a preposition governing the objective pronoun 'me'.",
        hint = "Prepositions require objective case."
    },
    {
        id = "comp-1",
        category = "Comparatives",
        prompt = "Mount Everest is the ___ mountain on Earth.",
        options = {"highest", "higher", "most high"},
        answer = "highest",
        explanation = "Single-syllable adjectives form the superlative with -est.",
        hint = "Comparing more than two items."
    },
    {
        id = "plu-1",
        category = "Plural Nouns",
        prompt = "A pack of hungry ___ hunted across the snowy ridge.",
        options = {"wolves", "wolfs", "wolvese"},
        answer = "wolves",
        explanation = "Nouns ending in -f change to -ves in the plural.",
        hint = "Change 'f' to 'ves'."
    },
    {
        id = "apo-1",
        category = "Apostrophes",
        prompt = "The young puppy wagged ___ tail excitedly.",
        options = {"its", "it's"},
        answer = "its",
        explanation = "'Its' is possessive; 'it\\'s' means 'it is'.",
        hint = "Possessive pronouns never take an apostrophe."
    }
}

return GrammarQuestions
