"use client";

import clsx from "clsx";
import Link from "next/link";
import { BadgeCheck, BookOpenCheck, Briefcase, CheckCircle, ChevronDown, ChevronUp, LockKeyhole, PlayCircle, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { BrutalistButton } from "@/components/BrutalistButton";
import { BrutalistCard } from "@/components/BrutalistCard";
import { AcademyLessonModal } from "@/components/AcademyLessonModal";
import { GordonChefScorecard } from "@/components/GordonChefScorecard";
import { RevealBox } from "@/components/RevealBox";
import { useAuth } from "@/lib/auth-context";
import { notifyTask } from "@/lib/taskToast";
import {
  ATTEMPT_LIMIT,
  FIRST_TESTER_NUMBER,
  MAX_TESTER_NUMBER,
  PASS_THRESHOLD,
  type AttemptResult,
} from "@/lib/profileStore";
import type { AcademyClearance, AcademyModule } from "@/lib/types";

interface AcademyViewProps {
  modules: AcademyModule[];
  clearance: AcademyClearance;
  onModuleStart: (moduleId: string) => void;
  onLessonOpenChange?: (open: boolean) => void;
  onTabChange?: (tab: import("@/lib/types").DashboardTab) => void;
}

export function AcademyView({ modules, clearance, onModuleStart, onLessonOpenChange, onTabChange }: AcademyViewProps) {
  const passedCount = modules.filter((m) => m.passed).length;
  const totalCount = modules.length;

  const { user } = useAuth();
  // Strip any leading "Chef " the user typed into their alias so the greeting
  // never reads "Chef Chef [name]".
  const chefName = (user?.chef_alias ?? "").trim().replace(/^chef\s+/i, "") || "Chef";
  const [openLesson, setOpenLesson] = useState<{ id: string; title: string } | null>(null);

  function openAcademyLesson(lesson: { id: string; title: string }) {
    setOpenLesson(lesson);
    onLessonOpenChange?.(true);
  }

  function closeAcademyLesson() {
    setOpenLesson(null);
    onLessonOpenChange?.(false);
  }

  useEffect(() => {
    return () => onLessonOpenChange?.(false);
  }, [onLessonOpenChange]);

  return (
    <section className="stack" aria-labelledby="academy-heading">
      <div>
        <p className="eyebrow">Wealth Creation Tool</p>
        <h2 id="academy-heading" className="view-title">The Academy</h2>
        {chefName && (
          <p style={{
            fontFamily: "var(--font-bodoni), Georgia, serif",
            fontSize: "1.05rem",
            fontWeight: 400,
            color: "var(--yi-ink)",
            margin: "8px 0 0",
            fontStyle: "italic",
          }}>
            Welcome to the Academy,{" "}
            <Link href="/profile" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Chef {chefName}
            </Link>.
          </p>
        )}
      </div>

      <BrutalistCard critical={!clearance.complete}>
        <div className="status-line">
          {clearance.complete ? (
            <BookOpenCheck className="icon-inline" aria-hidden="true" />
          ) : (
            <LockKeyhole className="icon-inline" aria-hidden="true" />
          )}
          <span className={clsx("badge", clearance.complete ? "badge-positive" : "badge-critical")}>
            {clearance.complete ? "Ready for The Kitchen" : "Skills in progress"}
          </span>
          <span className="badge">{passedCount}/{totalCount} lessons passed</span>
        </div>
        <p className="copy">
          {clearance.complete
            ? "Your market literacy receipts are in place. The table can see your process."
            : "Build the language, risk habits, and reasoning receipts that make every Kitchen vote sharper."}
        </p>
        {!clearance.complete && (
          <div className="progress-track" style={{ marginTop: 12 }} aria-hidden="true">
            <div
              className="progress-fill-watch"
              style={{ width: `${Math.round((passedCount / totalCount) * 100)}%` }}
            />
          </div>
        )}
      </BrutalistCard>

      {/* Follow The Money — the lessons are the main course of the Academy */}
      <RevealBox
        symbol={<ReceiptText size={15} strokeWidth={1.8} aria-hidden />}
        title="Follow The Money"
        meta={`${passedCount}/${totalCount} lessons passed`}
        defaultOpen
        tone={clearance.complete ? "positive" : "watch"}
      >
        <ModuleAccordion
          modules={modules}
          onOpen={(mod) => openAcademyLesson({ id: mod.id, title: mod.title })}
        />
      </RevealBox>

      {clearance.complete && onTabChange && (
        <div style={{ border: "1px solid #167a3a", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-ink)", margin: 0, fontWeight: 600 }}>
            Academy cleared. The Kitchen is open.
          </p>
          <button
            type="button"
            onClick={() => onTabChange("kitchen")}
            style={{ minHeight: 38, padding: "0 18px", background: "#167a3a", color: "#fff", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", flexShrink: 0 }}
          >
            Enter the Kitchen →
          </button>
        </div>
      )}

      {/* Chef's Bag — your Academy score and Gordon's scorecard, packed together */}
      <RevealBox
        symbol={<Briefcase size={15} strokeWidth={1.8} aria-hidden />}
        title="Chef's Bag"
        meta="Academy score · Chef Scorecard"
      >
        <div style={{ display: "grid", gap: 20 }}>
          <FollowTheMoneyCard />
          <div style={{ borderTop: "1px solid var(--yi-hairline)", paddingTop: 18 }}>
            <GordonChefScorecard modules={modules} />
          </div>
        </div>
      </RevealBox>

      {openLesson && (
        <AcademyLessonModal
          moduleId={openLesson.id}
          moduleTitle={openLesson.title}
          onClose={closeAcademyLesson}
          onPass={(moduleId) => {
            onModuleStart(moduleId);
          }}
        />
      )}
    </section>
  );
}

/* ── Module accordion — compact tap-to-expand rows ── */
function ModuleAccordion({
  modules,
  onOpen,
}: {
  modules: AcademyModule[];
  onOpen: (mod: AcademyModule) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div style={{ border: "1px solid var(--yi-frame)" }}>
      {modules.map((module, idx) => {
        const isOpen = expanded === module.id;
        const isCritical = module.requiredForKitchen && !module.passed;
        const canStart = !module.locked && !module.passed;
        const leftBorderColor = module.passed
          ? "#167a3a"
          : isCritical
          ? "#b42318"
          : "transparent";

        return (
          <div key={module.id}>
            {idx > 0 && <div style={{ height: 1, background: "var(--yi-frame)" }} />}

            {/* Collapsed header row */}
            <button
              type="button"
              onClick={() => toggle(module.id)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 14px",
                background: "var(--yi-card-bg)",
                border: "none",
                borderLeft: `3px solid ${leftBorderColor}`,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* State icon */}
              <span style={{ flexShrink: 0, display: "flex", color: module.passed ? "#167a3a" : isCritical ? "#b42318" : "var(--yi-muted)" }}>
                {module.passed ? (
                  <CheckCircle size={16} aria-hidden="true" />
                ) : module.locked ? (
                  <LockKeyhole size={16} aria-hidden="true" />
                ) : (
                  <PlayCircle size={16} aria-hidden="true" />
                )}
              </span>

              {/* Title + tag */}
              <span style={{ flex: 1, display: "grid", gap: 1 }}>
                <span style={{
                  fontFamily: "var(--font-archivo), system-ui, sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--yi-ink)",
                  lineHeight: 1.25,
                }}>
                  {module.title}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--yi-muted)",
                }}>
                  {module.requiredForKitchen ? "Core · required" : "Extra seasoning"} · {module.estimatedMinutes} min
                </span>
              </span>

              {/* Status badge */}
              <span style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.55rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "3px 7px",
                border: `1px solid ${module.passed ? "#167a3a" : isCritical ? "#b42318" : "var(--yi-frame)"}`,
                color: module.passed ? "#167a3a" : isCritical ? "#b42318" : "var(--yi-muted)",
                flexShrink: 0,
              }}>
                {module.passed ? "Passed" : module.locked ? "Locked" : "Open"}
              </span>

              {/* Chevron */}
              <span style={{ flexShrink: 0, color: "var(--yi-muted)", display: "flex" }}>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {/* Expanded panel */}
            {isOpen && (
              <div style={{
                padding: "0 14px 14px 43px",
                background: "var(--yi-card-bg)",
                borderLeft: `3px solid ${leftBorderColor}`,
              }}>
                <p style={{
                  fontFamily: "var(--font-archivo), system-ui, sans-serif",
                  fontSize: "0.82rem",
                  color: "var(--yi-copy)",
                  lineHeight: 1.55,
                  margin: "0 0 12px",
                }}>
                  {module.description}
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {canStart && (
                    <button
                      type="button"
                      onClick={() => onOpen(module)}
                      style={{
                        minHeight: 36,
                        padding: "0 16px",
                        background: "var(--yi-black)",
                        color: "var(--yi-white)",
                        border: "none",
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <PlayCircle size={13} aria-hidden="true" />
                      Start lesson
                    </button>
                  )}
                  {module.passed && (
                    <span style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.6rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#167a3a",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}>
                      <CheckCircle size={12} aria-hidden="true" /> Complete
                    </span>
                  )}
                  {module.locked && (
                    <span style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.6rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--yi-muted)",
                    }}>
                      Complete prior lessons first
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Follow the Money — persisted Academy score + practice attempts ── */
function FollowTheMoneyCard() {
  const { user, submitAttempt } = useAuth();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!user) return null;

  const best = user.academy_score;
  const attemptsUsed = user.attempts_used;
  const atLimit = attemptsUsed >= ATTEMPT_LIMIT;
  const cleared = user.credential_status === "cleared";
  const foundingHundred =
    user.member_number != null &&
    user.member_number >= FIRST_TESTER_NUMBER &&
    user.member_number <= MAX_TESTER_NUMBER;
  const mastery = best >= 95;

  async function handleAttempt() {
    if (busy || atLimit) return;
    setBusy(true);
    setErr(null);
    try {
      const { attempt } = await submitAttempt();
      setResult(attempt);
      notifyTask(
        attempt.cleared ? "Academy score cleared" : "Academy attempt recorded",
        `${attempt.score}/100 saved / best ${attempt.bestScore}/100`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't record that attempt.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono), monospace",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  return (
    <div>
      <p className="eyebrow">Chef&apos;s Bag · Academy Score</p>

      {/* Score + rank */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "2.4rem", fontWeight: 700, lineHeight: 1, color: "var(--yi-ink)" }}>
            {best}
          </span>
          <span style={{ ...mono, fontSize: "0.7rem", color: "var(--yi-muted)" }}> / 100</span>
          <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "6px 0 0" }}>
            Best score · Rank: {user.rank} · Demo / simulation score
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className={clsx("badge", cleared ? "badge-positive" : "badge-critical")}>
            {cleared ? "Cleared" : "Not yet cleared"}
          </span>
          <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: "6px 0 0" }}>
            Clearance at {PASS_THRESHOLD}+
          </p>
        </div>
      </div>

      {/* Attempt pips */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 14 }}>
        {Array.from({ length: ATTEMPT_LIMIT }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              width: 22,
              height: 6,
              background: i < attemptsUsed ? "var(--yi-ink)" : "var(--yi-hairline)",
              display: "inline-block",
            }}
          />
        ))}
        <span style={{ ...mono, fontSize: "0.55rem", color: "var(--yi-muted)", marginLeft: 6 }}>
          {attemptsUsed}/{ATTEMPT_LIMIT} attempts used
        </span>
      </div>

      <p className="copy" style={{ marginTop: 12, fontStyle: "italic" }}>
        You get three attempts. Not because we expect perfection — because mastery is correction.
      </p>
      <p className="copy" style={{ marginTop: 8 }}>
        Gordon opens the Kitchen at {PASS_THRESHOLD}, but high scores cook louder. They sharpen your Chef Scorecard, lift your Lounge status, and help other chefs trust your reasons when the table votes.
      </p>

      {/* Latest attempt result */}
      {result && (
        <div style={{ border: "1px solid var(--yi-frame)", padding: "10px 12px", marginTop: 12 }}>
          <p style={{ ...mono, fontSize: "0.58rem", color: result.cleared ? "#167a3a" : "#b46918", margin: 0 }}>
            Attempt {result.attemptsUsed} · scored {result.score} · best {result.bestScore}
            {result.cleared ? " · cleared" : result.attemptsLeft > 0 ? ` · ${result.attemptsLeft} left` : " · no attempts left"}
          </p>
        </div>
      )}

      {err && (
        <p style={{ ...mono, fontSize: "0.58rem", color: "#b42318", margin: "12px 0 0" }}>{err}</p>
      )}

      {/* Action */}
      {confirming && !atLimit ? (
        <div style={{ border: "1px solid var(--yi-frame)", marginTop: 14, padding: "12px", display: "grid", gap: 10 }}>
          <p style={{ ...mono, fontSize: "0.58rem", color: "var(--yi-ink)", margin: 0 }}>
            Submit this attempt? One Academy attempt will be used.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleAttempt}
              disabled={busy}
              style={{
                ...mono,
                minHeight: 40,
                padding: "0 16px",
                background: "var(--yi-black)",
                color: "var(--yi-white)",
                border: "none",
                fontSize: "0.62rem",
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Recording..." : "Submit?"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              style={{
                ...mono,
                minHeight: 40,
                padding: "0 16px",
                background: "transparent",
                color: "var(--yi-ink)",
                border: "1px solid var(--yi-frame)",
                fontSize: "0.62rem",
                cursor: busy ? "default" : "pointer",
              }}
            >
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={busy || atLimit}
          style={{
            ...mono,
            marginTop: 14,
            minHeight: 46,
            padding: "0 22px",
            background: atLimit ? "transparent" : "var(--yi-black)",
            color: atLimit ? "var(--yi-muted)" : "var(--yi-white)",
            border: atLimit ? "1px solid var(--yi-frame)" : "none",
            fontSize: "0.7rem",
            cursor: busy || atLimit ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {atLimit ? "All attempts used" : busy ? "Recording..." : "Submit Practice Attempt ->"}
        </button>
      )}

      {/* Microcredential + reward indicators */}
      <div style={{ borderTop: "1px solid var(--yi-hairline)", marginTop: 16, paddingTop: 12, display: "grid", gap: 6 }}>
        <p style={{ ...mono, display: "flex", alignItems: "center", gap: 6, fontSize: "0.54rem", color: cleared ? "#167a3a" : "var(--yi-muted)", margin: 0 }}>
          <BadgeCheck size={12} strokeWidth={1.8} aria-hidden /> Microcredential: {cleared ? "Cleared" : "In progress"} · Internal Young Investors microcredential pathway
        </p>
        {foundingHundred && (
          <p style={{ ...mono, display: "flex", alignItems: "center", gap: 6, fontSize: "0.54rem", color: "var(--yi-ink)", margin: 0 }}>
            <BadgeCheck size={12} strokeWidth={1.8} aria-hidden /> Founding 100 · Chef No. {String(user.member_number).padStart(3, "0")} · Launch reward indicator — subject to official Young Investors reward terms
          </p>
        )}
        {mastery && (
          <p style={{ ...mono, display: "flex", alignItems: "center", gap: 6, fontSize: "0.54rem", color: "var(--yi-ink)", margin: 0 }}>
            <BadgeCheck size={12} strokeWidth={1.8} aria-hidden /> 95+ mastery · Reward indicator — subject to official Young Investors reward terms
          </p>
        )}
      </div>
    </div>
  );
}
