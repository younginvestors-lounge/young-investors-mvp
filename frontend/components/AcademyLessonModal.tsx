"use client";

import { useEffect, useRef, useState } from "react";
import { ChefHat, Dumbbell, Maximize2, MessageCircle, Minimize2, Sparkles, X } from "lucide-react";
import { useTypewriter } from "@/lib/useTypewriter";
import { useAuth } from "@/lib/auth-context";
import { rememberGordonChefReason } from "@/lib/gordonKnowledgeBank";
import { success, tap, warn } from "@/lib/haptics";
import { glossaryForModule, READER_LEVELS, type GlossaryLevels } from "@/lib/gordonGlossary";
import { notifyTask } from "@/lib/taskToast";
import { dynamicQuorum } from "@/lib/domain";
import {
  ACADEMY_LESSON_CONTENT,
  ACADEMY_LESSON_OUTCOMES,
  ACADEMY_PRACTICE_BEATS,
  ACADEMY_QUIZZES,
} from "@/lib/academySyllabus";

/** What each class promises — Gordon/Sicilia as lecturer/master chef. */
const LESSON_OUTCOMES = ACADEMY_LESSON_OUTCOMES;


interface Props {
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
  onPass: (moduleId: string) => void;
}

type ModalPhase = "glossary" | "concept" | "practice" | "quiz" | "result";

function guideNameForModule(moduleId: string): "Gordon" | "Sicilia" {
  return moduleId.startsWith("mind-") ? "Sicilia" : "Gordon";
}

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
  const { user } = useAuth();
  const lesson = ACADEMY_LESSON_CONTENT[moduleId];
  const practice = ACADEMY_PRACTICE_BEATS[moduleId];
  const quizzes = ACADEMY_QUIZZES[moduleId] ?? [];
  const terms = glossaryForModule(moduleId);
  const outcomes = LESSON_OUTCOMES[moduleId] ?? [];
  const guideName = guideNameForModule(moduleId);
  const [phase, setPhase] = useState<ModalPhase>(terms.length > 0 ? "glossary" : "concept");
  const [level, setLevel] = useState<keyof GlossaryLevels>("twelve");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [full, setFull] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [reflection, setReflection] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Full-screen is the user's choice and is remembered across popups.
  useEffect(() => {
    try { setFull(localStorage.getItem("yi_full_lesson") === "1"); } catch {}
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(media.matches);
    update();
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener?.(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener?.(update);
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [phase, moduleId]);

  function toggleFull() {
    tap();
    setFull((f) => {
      const next = !f;
      try { localStorage.setItem("yi_full_lesson", next ? "1" : "0"); } catch {}
      return next;
    });
  }

  if (!lesson || quizzes.length === 0) {
    return (
      <div ref={overlayRef} style={overlayStyle} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
        <div style={modalStyle}>
          <p style={monoSmall}>Module content coming soon.</p>
          <button style={btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const passThreshold = dynamicQuorum(quizzes.length);
  const currentQuiz = quizzes[questionIndex];

  function handleAnswer() {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === currentQuiz.correctIndex;
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) { setCorrectCount((c) => c + 1); success(); } else { warn(); }
  }

  function handleNextQuestion() {
    tap();
    if (questionIndex < quizzes.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setCorrect(false);
    } else {
      setPhase("result");
    }
  }

  function handleReviewAndRetry() {
    setQuestionIndex(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);
    setPhase("concept");
  }

  const lessonPassed = correctCount >= passThreshold;

  const reflectionWord = reflection.trim();
  const reflectionOk = reflectionWord.length > 0 && !/\s/.test(reflectionWord);

  function finishLesson() {
    if (!reflectionOk) return;
    if (user) {
      rememberGordonChefReason(user.id, {
        source: "academy",
        action: "reflection",
        reason: `${moduleTitle}: ${reflectionWord}`,
      });
    }
    success();
    notifyTask("Lesson cleared", `${moduleTitle} saved to ${guideName}'s notebook.`);
    onPass(moduleId);
    onClose();
  }

  const activeOverlayStyle: React.CSSProperties = {
    ...overlayStyle,
    alignItems: full ? "stretch" : desktop ? "center" : "flex-end",
    padding: full ? 0 : desktop ? 24 : 0,
  };
  const activeModalStyle: React.CSSProperties = full
    ? { ...modalStyle, maxWidth: "none", maxHeight: "100%", height: "100%", borderBottom: "1px solid var(--yi-frame)" }
    : { ...modalStyle, borderBottom: desktop ? "1px solid var(--yi-frame)" : "none", maxHeight: desktop ? "86svh" : "92svh" };

  return (
    <div
      ref={overlayRef}
      style={activeOverlayStyle}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-modal-title"
    >
      <style>{`@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes modal-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={activeModalStyle}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--yi-hairline)", padding: "14px 20px", flexShrink: 0 }}>
          <div>
            <p style={{ ...monoSmall, margin: 0, color: "var(--yi-muted)" }}>The Academy · Lesson</p>
            <h2 id="lesson-modal-title" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.1rem", fontWeight: 600, margin: "4px 0 0", lineHeight: 1.1 }}>
              {moduleTitle}
            </h2>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <button
              type="button"
              onClick={toggleFull}
              aria-label={full ? "Exit full screen" : "Full screen"}
              title={full ? "Exit full screen" : "Full screen"}
              style={modalIconBtn}
            >
              {full ? <Minimize2 size={15} strokeWidth={1.8} aria-hidden /> : <Maximize2 size={15} strokeWidth={1.8} aria-hidden />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close lesson"
              title="Close"
              style={modalIconBtn}
            >
              <X size={16} strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        </div>

        {/* Progress tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          {(["glossary", "concept", "practice", "quiz", "result"] as ModalPhase[]).map((p, i) => (
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
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "grid", gap: 14, alignContent: "start" }}>

          {phase === "glossary" && (
            <>
              {/* The guide frames the class - lecturer / master chef */}
              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 14 }}>
                <p style={{ ...monoSmall, color: "#b42318", margin: "0 0 6px" }}>{guideName} · Today&apos;s class</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.92rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  <GordonLine text={guideName === "Sicilia"
                    ? `"Today we are baking the inner recipe: ${lesson.concept.toLowerCase()}. Mind first, chef next, meal after. Soft hands, sharp standards."`
                    : `"Today we're cooking ${lesson.concept.toLowerCase()}. Four stations - words, theory, practice, then the quiz. Sharp sharp."`}
                  />
                </p>
              </div>

              {/* Lesson outline + learning outcomes */}
              <div style={{ border: "1px solid var(--yi-frame)", padding: "12px 14px", background: "var(--yi-card-bg)" }}>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 8px" }}>Lesson outline</p>
                <div style={{ display: "grid", gap: 6 }}>
                  {["Glossary check - the words", `Theory - ${guideName}'s bridge`, "Practice - apply it once", "The cook - your quiz"].map((s, i) => (
                    <div key={s} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ ...monoSmall, color: "var(--yi-ink)" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", color: "var(--yi-copy)" }}>{s}</span>
                    </div>
                  ))}
                </div>
                {outcomes.length > 0 && (
                  <>
                    <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "12px 0 6px" }}>By the end you&apos;ll be able to</p>
                    <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 4 }}>
                      {outcomes.map((o) => (
                        <li key={o} style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", lineHeight: 1.5, color: "var(--yi-copy)" }}>{o}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Glossary check intro */}
              <div>
                <p style={{ ...monoSmall, color: "#b42318", margin: "0 0 6px" }}>Gordon&apos;s Glossary Check</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
                  Same word, your station. Slide between Junior, Intermediate and Master — no shame, just understanding.
                </p>
              </div>

              {/* Chef-rank segmented control */}
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${READER_LEVELS.length}, 1fr)`, border: "1px solid var(--yi-frame)" }}>
                  {READER_LEVELS.map(({ key, label }, i) => {
                    const active = level === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setLevel(key); tap(); }}
                        aria-pressed={active}
                        style={{
                          border: "none",
                          borderRight: i < READER_LEVELS.length - 1 ? "1px solid var(--yi-frame)" : "none",
                          background: active ? "var(--yi-black)" : "transparent",
                          color: active ? "var(--yi-white)" : "var(--yi-ink)",
                          minHeight: 42,
                          fontFamily: "var(--font-mono), monospace",
                          fontSize: "0.6rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          cursor: "pointer",
                          transition: "background 160ms ease",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled
                  title="Full Gordon AI is still in training — coming soon"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", border: "1px dashed var(--yi-frame)", background: "transparent", color: "var(--yi-muted)", padding: "7px 11px", fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "not-allowed" }}
                >
                  <Sparkles size={12} strokeWidth={1.8} aria-hidden /> Ask Gordon · coming soon
                </button>
              </div>

              {/* Terms */}
              <div style={{ display: "grid", gap: 12 }}>
                {terms.map((t) => (
                  <div key={t.key} style={{ border: "1px solid var(--yi-frame)", padding: "12px 14px", background: "var(--yi-card-bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <h4 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.05rem", fontWeight: 600, margin: 0 }}>{t.term}</h4>
                      <span style={{ ...monoSmall, color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "2px 6px" }}>{t.kitchen}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-ink)", margin: "8px 0 0" }}>
                      {t.levels[level]}
                    </p>
                    <p style={{ display: "flex", alignItems: "flex-start", gap: 6, fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: "8px 0 0", fontStyle: "italic" }}>
                      <ChefHat size={13} strokeWidth={1.8} aria-hidden style={{ marginTop: 3, flexShrink: 0 }} /> <span>{t.cooking}</span>
                    </p>
                    <p style={{ ...monoSmall, display: "flex", alignItems: "flex-start", gap: 6, color: "#167a3a", margin: "8px 0 0", letterSpacing: "0.04em", textTransform: "none", fontSize: "0.72rem" }}>
                      <MessageCircle size={12} strokeWidth={1.8} aria-hidden style={{ marginTop: 2, flexShrink: 0 }} /> <span>{t.slang}</span>
                    </p>
                    {t.related.length > 0 && (
                      <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "8px 0 0", textTransform: "none", fontSize: "0.6rem" }}>
                        connects to: {t.related.join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => { tap(); setPhase("concept"); }} style={btnPrimary}>
                Got the words — start the class →
              </button>
            </>
          )}

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
                <p style={{ ...monoSmall, color: "#b42318", margin: "0 0 6px" }}>{guideName} · Cooking bridge</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  &ldquo;{lesson.cookingBridge}&rdquo;
                </p>
              </div>

              <button
                onClick={() => setPhase("practice")}
                style={btnPrimary}
              >
                Practice station -&gt;
              </button>
            </>
          )}

          {phase === "practice" && (
            <>
              <div>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 6px" }}>Theory to practice</p>
                <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.3rem", fontWeight: 600, margin: 0, lineHeight: 1.1 }}>
                  Apply it once.
                </h3>
              </div>

              <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)", display: "grid", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Dumbbell size={17} strokeWidth={1.8} aria-hidden style={{ marginTop: 3, color: "#b42318", flexShrink: 0 }} />
                  <div>
                    <p style={{ ...monoSmall, color: "#b42318", margin: "0 0 6px" }}>Setup</p>
                    <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
                      {practice?.setup ?? "A Kitchen has to explain the reason before the table votes."}
                    </p>
                  </div>
                </div>

                <details style={{ borderTop: "1px solid var(--yi-hairline)", paddingTop: 10 }}>
                  <summary style={{ ...monoSmall, color: "var(--yi-ink)", cursor: "pointer" }}>Task</summary>
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: "8px 0 0" }}>
                    {practice?.task ?? `Name the concept ${guideName} should check before the recipe moves forward.`}
                  </p>
                </details>

                <details>
                  <summary style={{ ...monoSmall, color: "var(--yi-ink)", cursor: "pointer" }}>{guideName}&apos;s check</summary>
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: "8px 0 0" }}>
                    {practice?.check ?? "A reason can be repeated. A hunch cannot."}
                  </p>
                </details>
              </div>

              <button onClick={() => setPhase("quiz")} style={btnPrimary}>
                Take the quiz -&gt;
              </button>
            </>
          )}

          {phase === "quiz" && (
            <>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {quizzes.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        background: i < questionIndex || (i === questionIndex && answered)
                          ? (i === questionIndex ? (correct ? "#167a3a" : "#b42318") : "var(--yi-black)")
                          : "var(--yi-frame)",
                      }}
                    />
                  ))}
                </div>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: 0 }}>
                  Question {questionIndex + 1} of {quizzes.length} · {correctCount} correct so far
                </p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "1rem", lineHeight: 1.6, color: "var(--yi-ink)", margin: 0, fontWeight: 500 }}>
                  {currentQuiz.question}
                </p>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {currentQuiz.options.map((opt, i) => {
                  let borderColor = "var(--yi-frame)";
                  let bg = "transparent";
                  let textColor = "var(--yi-ink)";
                  if (answered) {
                    if (i === currentQuiz.correctIndex) { borderColor = "#167a3a"; bg = "rgba(22,122,58,0.06)"; textColor = "#167a3a"; }
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
                      onClick={() => { setSelectedAnswer(i); tap(); }}
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
                    {guideName} · {correct ? "Correct" : "Not quite"}
                  </p>
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
                    <GordonLine text={correct ? currentQuiz.gordonsAnswer : currentQuiz.wrongAnswer} />
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button onClick={handleNextQuestion} style={btnPrimary}>
                      {questionIndex < quizzes.length - 1 ? "Next question →" : "See results →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {phase === "result" && lessonPassed && (
            <>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#167a3a", margin: "0 0 12px" }}>
                  Lesson passed · {correctCount} of {quizzes.length} correct
                </p>
                <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.4rem", fontWeight: 600, margin: "0 0 12px", lineHeight: 1.1 }}>
                  {moduleTitle}
                </h3>
              </div>
              <div style={{ borderLeft: "2px solid var(--yi-black)", paddingLeft: 14 }}>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 6px" }}>{guideName}</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  <GordonLine text={`"${lesson.passLine}"`} />
                </p>
              </div>
              <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)", display: "grid", gap: 8 }}>
                <p style={{ ...monoSmall, color: "#167a3a", margin: 0 }}>One-word reflection</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.5, color: "var(--yi-copy)", margin: 0 }}>
                  Give {guideName} one word to remember from this lesson.
                </p>
                <input
                  aria-label="One-word reflection"
                  value={reflection}
                  maxLength={32}
                  onChange={(e) => setReflection(e.target.value.trimStart().split(/\s+/)[0] ?? "")}
                  placeholder="sizing"
                  style={{
                    minHeight: 42,
                    border: "1px solid var(--yi-frame)",
                    background: "var(--yi-paper)",
                    color: "var(--yi-ink)",
                    padding: "0 10px",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={finishLesson}
                disabled={!reflectionOk}
                style={{ ...btnPrimary, opacity: reflectionOk ? 1 : 0.45, cursor: reflectionOk ? "pointer" : "not-allowed" }}
              >
                Save reflection &amp; finish -&gt;
              </button>
            </>
          )}

          {phase === "result" && !lessonPassed && (
            <>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#b42318", margin: "0 0 12px" }}>
                  Not cleared yet · {correctCount} of {quizzes.length} correct
                </p>
                <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.4rem", fontWeight: 600, margin: "0 0 12px", lineHeight: 1.1 }}>
                  {moduleTitle}
                </h3>
              </div>
              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 14 }}>
                <p style={{ ...monoSmall, color: "var(--yi-muted)", margin: "0 0 6px" }}>{guideName}</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  {`"Not yet. You need ${passThreshold} of ${quizzes.length} to clear this station. Go back through the concept, then take the quiz again."`}
                </p>
              </div>
              <button onClick={handleReviewAndRetry} style={btnPrimary}>
                Review lesson &amp; retry -&gt;
              </button>
            </>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--yi-hairline)", padding: "10px 20px", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
            Educational guidance only · {guideName} provides informational commentary · Not financial advice
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

const modalIconBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  background: "transparent",
  border: "1px solid var(--yi-hairline)",
  color: "var(--yi-muted)",
  cursor: "pointer",
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
