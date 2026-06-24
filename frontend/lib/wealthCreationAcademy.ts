export type GordonQuantumKey = "purpose" | "intellect" | "force" | "output";

export interface GordonQuantumScores {
  purpose: number;
  intellect: number;
  force: number;
  output: number;
}

export interface GordonQuantumOption {
  label: string;
  score: number;
  seasoning: string;
}

export interface GordonQuantumDiagnosticQuestion {
  id: GordonQuantumKey;
  quantum: "Purpose" | "Intellect" | "Force" | "Output";
  question: string;
  options: GordonQuantumOption[];
}

export type WealthStateCategory =
  | "Empty Pot"
  | "Leaking Pot"
  | "Simmering Pot"
  | "Flavour Building"
  | "Wealth Converter";

export interface WealthStateBand {
  category: WealthStateCategory;
  min: number;
  max: number;
  meaning: string;
  nextAction: string;
}

export interface SiciliaCreedEntry {
  day: number;
  field: string;
  line: string;
  practice: string;
}

export const WEALTH_CREATION_FORMULA = "Purpose x Intellect x Force x Output" as const;
export const SICILIA_FOLLOW_THE_MIND_PROMISE = "Change the Mind, Change the Chef, Change the Meal" as const;

export const SICILIA_CREED: SiciliaCreedEntry[] = [
  {
    day: 1,
    field: "Identity",
    line: "I am a wealth creator.",
    practice: "Name one decision that proves the chef you are becoming.",
  },
  {
    day: 2,
    field: "Attention",
    line: "I notice value, leakage, risk, and opportunity.",
    practice: "Spot one leak in your day before it steals flavour from the pot.",
  },
  {
    day: 3,
    field: "Belief",
    line: "I see myself as capable of ownership.",
    practice: "Write one sentence that moves you from consumer to owner.",
  },
  {
    day: 4,
    field: "Computation",
    line: "I can calculate, compare, simulate, and decide.",
    practice: "Compare two choices before you spend time, money, or attention.",
  },
  {
    day: 5,
    field: "Desire",
    line: "I want long life, prosperity, ownership, and freedom.",
    practice: "Separate clean ambition from envy, panic, and status pressure.",
  },
  {
    day: 6,
    field: "Behaviour",
    line: "I act like an investor, not a consumer.",
    practice: "Turn one impulse into one deliberate wealth-building action.",
  },
  {
    day: 7,
    field: "Body/time",
    line: "I spend time, energy, and habits correctly.",
    practice: "Protect one hour for learning, earning, training, or building.",
  },
  {
    day: 8,
    field: "Social capital",
    line: "I build trust, reputation, network, and coordination.",
    practice: "Make one promise small enough to keep, then keep it cleanly.",
  },
  {
    day: 9,
    field: "Information bank",
    line: "I store useful financial knowledge.",
    practice: "Save one concept in your own words before the day closes.",
  },
  {
    day: 10,
    field: "Capital",
    line: "I protect and compound money and assets.",
    practice: "Choose one ingredient to protect: cash, skill, asset, or time.",
  },
  {
    day: 11,
    field: "Institution",
    line: "I participate in rules, squads, and governance.",
    practice: "Respect the table: reason first, vote second, ego last.",
  },
  {
    day: 12,
    field: "Legacy",
    line: "I reproduce the system in others.",
    practice: "Teach one person the rule you needed earlier.",
  },
];

export const GORDON_QUANTUM_DIAGNOSTIC: GordonQuantumDiagnosticQuestion[] = [
  {
    id: "purpose",
    quantum: "Purpose",
    question: "Do you know who you are becoming financially?",
    options: [
      { label: "I can name the wealth creator I am becoming", score: 5, seasoning: "Identity is clear." },
      { label: "My direction is clear, but still forming", score: 4, seasoning: "Purpose has a shape." },
      { label: "I want better, but I cannot name the identity yet", score: 3, seasoning: "The pot has aroma, not structure." },
      { label: "I mostly react to pressure and comparison", score: 2, seasoning: "Purpose is being borrowed from the room." },
      { label: "I do not know who I am becoming with money", score: 1, seasoning: "The recipe has no chef yet." },
      { label: "I avoid the question completely", score: 0, seasoning: "The pot is cold." },
    ],
  },
  {
    id: "intellect",
    quantum: "Intellect",
    question: "Do you understand money well enough to decide?",
    options: [
      { label: "I can explain income, debt, risk, assets, and compounding", score: 5, seasoning: "The information bank is usable." },
      { label: "I understand the basics and can justify simple choices", score: 4, seasoning: "The pantry is organised." },
      { label: "I know some terms, but hesitate when decisions matter", score: 3, seasoning: "Ingredients exist, but the recipe is shaky." },
      { label: "I depend on friends, trends, or instinct more than evidence", score: 2, seasoning: "The pot is guessing." },
      { label: "Most financial language still feels foreign", score: 1, seasoning: "The pantry needs labels." },
      { label: "I do not know how money decisions work yet", score: 0, seasoning: "No recipe can run without rules." },
    ],
  },
  {
    id: "force",
    quantum: "Force",
    question: "Do you have disciplined desire, not greed?",
    options: [
      { label: "My drive is tied to freedom, dignity, service, and ownership", score: 5, seasoning: "The heat has discipline." },
      { label: "I want wealth for strong reasons, and I can resist shortcuts", score: 4, seasoning: "The flame is steady." },
      { label: "I want wealth, but status pressure still pulls me", score: 3, seasoning: "The heat needs a calmer hand." },
      { label: "I often confuse ambition with proving people wrong", score: 2, seasoning: "The pot can boil over." },
      { label: "My desire depends on envy, trends, or panic", score: 1, seasoning: "The flame is unstable." },
      { label: "I do not feel pulled toward wealth-building action", score: 0, seasoning: "No heat under the pot." },
    ],
  },
  {
    id: "output",
    quantum: "Output",
    question: "Is there visible proof of wealth-building behaviour?",
    options: [
      { label: "I have proof: savings, skills, decisions, learning, and records", score: 5, seasoning: "Flavour is visible." },
      { label: "I have a few consistent receipts and I am building more", score: 4, seasoning: "The plate is forming." },
      { label: "I have starts and stops, but some proof exists", score: 3, seasoning: "The meal is uneven, not empty." },
      { label: "My intentions are stronger than my evidence", score: 2, seasoning: "The aroma is ahead of the plate." },
      { label: "I have very little proof beyond wanting change", score: 1, seasoning: "The dish has not left the kitchen." },
      { label: "Nothing visible shows wealth-building behaviour yet", score: 0, seasoning: "No plate, no proof." },
    ],
  },
];

export const WEALTH_STATE_BANDS: WealthStateBand[] = [
  {
    category: "Empty Pot",
    min: 0,
    max: 25,
    meaning: "No identity, no system, no proof.",
    nextAction: "Start Sicilia Lesson 1: Purpose Quantum. Name the chef before choosing the meal.",
  },
  {
    category: "Leaking Pot",
    min: 26,
    max: 50,
    meaning: "Some desire exists, but value is leaking.",
    nextAction: "Plug one leak: spending, attention, weak study habits, or status pressure.",
  },
  {
    category: "Simmering Pot",
    min: 51,
    max: 70,
    meaning: "Learning and wealth creation are beginning.",
    nextAction: "Build a proof board: savings, debt, skill, learning streak, and Gordon score.",
  },
  {
    category: "Flavour Building",
    min: 71,
    max: 85,
    meaning: "Strong wealth habits are forming.",
    nextAction: "Move from private intention to visible receipts: explain one decision in the Kitchen.",
  },
  {
    category: "Wealth Converter",
    min: 86,
    max: 100,
    meaning: "Identity, intellect, drive, and output are aligned.",
    nextAction: "Mentor another chef: teach the four quanta and protect the Kitchen's standard.",
  },
];

function clampQuantum(score: number): number {
  return Math.max(0, Math.min(5, Math.round(score)));
}

export function quantumScoresFromAnswers(answers: Record<string, string>): GordonQuantumScores {
  return GORDON_QUANTUM_DIAGNOSTIC.reduce<GordonQuantumScores>(
    (scores, question) => {
      const selected = answers[question.id];
      const option = question.options.find((item) => item.label === selected);
      scores[question.id] = clampQuantum(option?.score ?? 0);
      return scores;
    },
    { purpose: 0, intellect: 0, force: 0, output: 0 }
  );
}

export function computeGordonScoreFromQuanta(scores: GordonQuantumScores): number {
  const total = scores.purpose + scores.intellect + scores.force + scores.output;
  return Math.round((total / 20) * 100);
}

export function wealthStateForScore(score: number): WealthStateBand {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return WEALTH_STATE_BANDS.find((band) => clamped >= band.min && clamped <= band.max) ?? WEALTH_STATE_BANDS[0];
}

export function siciliaCreedForDate(date = new Date()): SiciliaCreedEntry {
  const utcDay = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return SICILIA_CREED[utcDay % SICILIA_CREED.length];
}
