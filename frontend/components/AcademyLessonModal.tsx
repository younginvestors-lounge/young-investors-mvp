"use client";

import { useEffect, useRef, useState } from "react";
import { useTypewriter } from "@/lib/useTypewriter";

interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  gordonsAnswer: string;
  wrongAnswer: string;
}

interface LessonContent {
  moduleId: string;
  concept: string;
  body: string[];
  cookingBridge: string;
  quiz: LessonQuiz;
  passLine: string;
}

const LESSONS: Record<string, LessonContent> = {
  "markets-001": {
    moduleId: "markets-001",
    concept: "How exchanges work",
    body: [
      "A stock exchange is a marketplace where buyers and sellers agree on a price. When you buy a share, you buy a small piece of ownership in a company.",
      "The JSE (Johannesburg Stock Exchange) lists South African companies. Prices move because people constantly disagree on what a company is worth.",
      "An index like the JSE Top 40 is an average of the top 40 companies — a temperature reading for the whole market.",
    ],
    cookingBridge: "The market is a busy restaurant. Prices are the menu. They change based on what's popular, what's scarce, and how hungry everyone is. Your job as a chef is to read the menu better than everyone else at the table.",
    quiz: {
      question: "If more people want to BUY a share than SELL it, what happens to the price?",
      options: [
        "The price falls — supply exceeds demand",
        "The price rises — demand exceeds supply",
        "The price stays the same",
        "The company issues more shares automatically",
      ],
      correctIndex: 1,
      gordonsAnswer: "Correct. When more buyers than sellers compete for the same share, each buyer bids a little higher to beat the next one. The price rises. Supply and demand. That's the whole game in four words.",
      wrongAnswer: "Not quite. Think about a market stall with one mango and ten buyers. Each buyer bids higher to secure it. The price goes up. Demand beats supply — price rises. Try again.",
    },
    passLine: "Market Basics complete. You understand how a price is set. The foundation is in place.",
  },
  "risk-001": {
    moduleId: "risk-001",
    concept: "Risk and the survival rule",
    body: [
      "Risk is the possibility of loss. Every trade carries it. The question isn't how to eliminate risk — it's how to make sure no single loss ends your game.",
      "Position sizing is how much of your Kitchen's capital you put on one plate. Too much in one pot and one bad trade wipes out months of gains.",
      "The 60% Rule governs your Kitchen's vote, but your position size governs your Vault's survival. Both are about not betting so big that being wrong ends you.",
    ],
    cookingBridge: "Heat is risk. A little heat cooks the dish. Too much heat burns the kitchen down and you can't cook tomorrow. Every great chef knows the difference between controlled heat and a fire. Your job is controlled heat — always.",
    quiz: {
      question: "Your Kitchen has R60,000. A recipe proposes putting R30,000 (50%) into one stock. Gordon says the pot is too hot. Why?",
      options: [
        "Because stocks always go down",
        "Because 50% in one position means a 50% drop in that stock halves your entire Vault",
        "Because the JSE has a 50% position limit by law",
        "Because Gordon prefers cash",
      ],
      correctIndex: 1,
      gordonsAnswer: "Exactly right. If 50% of your capital is in one stock and it drops 50%, your total Vault drops 25%. That's survivable. But if it drops 80%? Your Vault loses 40%. Concentration is the enemy of longevity. Never bet so big that being wrong ends you.",
      wrongAnswer: "Think about it differently. What happens to your total Vault if that single stock drops 60%? With 50% concentration, you lose 30% of everything. That's the danger. It's not about one trade — it's about whether you can still cook tomorrow.",
    },
    passLine: "Risk and Return complete. You understand why position sizing is not optional. The pot is yours to control.",
  },
  "portfolio-001": {
    moduleId: "portfolio-001",
    concept: "Building a balanced plate",
    body: [
      "Portfolio construction is the art of combining different assets so that when one goes down, others hold or go up.",
      "Diversification doesn't mean owning everything — it means owning things that behave differently under the same conditions.",
      "A Mutual Kitchen spreads its plate across sectors. A Hedge Kitchen uses asymmetric positions to hedge against specific risks.",
    ],
    cookingBridge: "A great menu has variety. You don't serve five different meat dishes and call it balance. The dessert offsets the salt. The wine complements the protein. Your portfolio is a menu — every asset should have a reason to be on the plate alongside the others.",
    quiz: {
      question: "You hold 60% in JSE financials (banks). The Reserve Bank raises rates sharply. What risk have you underestimated?",
      options: [
        "You're well diversified — banks benefit from rate rises",
        "You have sector concentration risk — all your financials move together",
        "Rate rises don't affect JSE stocks",
        "Your Vault is perfectly balanced",
      ],
      correctIndex: 1,
      gordonsAnswer: "Correct. All your financials respond to the same macro driver. When rates rise unexpectedly fast, bank earnings can compress even if some banks do better short-term. Sector concentration means your whole plate tilts one way. Diversification means your plate can take a hit on one side and still stand.",
      wrongAnswer: "Not quite. The key is correlation — do your holdings move together or independently? If they're all in the same sector, they move together. When sector sentiment shifts, your whole plate tilts the same direction.",
    },
    passLine: "Portfolio Construction complete. You can read a plate for balance. That's how good chefs protect the Kitchen.",
  },
  "bias-001": {
    moduleId: "bias-001",
    concept: "Why smart people make bad decisions",
    body: [
      "Behavioural biases are patterns where human psychology causes us to make irrational decisions even when we know better.",
      "Overconfidence makes you bet too large because the last three trades were right. Anchoring makes you hold a losing position because you bought it at a higher price.",
      "Herding is the most dangerous Kitchen bias — when five chefs agree too quickly, they might just be agreeing with each other, not with the market.",
    ],
    cookingBridge: "The kitchen is full of ego. A chef who's had five great nights starts believing they can't make a bad dish. Then they overcook something obvious. The best kitchens have a culture of honest tasting — everyone calls out the dish, not the chef. That's what the 60% Rule is for.",
    quiz: {
      question: "Your Kitchen bought MTN at R180. It's now at R120. Everyone is holding because 'it'll recover.' What bias is this?",
      options: [
        "Recency bias — betting on recent winners",
        "Loss aversion and anchoring — the original price is distorting your view of current value",
        "Overconfidence — too certain of the outcome",
        "Herding — following the market consensus",
      ],
      correctIndex: 1,
      gordonsAnswer: "Exactly. The R180 purchase price is an anchor — it has no bearing on what MTN is worth today. Loss aversion is making you hold a deteriorating position rather than accept the loss and redeploy. A great chef doesn't keep a burnt dish on the plate because they spent time on it.",
      wrongAnswer: "The clue is in the original price. R180 is acting as an anchor — it's psychologically difficult to sell below it. Combined with loss aversion, you hold hoping to 'get back to even' rather than asking: if I didn't own this already, would I buy it now at R120?",
    },
    passLine: "Behavioural Biases complete. You now know the traps. Naming the bias is the first defence against it.",
  },
  "governance-001": {
    moduleId: "governance-001",
    concept: "How the Kitchen governs itself",
    body: [
      "Kitchen governance is the system that prevents one person from making decisions for everyone. Recipes require a proposer, a reason, and a vote.",
      "The 60% Rule means at least 60% of voting members must agree before any recipe becomes a trade. Quorum ensures enough chefs are at the table.",
      "The system exists because even brilliant chefs have blind spots. The collective catches what the individual misses.",
    ],
    cookingBridge: "A professional kitchen has a hierarchy — but it also has a tasting process. The head chef proposes, the sous chef checks, the brigade confirms. You don't serve a dish until the table agrees it's ready. The 60% Rule is that tasting table — institutionalised.",
    quiz: {
      question: "A Kitchen has 6 members. For the 60% Rule, how many members must vote FOR a recipe to pass (assuming all 6 vote)?",
      options: [
        "3 members (50%)",
        "4 members (67% — rounds up to first majority above 60%)",
        "5 members (83%)",
        "6 members (100%)",
      ],
      correctIndex: 1,
      gordonsAnswer: "4 of 6 is 66.7% — the first majority that exceeds the 60% threshold. 3 of 6 is exactly 50% — below the threshold. Governance isn't a technicality. It's the discipline that protects the whole Kitchen from one bad recipe.",
      wrongAnswer: "Count carefully. 60% of 6 is 3.6 — which means you need at least 4 votes (rounding up to the next whole voter). The first majority that clears 60% is 4 of 6. Governance precision matters.",
    },
    passLine: "Kitchen Governance complete. You understand why the rules exist. Now you can be trusted with the Kitchen.",
  },
  "mutual-001": {
    moduleId: "mutual-001",
    concept: "The Mutual Kitchen mandate",
    body: [
      "A Mutual Kitchen is the slow-cook model. Long holds, broad diversification, equal voting weight, patient capital.",
      "Every member has equal say regardless of capital contribution. Decisions require consensus. The mandate favours quality over speed.",
      "Mutual Kitchens suit early-stage investors learning the craft — the process builds discipline, the patience builds compounding.",
    ],
    cookingBridge: "A slow braise. Low heat for a long time. The flavours develop over hours, not minutes. You can't rush it and you can't force it. The Mutual Kitchen is that braise — patient, consistent, and rewarding precisely because it doesn't try to be clever every week.",
    quiz: {
      question: "In a Mutual Kitchen with 6 equal members, one member has contributed 40% of the capital. How much voting weight do they have?",
      options: [
        "40% — capital-weighted voting",
        "1/6 (16.7%) — equal voting regardless of capital",
        "60% — they're the majority stakeholder",
        "No vote until they hit 50%",
      ],
      correctIndex: 1,
      gordonsAnswer: "One member, one vote. That's the Mutual Kitchen mandate. Capital weight creates oligarchy — the Mutual model specifically rejects this. Equal voice keeps the table honest and prevents any one chef from dominating the recipe book.",
      wrongAnswer: "The Mutual Kitchen's defining principle is equal voting weight. Capital buys you a seat but not extra votes. This prevents wealthy members from overriding the Kitchen's collective judgment. One chef, one vote.",
    },
    passLine: "Mutual Kitchen Mandate complete. You understand the slow cook. Patience is a competitive advantage.",
  },
  "hedge-001": {
    moduleId: "hedge-001",
    concept: "The Hedge Kitchen mandate",
    body: [
      "A Hedge Kitchen is the high-heat model. Asymmetric strategies, shorter holds, non-negotiable exit discipline, and strict risk controls.",
      "Hedge Kitchens can use directional bets, sector tilts, and momentum strategies — but every recipe must have an explicit exit condition and a maximum loss threshold.",
      "The mandate rewards expertise. Without Academy clearance and strong reasoning, the Hedge Kitchen is dangerous.",
    ],
    cookingBridge: "High heat sears the perfect crust in seconds. But leave it thirty seconds too long and it's ruined. Hedge Kitchens live at that edge — the return is better because the risk is real. You need technique, attention, and an instinct to pull the dish before it burns. That's the mandate.",
    quiz: {
      question: "A Hedge Kitchen enters a position with a maximum loss threshold of 15%. The position drops 18%. What must happen according to the mandate?",
      options: [
        "Hold — it will probably recover",
        "Exit the position immediately — the non-negotiable threshold was breached",
        "Reduce by 50% and wait",
        "Call a vote to extend the threshold",
      ],
      correctIndex: 1,
      gordonsAnswer: "Exit. The threshold is non-negotiable because it was set when you were thinking clearly, before the position moved. The moment it becomes negotiable, it's not a rule — it's a suggestion. And suggestions don't protect Kitchens. The Hedge mandate only works because the rules are held.",
      wrongAnswer: "Non-negotiable means non-negotiable. The threshold was set before the trade to protect the Kitchen from the psychological trap of 'it'll recover.' When the rule is triggered, you exit. That's the whole point of having the rule — to remove the decision when emotions are highest.",
    },
    passLine: "Hedge Kitchen Mandate complete. High heat, strict rules. You now know when to pull the dish.",
  },
  "ethics-001": {
    moduleId: "ethics-001",
    concept: "Clean conscience, clean kitchen",
    body: [
      "Market conduct rules exist to keep markets fair. Insider trading — using information unavailable to the public to trade — is illegal and corrosive.",
      "Even in an educational simulation, the habits you build now are the habits you carry into real markets. A Kitchen that tolerates ethical shortcuts will take financial ones.",
      "Young Investors is built on the premise that collective governance plus ethical discipline plus education produces better investors and a better market.",
    ],
    cookingBridge: "A restaurant with a dirty kitchen will eventually poison someone. The health inspector doesn't catch every violation — but the culture of cleanliness protects the restaurant every day. Your Kitchen's ethical standard is that culture. It protects you, your members, and the credibility of everything you build.",
    quiz: {
      question: "A chef in your Kitchen works at a company and learns before the public announcement that it will report a major profit. They propose buying the stock. What should the Kitchen do?",
      options: [
        "Vote on it — if the thesis is good, trade it",
        "Reject the recipe and address the conduct issue — this is insider trading",
        "Reduce the position size to 5% to reduce risk",
        "Wait until the announcement is public, then trade",
      ],
      correctIndex: 1,
      gordonsAnswer: "Reject it immediately and address the conduct directly. Insider trading isn't a technicality — it's a breach of market fairness that harms every other investor who doesn't have that information. The fact that it's a simulation doesn't change the habit. You build clean practices here so they're automatic when it counts.",
      wrongAnswer: "The answer isn't about position size or timing. The information itself is the problem. Using material non-public information to trade gives an unfair advantage over the rest of the market. Even reducing the position doesn't make it ethical. The Kitchen must reject it and address the conduct.",
    },
    passLine: "Market Conduct and Ethics complete. Clean kitchen, clean conscience. The Lounge respects it.",
  },
};

interface Props {
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
  onPass: (moduleId: string) => void;
}

type ModalPhase = "concept" | "quiz" | "result";

function GordonLine({ text, speed = 16, delay = 200 }: { text: string; speed?: number; delay?: number }) {
  const { displayed, done } = useTypewriter(text, { speed, delay });
  return (
    <span>
      {displayed}
      {!done && (
        <span style={{ display: "inline-block", width: 2, height: "1em", background: "#b42318", marginLeft: 2, verticalAlign: "text-bottom", animation: "cursor-blink 700ms step-end infinite" }} aria-hidden />
      )}
    </span>
  );
}

export function AcademyLessonModal({ moduleId, moduleTitle, onClose, onPass }: Props) {
  const lesson = LESSONS[moduleId];
  const [phase, setPhase] = useState<ModalPhase>("concept");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!lesson) {
    return (
      <div ref={overlayRef} style={overlayStyle} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
        <div style={modalStyle}>
          <p style={monoSmall}>Module content coming soon.</p>
          <button style={btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  function handleAnswer() {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === lesson.quiz.correctIndex;
    setAnswered(true);
    setCorrect(isCorrect);
    setAttempts((a) => a + 1);
  }

  function handleRetry() {
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);
  }

  function handlePass() {
    onPass(moduleId);
    setPhase("result");
  }

  return (
    <div
      ref={overlayRef}
      style={overlayStyle}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-modal-title"
    >
      <style>{`@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes modal-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={modalStyle}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--yi-hairline)", padding: "14px 20px", flexShrink: 0 }}>
          <div>
            <p style={{ ...monoSmall, margin: 0, color: "var(--yi-muted)" }}>The Academy · Lesson</p>
            <h2 id="lesson-modal-title" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.1rem", fontWeight: 600, margin: "4px 0 0", lineHeight: 1.1 }}>
              {moduleTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close lesson"
            style={{ background: "transparent", border: "none", color: "var(--yi-muted)", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px", lineHeight: 1, fontFamily: "var(--font-mono), monospace" }}
          >
            ✕
          </button>
        </div>

        {/* Progress tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          {(["concept", "quiz", "result"] as ModalPhase[]).map((p, i) => (
            <div
              key={p}
              style={{
                flex: 1,
                padding: "10px 12px",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: phase === p ? "var(--yi-ink)" : "var(--yi-muted)",
                borderBottom: phase === p ? "2px solid var(--yi-black)" : "2px solid transparent",
                textAlign: "center",
              }}
            >
              {String(i + 1).padStart(2, "0")} {p}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "grid", gap: 18 }}>

          {phase === "concept" && (
            <>
              <div>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 6px" }}>Core concept</p>
                <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.3rem", fontWeight: 600, margin: 0, lineHeight: 1.1 }}>{lesson.concept}</h3>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {lesson.body.map((para, i) => (
                  <p key={i} style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: 0 }}>{para}</p>
                ))}
              </div>

              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 14 }}>
                <p style={{ ...monoSmall, color: "#b42318", margin: "0 0 6px" }}>Gordon · Cooking bridge</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  &ldquo;{lesson.cookingBridge}&rdquo;
                </p>
              </div>

              <button
                onClick={() => setPhase("quiz")}
                style={btnPrimary}
              >
                Take the quiz →
              </button>
            </>
          )}

          {phase === "quiz" && (
            <>
              <div>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 6px" }}>
                  Attempt-before-hint · {attempts === 0 ? "Try it first" : `Attempt ${attempts}`}
                </p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "1rem", lineHeight: 1.6, color: "var(--yi-ink)", margin: 0, fontWeight: 500 }}>
                  {lesson.quiz.question}
                </p>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {lesson.quiz.options.map((opt, i) => {
                  let borderColor = "var(--yi-frame)";
                  let bg = "transparent";
                  let textColor = "var(--yi-ink)";
                  if (answered) {
                    if (i === lesson.quiz.correctIndex) { borderColor = "#167a3a"; bg = "rgba(22,122,58,0.06)"; textColor = "#167a3a"; }
                    else if (i === selectedAnswer && !correct) { borderColor = "#b42318"; bg = "rgba(180,35,24,0.05)"; textColor = "#b42318"; }
                  } else if (selectedAnswer === i) {
                    borderColor = "var(--yi-black)";
                    bg = "var(--yi-soft)";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={answered}
                      onClick={() => setSelectedAnswer(i)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        border: `1px solid ${borderColor}`,
                        background: bg,
                        color: textColor,
                        fontFamily: "var(--font-archivo), system-ui, sans-serif",
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        cursor: answered ? "default" : "pointer",
                        transition: "all 150ms ease",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", marginRight: 8, textTransform: "uppercase" }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {!answered && (
                <button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null}
                  style={{ ...btnPrimary, opacity: selectedAnswer === null ? 0.5 : 1, cursor: selectedAnswer === null ? "not-allowed" : "pointer" }}
                >
                  Submit answer
                </button>
              )}

              {answered && (
                <div style={{ border: `1px solid ${correct ? "#167a3a" : "#b42318"}`, borderLeft: `2px solid ${correct ? "#167a3a" : "#b42318"}`, padding: "14px 16px", background: "var(--yi-card-bg)" }}>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: correct ? "#167a3a" : "#b42318", margin: "0 0 8px" }}>
                    Gordon · {correct ? "Correct" : "Try again"}
                  </p>
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
                    <GordonLine text={correct ? lesson.quiz.gordonsAnswer : lesson.quiz.wrongAnswer} />
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    {correct ? (
                      <button onClick={handlePass} style={btnPrimary}>
                        Complete lesson →
                      </button>
                    ) : (
                      <button onClick={handleRetry} style={btnSecondary}>
                        Try again
                      </button>
                    )}
                    {!correct && (
                      <button onClick={() => setPhase("concept")} style={{ ...btnSecondary, borderColor: "var(--yi-frame)" }}>
                        Review concept
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {phase === "result" && (
            <>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#167a3a", margin: "0 0 12px" }}>
                  Lesson passed
                </p>
                <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.4rem", fontWeight: 600, margin: "0 0 12px", lineHeight: 1.1 }}>
                  {moduleTitle}
                </h3>
              </div>
              <div style={{ borderLeft: "2px solid var(--yi-black)", paddingLeft: 14 }}>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 6px" }}>Gordon</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  <GordonLine text={`"${lesson.passLine}"`} />
                </p>
              </div>
              <button onClick={onClose} style={btnPrimary}>
                Back to Academy
              </button>
            </>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--yi-hairline)", padding: "10px 20px", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
            Educational guidance only · Gordon provides informational commentary · Not financial advice
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 200,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: "0",
};

const modalStyle: React.CSSProperties = {
  background: "var(--yi-paper)",
  width: "100%",
  maxWidth: 600,
  maxHeight: "92svh",
  display: "flex",
  flexDirection: "column",
  animation: "modal-in 220ms ease",
  border: "1px solid var(--yi-frame)",
  borderBottom: "none",
};

const monoSmall: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--yi-muted)",
};

const btnPrimary: React.CSSProperties = {
  minHeight: 48,
  padding: "0 24px",
  background: "var(--yi-black)",
  color: "var(--yi-white)",
  border: "none",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  cursor: "pointer",
  alignSelf: "flex-start",
};

const btnSecondary: React.CSSProperties = {
  minHeight: 48,
  padding: "0 20px",
  background: "transparent",
  color: "var(--yi-ink)",
  border: "1px solid var(--yi-black)",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  cursor: "pointer",
  alignSelf: "flex-start",
};
