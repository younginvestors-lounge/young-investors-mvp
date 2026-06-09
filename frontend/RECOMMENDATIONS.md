# Young Investors — Build Recommendations (for Carl)

A standing reference for making the app + content **more inviting** (welcome, delight,
low friction) and **more sustainable** (lasting engagement, healthy money habits,
maintainable content, mission integrity). Self-contained — act on it without re-reading chat.

**Guardrails first (non-negotiable):** `MOCK_MVP_PAPER_TRADING_ONLY`; no real money /
broker / bank / FICA; not financial advice; no dark patterns; privacy-minimal; 18+ today
(Junior Academy later, with guardian consent designed *before* it ships). See
`SECURITY_GUARDRAILS.md`. Every recommendation below must stay inside these.

---

## Part A — Five design principles (apply to EVERY new screen/lesson)

These are the patterns that made the build *easy*; they're the same ones that make the
user's experience easy. When a screen feels hard, it's usually missing one of these.

1. **Single source of truth.** Every finance term has ONE canonical Gordon explanation
   (`lib/gordonGlossary.ts`) surfaced wherever it appears. Never redefine a term in a
   lesson, a heat-check, or the scorecard — pull from the glossary. Consistency = lower
   cognitive load = trust.
2. **Progressive disclosure.** Minimal, iconic surface first; depth on tap. The
   `JSEMarket` row (heat dot · symbol · price → tap to expand) is the model. Apply it to
   lessons, the scorecard, and voting. Humans read colour and symbols before paragraphs.
3. **Determinism / legibility.** Behaviour the user can predict builds an accurate mental
   model (the opposite of a slot machine). Keep Gordon's logic explainable and consistent;
   always show *why* (the heat-check driver bars are perfect — do more of that).
4. **Fast, honest feedback.** Immediate, in-character feedback on every action (quiz,
   vote, practice attempt). Mistakes should teach instantly — "mastery is correction."
5. **Graceful fallback.** Every "not ready" state is a soft, inviting empty state with an
   action, never an error. "Music soon", local-demo, simulated data, "No Kitchens Yet" are
   the templates. No dead ends.

> Bonus principles that paid off: **small reversible steps + a progress bar** (onboarding,
> form-a-Kitchen) for any scary task; **mock-first, real-when-ready** seams
> (`jseDataAdapter`) for anything external. Use both liberally.

### Ease → Hard mapping (use this to design hard moments)
| Principle | The user's hard moment | The fix |
|---|---|---|
| Single source of truth | "What does this word mean?" | Tappable canonical glossary entry everywhere. |
| Progressive disclosure | "This page is a wall of words." | Iconic surface, detail on demand. |
| Determinism | "Can I trust this?" | Predictable, explained logic. |
| Fast honest feedback | "Did I get it right?" | Instant in-character feedback. |
| Graceful fallback | Dead end / missing feature | Soft empty state with a next action. |
| Small reversible steps | First trade / vote / form a Kitchen | Stepped wizard + progress bar + Back. |
| Mock-first | "Real money is terrifying" | Learn in a safe simulated sandbox first. |

---

## Part B — Recommendations (What / Why / Where / Effort / Priority)

### 0. Auth recovery - account trust and onboarding
- **Keep `/login` as the only auth front door.** *Why:* split login/signup pages created
  user confusion and routing bugs. *Where:* `/signin` should remain a compatibility
  redirect only; all new and returning paths start at `/login`. *Effort:* S. *Priority:* P0.
- **Route by `onboarding_completed`, not age or session alone.** *Why:* Supabase Auth
  proves identity; YI onboarding proves product readiness. *Where:* `profileStore`,
  `auth-context`, `AppShell`, `/login`, `/onboarding`. *Effort:* S. *Priority:* P0.
- **Keep email confirmation ON for public tests.** *Why:* cleaner account ownership and
  fewer fake profiles; turn it OFF only for controlled in-person testing. *Where:*
  Supabase Auth provider settings. *Effort:* S. *Priority:* P0.
- **Use Chef code, not alias, as the unique identity anchor.** *Why:* aliases are culture
  and expression; Chef No. 003+ is the stable account identity. *Where:* profile, TopBar,
  Academy reward copy, Supabase sequence. *Effort:* S. *Priority:* P0.
- **Move avatar privacy to signed URLs before production.** *Why:* the tester bucket is
  public-read for speed; production should keep profile images private by default.
  *Where:* Supabase Storage policies and `profileStore` avatar mapper. *Effort:* M.
  *Priority:* P1.

### 1. Inviting — the first session & the feel
- **Early win before the gate.** *Why:* dopamine before friction → activation.
  *Where:* let a new chef finish one Glossary card + one micro-question on `/gordon-intro`
  or the first `/academy` visit before the Kitchen lock. *Effort:* M. *Priority:* P0.
- **A Gordon "Next best action" card.** *Why:* users should never wonder what to do — the
  single biggest retention lever. *Where:* top of `AppShell` dashboard / each tab, one
  in-character line. *Effort:* M. *Priority:* P0.
- **Personalise from `intent`.** *Why:* relevance. *Where:* reorder first lesson / home CTA
  by `learn_craft | build_portfolio | start_kitchen` (already captured at onboarding).
  *Effort:* S–M. *Priority:* P1.
- **"Try it, no account."** *Why:* taste before commitment. *Where:* surface the existing
  local-demo as a guest entry on `/login`. *Effort:* S. *Priority:* P1.
- **Tasteful motion:** number count-ups on scores, reveal-on-scroll — gated by
  `prefers-reduced-motion`. *Where:* new `lib/useReveal.ts`. *Effort:* M. *Priority:* P1.

### 2. Sustainable engagement — habit without harm
- **Reward process, not just ROI.** *Why:* anti-gambling moat; fits governance-first.
  *Where:* `GordonChefScorecard` already scores discipline — make it the headline rank,
  not Vault ROI. *Effort:* S. *Priority:* P0.
- **A forgiving "cook streak."** *Why:* habit without shame. *Where:* new lightweight
  streak in `profileStore` (freeze days; never punish). *Effort:* M. *Priority:* P1.
- **Spaced repetition — "Gordon's daily seasoning."** *Why:* learning sticks without
  re-reading. *Where:* resurface one past glossary term/concept per day (Academy home).
  *Effort:* M. *Priority:* P1.
- **Make the Lounge a weekly ritual.** *Why:* community = retention. *Where:* "Your Kitchen
  this week" recap + a vote-night cadence in `LoungeView` / Kitchen. *Effort:* M–L.
  *Priority:* P1.
- **Use Sicilia more.** *Why:* emotional counterweight to Gordon's discipline sustains
  people. *Where:* she owns the "why/lifestyle/vision" beats (Lounge, reflections,
  post-clearance). *Effort:* S–M (mostly content). *Priority:* P1.

### 3. Accessibility & reach (core value)
- **"Ask Gordon to explain simpler" on every concept.** *Why:* inclusion. *Where:* even
  pre-RAG, a rule-based drop-a-rank (`READER_LEVELS`) works now. *Effort:* S. *Priority:* P0.
- **Real multilingual — start isiZulu / isiXhosa / Afrikaans.** *Why:* huge invitation lever
  for the SA market. *Where:* the language selector in `/profile` is provisional today.
  *Effort:* L (content + i18n). *Priority:* P1.
- **Read-aloud (TTS) for lessons.** *Why:* "humans like looking and listening, not reading."
  *Effort:* M. *Priority:* P2.
- **Data-light mode.** *Why:* SA data costs are real; the ~19 MB Tadow file is a flag.
  *Where:* lazy-load audio/charts; shorter looped track for prod; keep the PWA offline-friendly.
  *Effort:* M. *Priority:* P1.

### 4. Trust & mission integrity (regulatory sustainability)
- **Keep the simulated / data-confidence / not-advice labels everywhere.** *Why:* this is a
  real trust moat. *Where:* `jseDataAdapter` confidence model is excellent — make
  "How Gordon decides" a first-class teaching moment, not fine print. *Effort:* S. *Priority:* P0.
- **Real reward terms before promising rewards.** *Why:* legal sustainability. *Where:* the
  "Founding 100 — subject to terms" indicators need actual terms drafted, or soften the
  promise. *Effort:* S (legal/content). *Priority:* P1.
- **Design the minors/Junior Academy consent path now** (guardian consent; no
  identity/banking from under-18s) — before building it. *Effort:* M (design). *Priority:* P2.
- **Privacy controls before scaling** (view/export/delete my data); keep local-demo default.
  *Effort:* M. *Priority:* P2.

### 5. Technical sustainability (so the build lasts)
- **Protect the glossary as the single source of truth** feeding lessons + heat-check +
  scorecard (you're already doing this — don't let content drift out of it). *Priority:* P0.
- **Unit-test the domain math** (60% rule, quorum, heat-check, drawdown) — pure functions,
  cheap insurance. *Where:* `lib/domain`, `lib/jseHistory`, kitchen logic. *Priority:* P1.
- **A simple content-authoring format** (structured data / tiny CMS) so Sicilia-voice
  writers add lessons + terms without touching code. *Priority:* P2.
- **Watch the performance budget** (First Load JS ~230 kB and climbing) — code-split heavy
  views (charts, market). *Priority:* P1.

---

## Part C — If you only do five (highest leverage, lowest risk)
1. **Early win before the Academy gate** (activation).
2. **Gordon "Next best action" card** (retention).
3. **Rank on process/discipline, not just ROI** (mission + anti-gambling).
4. **"Explain simpler" + start one more language** (reach/inclusion).
5. **Keep data-confidence labels rigorous + "How Gordon decides" front-and-centre** (trust).

These move *inviting* and *sustainable* the most for the least risk — and none of them
touch the mock-only / no-advice guardrails.

---

## Known open gaps (from the verification pass — fold into the above)
- `◆` diamond bullets in `AcademyView` reward lines → swap for a lucide icon (doctrine).
- "Submit Practice Attempt" has **no confirm step** yet (the recovery-from-error ask).
- Lesson modal still opens as a bottom-sheet → centre on desktop / open at content.
- Real JSE feed: intentionally deferred. The MVP JSE aisle is simulated-only; any verified/live market-data adapter needs a separate architecture and security review.
- Scroll-reveal motion (`useReveal`) not built yet.
