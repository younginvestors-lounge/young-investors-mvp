"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { BrutalistCard } from "@/components/BrutalistCard";
import { useAuth } from "@/lib/auth-context";
import {
  buildGordonChefScorecard,
  clearGordonChefMemory,
  readGordonChefReasons,
  type GordonChefConceptReview,
  type GordonChefReasonMemory,
  type GordonChefScorecard as GordonChefScorecardModel,
  type GordonScorecardModule,
} from "@/lib/gordonKnowledgeBank";

interface GordonChefScorecardProps {
  modules: GordonScorecardModule[];
}

const mono: CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

function statusColor(status: GordonChefConceptReview["status"]): string {
  if (status === "strong") return "#167a3a";
  if (status === "polish") return "#b46918";
  return "#b42318";
}

function scoreLabel(status: GordonChefConceptReview["status"]): string {
  if (status === "strong") return "Master";
  if (status === "polish") return "Intermediate";
  return "Junior";
}

function ScoreRow({ review }: { review: GordonChefConceptReview }) {
  const color = statusColor(review.status);

  return (
    <div style={{ border: "1px solid var(--yi-frame)", padding: "12px 14px", display: "grid", gap: 7 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>
          {review.area}
        </p>
        <span style={{ ...mono, color, fontSize: "0.56rem" }}>
          {scoreLabel(review.status)} / {review.score}
        </span>
      </div>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.78rem", lineHeight: 1.45, color: "var(--yi-copy)", margin: 0 }}>
        {review.nextAction}
      </p>
    </div>
  );
}

function RecentReason({ memory }: { memory: GordonChefReasonMemory }) {
  return (
    <div style={{ borderLeft: "2px solid var(--yi-black)", paddingLeft: 10 }}>
      <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "0 0 4px" }}>
        {memory.action.replace("-", " ")} {memory.ticker ? `/ ${memory.ticker}` : ""} / {memory.wordCount} words
      </p>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.78rem", color: "var(--yi-copy)", lineHeight: 1.45, margin: 0 }}>
        {memory.reason}
      </p>
    </div>
  );
}

function ScorecardBody({
  scorecard,
  onClearMemory,
}: {
  scorecard: GordonChefScorecardModel;
  onClearMemory: () => void;
}) {
  const visibleReviews = [
    ...scorecard.gaps,
    ...scorecard.polishing,
    ...scorecard.strengths,
  ].slice(0, 4);

  return (
    <BrutalistCard>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <p className="eyebrow">Gordon / Chef Scorecard</p>
          <h3 className="section-title">Chef Scorecard</h3>
          <p className="copy" style={{ margin: "6px 0 0" }}>
            Measures your strengths and gaps across Gordon&apos;s concepts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "2.35rem", fontWeight: 700, lineHeight: 1 }}>
              {scorecard.overallScore}
            </span>
            <span style={{ ...mono, fontSize: "0.7rem", color: "var(--yi-muted)" }}> / 100</span>
            <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "6px 0 0" }}>
              Rank: {scorecard.rank} / Clearance: {scorecard.status}
            </p>
            <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>
              Tiers: Junior / Intermediate / Master
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="badge">Memory: {scorecard.rememberedReasonCount} reason{scorecard.rememberedReasonCount === 1 ? "" : "s"}</span>
            <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: "6px 0 0" }}>
              Local demo memory
            </p>
          </div>
        </div>

        <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 12 }}>
          <p style={{ ...mono, fontSize: "0.56rem", color: "#b42318", margin: "0 0 5px" }}>Gordon&apos;s read</p>
          <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.05rem", lineHeight: 1.35, margin: 0 }}>
            {scorecard.gordonLine}
          </p>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {visibleReviews.map((review) => (
            <ScoreRow key={review.id} review={review} />
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--yi-hairline)", paddingTop: 12, display: "grid", gap: 10 }}>
          <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: 0 }}>
            Recent reasons Gordon remembers
          </p>
          {scorecard.recentReasons.length > 0 ? (
            scorecard.recentReasons.map((memory) => <RecentReason key={memory.id} memory={memory} />)
          ) : (
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", color: "var(--yi-copy)", lineHeight: 1.5, margin: 0 }}>
              No recipe reasons recorded yet. Submit or vote on a Kitchen recipe and Gordon will start tracking the thinking.
            </p>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--yi-hairline)", paddingTop: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: 0, maxWidth: 470, lineHeight: 1.5 }}>
            {scorecard.privacyLine}
          </p>
          {scorecard.rememberedReasonCount > 0 && (
            <button
              type="button"
              onClick={onClearMemory}
              style={{
                ...mono,
                minHeight: 34,
                padding: "0 12px",
                border: "1px solid var(--yi-frame)",
                background: "transparent",
                color: "var(--yi-muted)",
                fontSize: "0.52rem",
                cursor: "pointer",
              }}
            >
              Clear local memory
            </button>
          )}
        </div>
      </div>
    </BrutalistCard>
  );
}

export function GordonChefScorecard({ modules }: GordonChefScorecardProps) {
  const { user } = useAuth();
  const [reasons, setReasons] = useState<GordonChefReasonMemory[]>([]);

  useEffect(() => {
    if (!user) {
      setReasons([]);
      return;
    }
    setReasons(readGordonChefReasons(user.id));
  }, [user]);

  const scorecard = useMemo(() => {
    if (!user) return null;
    return buildGordonChefScorecard(user, modules, reasons);
  }, [modules, reasons, user]);

  if (!user || !scorecard) return null;

  return (
    <ScorecardBody
      scorecard={scorecard}
      onClearMemory={() => {
        clearGordonChefMemory(user.id);
        setReasons([]);
      }}
    />
  );
}
