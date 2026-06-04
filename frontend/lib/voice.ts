/**
 * Young Investors voice + slang engine.
 *
 * Two jobs:
 *   1. Keep Gordon and Sicilia sounding like themselves everywhere.
 *   2. Make the app talk like real people — Gen Z slang, South African flavour,
 *      and a few global imports — each tagged with where it comes from, the way
 *      the login splash shows greetings in many languages.
 *
 * Rule of the house (Occam's razor): the simplest true sentence wins. If a 5-year-old
 * wouldn't follow it, rewrite it. Substance over fancy. Accessibility includes the words.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — flavour only, never financial advice.
 */

export interface SlangTerm {
  term: string;
  meaning: string;
  origin: string;
}

/** The slang dictionary. Used as flavour and shown to teach the words themselves. */
export const SLANG: SlangTerm[] = [
  { term: "You cooked", meaning: "You did it really well", origin: "Gen Z / global" },
  { term: "You're cooking", meaning: "You're on the right track, keep going", origin: "Gen Z / global" },
  { term: "Almost cooked", meaning: "So close — one more try", origin: "Gen Z / global" },
  { term: "No cap", meaning: "No lie, for real", origin: "AAVE / Gen Z" },
  { term: "Letsss go", meaning: "Yes! Excitement, momentum", origin: "Gen Z / global" },
  { term: "IKR", meaning: "I know, right? (total agreement)", origin: "Internet shorthand" },
  { term: "IDK", meaning: "I don't know", origin: "Internet shorthand" },
  { term: "LOL", meaning: "Laughing — light, friendly", origin: "Internet shorthand" },
  { term: "Das cold", meaning: "That's harsh / brutal but fair", origin: "Gen Z" },
  { term: "Icey", meaning: "Cool, clean, impressive", origin: "Gen Z" },
  { term: "Magnifico", meaning: "Magnificent — chef's kiss", origin: "Italian (Sicilia)" },
  { term: "Allora", meaning: "So then… / alright (a soft start)", origin: "Italian (Sicilia)" },
  { term: "Eish", meaning: "Oof / yikes — gentle dismay", origin: "South Africa" },
  { term: "Sharp sharp", meaning: "Cool, got it, all good", origin: "South Africa" },
  { term: "Aweh", meaning: "Hey / yes / respect", origin: "South Africa (Kaaps)" },
  { term: "Pakaipa", meaning: "Wild / next level (can be good or bad)", origin: "Shona (Zimbabwe)" },
  { term: "Bhadman ting", meaning: "A bold, impressive move", origin: "UK / Caribbean slang" },
  { term: "Shoutout!", meaning: "Public respect — well done you", origin: "Hip-hop / global" },
  { term: "You go", meaning: "I believe in you — go for it", origin: "Global encouragement" },
  { term: "Too crazy", meaning: "Amazing, hard to believe (good)", origin: "Gen Z" },
];

/** Outcome tiers — used after quizzes, attempts, votes. Cooking-coded, not clinical. */
export const COOK_TIERS = {
  cooked: {
    key: "cooked",
    label: "You cooked",
    lines: [
      "You cooked. No cap.",
      "Magnifico. That's a clean plate.",
      "Icey. Shoutout to you.",
      "Letsss go — that's a chef move.",
    ],
  },
  cooking: {
    key: "cooking",
    label: "You're cooking",
    lines: [
      "You're cooking. Keep that heat.",
      "Sharp sharp — you're on the right track.",
      "That's the right idea, keep stirring.",
    ],
  },
  almost: {
    key: "almost",
    label: "Almost cooked",
    lines: [
      "Almost cooked. One more try, you got this.",
      "So close. Das cold, but try again — you go.",
      "Eish, not yet — but you're nearly there.",
    ],
  },
} as const;

export type CookTier = keyof typeof COOK_TIERS;

/** Pick a hype line for an outcome tier (stable-ish via optional seed). */
export function cookLine(tier: CookTier, seed = 0): string {
  const lines = COOK_TIERS[tier].lines;
  return lines[Math.abs(seed) % lines.length];
}

/** A few signature one-liners, kept in character. */
export const GORDON_LINES = {
  greetingPlain: "I'm Gordon. I'm your Head Chef. My job is simple: don't let you cook with money you don't understand.",
  whyHard: "Markets sound scary because people make them sound scary. I'm going to make them make sense. That's it.",
  standard: "The Kitchen has standards. Not to gatekeep — to keep you safe. Learn first, then we cook.",
};

export const SICILIA_LINES = {
  greetingPlain: "Allora — I'm Sicilia. Gordon teaches you to cook. I show you what you're cooking for: the life, the table, the people.",
  why: "Money is a tool. The dream is the point. I keep your eyes on the dream while Gordon keeps your hands clean.",
};

/** Tiny helper: a random slang term (for sprinkling flavour without repeating). */
export function randomSlang(seed = 0): SlangTerm {
  return SLANG[Math.abs(seed) % SLANG.length];
}
