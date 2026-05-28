"use client";

import { useState } from "react";
import type { ChefVote, KitchenMember } from "@/lib/types";

type GovernanceModel = "slow-cook" | "high-heat";

const INITIAL_MEMBERS: KitchenMember[] = [
  { id: "carl",   name: "Carl (You)",  vote: null,       isUser: true },
  { id: "naledi", name: "Naledi",      vote: "FOR",      isUser: false },
  { id: "sipho",  name: "Sipho",       vote: "FOR",      isUser: false },
  { id: "thandi", name: "Thandi",      vote: "AGAINST",  isUser: false },
  { id: "lwazi",  name: "Lwazi",       vote: null,       isUser: true },
];

const SECOND_MEMBER_ID = "lwazi";

function calcResult(members: KitchenMember[]) {
  const cast = members.filter((m) => m.vote === "FOR" || m.vote === "AGAINST");
  const forCount = members.filter((m) => m.vote === "FOR").length;
  const againstCount = members.filter((m) => m.vote === "AGAINST").length;
  const quorumMet = cast.length >= 3;
  const total = forCount + againstCount;
  const forRatio = total > 0 ? forCount / total : 0;
  const passes = quorumMet && forRatio >= 0.6;
  return { forCount, againstCount, castCount: cast.length, quorumMet, forRatio, passes };
}

const GOVERNANCE_NOTES: Record<GovernanceModel, string> = {
  "slow-cook": "Slow Cook · Long game. Democratic consensus, diversified plates, patient capital. Every chef votes equal.",
  "high-heat":  "High Heat · Tactical. Asymmetric strategies, shorter holds, non-negotiable exit discipline. The mandate runs hot.",
};

export function KitchenView() {
  const [model, setModel] = useState<GovernanceModel>("slow-cook");
  const [members, setMembers] = useState<KitchenMember[]>(INITIAL_MEMBERS);

  function castVote(memberId: string, vote: ChefVote) {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return { ...m, vote: m.vote === vote ? null : vote };
      })
    );
  }

  const result = calcResult(members);
  const barWidth = result.forRatio * 100;
  const passes = result.passes;

  return (
    <section style={{ display: "grid", gap: 22 }} aria-labelledby="kitchen-heading">

      {/* Header */}
      <div>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 6px",
        }}>
          The Kitchen Floor · recipes, taste votes, table consensus
        </p>
        <h2 id="kitchen-heading" style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "1.55rem",
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.08,
        }}>
          The Kitchen
        </h2>
      </div>

      {/* Kitchen meta + governance toggle */}
      <div style={{
        border: "1px solid var(--yi-frame, #ccc)",
        padding: "16px",
        background: "var(--yi-card-bg, #fff)",
      }}>
        <p style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "1.28rem",
          fontWeight: 600,
          margin: "0 0 4px",
        }}>
          Rhodes Test Kitchen
        </p>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 16px",
        }}>
          5 members · simulated pool R60,000
        </p>

        {/* Governance toggle */}
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 8px",
        }}>
          Governance model
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          border: "1px solid var(--yi-frame, #ccc)",
          maxWidth: 380,
          marginBottom: 12,
        }}>
          {(["slow-cook", "high-heat"] as GovernanceModel[]).map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => setModel(m)}
              style={{
                minHeight: 44,
                border: "none",
                borderRight: i === 0 ? "1px solid var(--yi-frame, #ccc)" : "none",
                borderBottom: model === m ? "2px solid var(--yi-black, #111)" : "2px solid transparent",
                background: model === m ? "var(--yi-white, #fff)" : "transparent",
                color: model === m ? "var(--yi-ink, #111)" : "var(--yi-muted, #888)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                padding: "8px 12px",
                transition: "all 180ms ease",
              }}
            >
              {m === "slow-cook" ? "Slow Cook" : "High Heat"}
            </button>
          ))}
        </div>
        <p style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: "0.88rem",
          color: "var(--yi-copy, #333)",
          margin: "0 0 8px",
          lineHeight: 1.52,
        }}>
          {GOVERNANCE_NOTES[model]}
        </p>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.58rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--yi-muted, #aaa)",
          margin: 0,
        }}>
          Educational governance template · not a licensed fund
        </p>
      </div>

      {/* Proposal */}
      <div style={{
        border: "1px solid var(--yi-frame, #ccc)",
        padding: "16px",
        background: "var(--yi-card-bg, #fff)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--yi-muted, #888)",
            border: "1px solid var(--yi-frame, #ccc)",
            padding: "4px 7px",
          }}>
            Recipe #014
          </span>
          <span style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--yi-muted, #888)",
            border: "1px solid var(--yi-frame, #ccc)",
            padding: "4px 7px",
          }}>
            BUY
          </span>
        </div>

        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "1.55rem",
          lineHeight: 1,
          margin: "0 0 4px",
          color: "var(--yi-ink, #111)",
        }}>
          NPN.JO
        </p>
        <h3 style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "1.18rem",
          fontWeight: 600,
          margin: "0 0 10px",
          lineHeight: 1.18,
        }}>
          Naspers Limited
        </h3>
        <p style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: "0.9rem",
          color: "var(--yi-copy, #333)",
          margin: "0 0 14px",
          lineHeight: 1.55,
        }}>
          Buy 50 units of Naspers at market. Tencent discount thesis — trades below sum-of-parts. ~28% of book.
        </p>

        {/* Gordon risk note */}
        <div style={{
          borderLeft: "2px solid #b42318",
          paddingLeft: 14,
          marginBottom: 18,
        }}>
          <p style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#b42318",
            margin: "0 0 6px",
          }}>
            Gordon · Risk Note
          </p>
          <p style={{
            fontFamily: "var(--font-archivo), system-ui, sans-serif",
            fontSize: "0.88rem",
            color: "var(--yi-copy, #333)",
            margin: 0,
            lineHeight: 1.52,
          }}>
            You want 28% of this Kitchen in one stock? I&apos;ve seen this before. I&apos;m not stopping you — but explain to me why this is smart. &quot;It looked good on Twitter&quot; is not a recipe.
          </p>
        </div>

        {/* Vote bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.62rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--yi-muted, #888)",
            }}>
              {result.forCount} For · {result.againstCount} Against · {5 - result.castCount} Pending
            </span>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: passes ? "#167a3a" : "#b42318",
              letterSpacing: "0.08em",
            }}>
              {passes ? "PASSES" : "NOT PASSING"}
            </span>
          </div>

          {/* Bar track */}
          <div style={{
            position: "relative",
            height: 28,
            border: "1px solid var(--yi-frame, #ccc)",
            background: "var(--yi-white, #fff)",
          }}>
            <div style={{
              height: "100%",
              width: `${barWidth}%`,
              background: passes ? "#167a3a" : barWidth > 0 ? "#b46918" : "transparent",
              transition: "width 260ms ease, background 260ms ease",
            }} />
            {/* 60% threshold line */}
            <div style={{
              position: "absolute",
              top: -5,
              bottom: -5,
              left: "60%",
              width: 1,
              background: "#111",
            }} />
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 4,
          }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.58rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--yi-muted, #888)",
            }}>
              60% threshold
            </span>
          </div>

          {/* Quorum status */}
          <p style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: result.quorumMet ? "#167a3a" : "#b46918",
            margin: "6px 0 0",
          }}>
            {result.quorumMet
              ? `Quorum met · ${result.castCount}/5 voted`
              : `Quorum needed · ${result.castCount}/3 cast so far`}
          </p>
        </div>
      </div>

      {/* Member votes */}
      <div style={{
        border: "1px solid var(--yi-frame, #ccc)",
        background: "var(--yi-card-bg, #fff)",
      }}>
        <div style={{
          borderBottom: "1px solid var(--yi-hairline, #eee)",
          padding: "12px 16px",
        }}>
          <p style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--yi-muted, #888)",
            margin: 0,
          }}>
            Cast your vote
          </p>
        </div>

        {members.map((member) => (
          <div key={member.id} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--yi-hairline, #eee)",
            gap: 12,
          }}>
            <div>
              <p style={{
                fontFamily: "var(--font-archivo), system-ui, sans-serif",
                fontSize: "0.9rem",
                fontWeight: member.isUser ? 600 : 400,
                margin: 0,
                color: "var(--yi-ink, #111)",
              }}>
                {member.name}
              </p>
              {member.isUser && (
                <p style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.58rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--yi-muted, #888)",
                  margin: "2px 0 0",
                }}>
                  Your vote
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {member.isUser ? (
                <>
                  {(["FOR", "AGAINST", "ABSTAIN"] as ChefVote[]).map((v) => (
                    <button
                      key={v!}
                      type="button"
                      onClick={() => castVote(member.id, v)}
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.62rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "6px 10px",
                        border: member.vote === v
                          ? `1px solid ${v === "FOR" ? "#167a3a" : v === "AGAINST" ? "#b42318" : "#888"}`
                          : "1px solid var(--yi-frame, #ccc)",
                        background: member.vote === v
                          ? v === "FOR" ? "#167a3a" : v === "AGAINST" ? "#b42318" : "#555"
                          : "transparent",
                        color: member.vote === v ? "#fff" : "var(--yi-ink, #111)",
                        cursor: "pointer",
                        transition: "all 160ms ease",
                        minHeight: 32,
                      }}
                    >
                      {v === "FOR" ? "For" : v === "AGAINST" ? "Against" : "Pass"}
                    </button>
                  ))}
                </>
              ) : (
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "5px 10px",
                  border: "1px solid var(--yi-frame, #ccc)",
                  color: member.vote === "FOR"
                    ? "#167a3a"
                    : member.vote === "AGAINST"
                    ? "#b42318"
                    : "var(--yi-muted, #888)",
                  borderColor: member.vote === "FOR"
                    ? "#167a3a"
                    : member.vote === "AGAINST"
                    ? "#b42318"
                    : "var(--yi-frame, #ccc)",
                }}>
                  {member.vote ?? "Pending"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "0.58rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--yi-muted, #aaa)",
        margin: 0,
      }}>
        Kitchen votes are mock governance signals in this demo · No live execution
      </p>
    </section>
  );
}
