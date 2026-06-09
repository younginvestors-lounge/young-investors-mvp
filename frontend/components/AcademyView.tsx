"use client";

import clsx from "clsx";
import Link from "next/link";
import { BadgeCheck, BookOpenCheck, CheckCircle, LockKeyhole, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { BrutalistButton } from "@/components/BrutalistButton";
import { BrutalistCard } from "@/components/BrutalistCard";
import { AcademyLessonModal } from "@/components/AcademyLessonModal";
import { GordonChefScorecard } from "@/components/GordonChefScorecard";
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
}

export function AcademyView({ modules, clearance, onModuleStart, onLessonOpenChange }: AcademyViewProps) {
  const passedCount = modules.filter((m) => m.passed).length;
  const totalCount = modules.length;

  const [chefName, setChefName] = useState<string | null>(null);
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
    try {
      setChefName(localStorage.getItem("yi_chef_name") || "Chef");
    } catch {
      setChefName("Chef");
    }
  }, []);

  useEffect(() => {
    return () => onLessonOpenChange?.(false);
  }, [onLessonOpenChange]);

  return (
    <section className="stack" aria-labelledby="academy-heading">
      <div>
        <p className="eyebrow">Learn before you earn</p>
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
            {clearance.complete ? "Ready for The Kitchen" : "Kitchen access locked"}
          </span>
          <span className="badge">{passedCount}/{totalCount} lessons passed</span>
        </div>
        <p className="copy">
          {clearance.complete
            ? "All required lessons are cleared. Your seat at the table is confirmed."
            : "The Kitchen opens after the required lessons are passed. Recipes stay tied to risk literacy, table discipline, and paper-trading governance."}
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

      <FollowTheMoneyCard />

      <GordonChefScorecard modules={modules} />

      <div className="stack">
        {modules.map((module) => {
          const status = module.passed ? "PASSED" : module.locked ? "LOCKED" : "OPEN";
          const isCritical = module.requiredForKitchen && !module.passed;
          const canStart = !module.locked && !module.passed;

          return (
            <BrutalistCard key={module.id} critical={isCritical}>
              <div className="module-row">
                <div style={{ display: "grid", gap: 4, flex: 1 }}>
                  <p className="eyebrow">
                    {module.requiredForKitchen ? "Core lesson — required for Kitchen" : "Extra seasoning"}
                  </p>
                  <h3 className="section-title">{module.title}</h3>
                </div>
                <span className={clsx("badge", module.passed ? "badge-positive" : isCritical ? "badge-critical" : "")}>
                  {module.passed && <CheckCircle className="icon-inline" aria-hidden="true" />}
                  {module.locked && <LockKeyhole className="icon-inline" aria-hidden="true" />}
                  {status}
                </span>
              </div>
              <p className="copy">{module.description}</p>
              <div className="status-line" style={{ marginTop: 8 }}>
                <span className="meta">{module.estimatedMinutes} min</span>
                <span className="meta">{module.id}</span>
                {canStart && (
                  <BrutalistButton
                    icon={<PlayCircle className="icon-inline" aria-hidden="true" />}
                    onClick={() => openAcademyLesson({ id: module.id, title: module.title })}
                  >
                    Start lesson
                  </BrutalistButton>
                )}
                {module.passed && (
                  <span className="meta metric-positive">
                    <CheckCircle className="icon-inline" aria-hidden="true" /> Lesson complete
                  </span>
                )}
                {module.locked && (
                  <span className="meta">Complete prior lessons to unlock</span>
                )}
              </div>
            </BrutalistCard>
          );
        })}
      </div>

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
    <BrutalistCard>
      <p className="eyebrow">Follow the Money · Academy Score</p>

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
    </BrutalistCard>
  );
}
