"use client";

import { useEffect, useState } from "react";
import { getProfileIcon } from "@/lib/profileIcons";
import { getChefCard, type ChefCard } from "@/lib/profileStore";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

interface ChefIdentityCardProps {
  userId: string;
  /** Shown immediately while the real card loads, and as a fallback if it can't load. */
  fallbackName: string;
  fallbackIcon: string;
  onClose: () => void;
}

function MetricCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.16)", padding: "10px 8px", textAlign: "center" }}>
      <p style={{ ...mono, fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>{value}</p>
      <p style={{ ...mono, fontSize: "0.48rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>{label}</p>
    </div>
  );
}

/** The Chef's Card — a black scorecard for viewing any chef, from the Kitchen or the Lounge. */
export function ChefIdentityCard({ userId, fallbackName, fallbackIcon, onClose }: ChefIdentityCardProps) {
  const [card, setCard] = useState<ChefCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getChefCard(userId)
      .then((c) => { if (!cancelled) setCard(c); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const alias = card?.chefAlias || fallbackName;
  const icon = card?.profileIcon || fallbackIcon;
  const Icon = getProfileIcon(icon);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 130,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          background: "var(--yi-black)",
          border: "1px solid #000",
          padding: "24px 20px 28px",
          display: "grid",
          gap: 16,
          animation: "chef-card-in 200ms ease",
        }}
      >
        <style>{`@keyframes chef-card-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, background: "rgba(255,255,255,0.06)",
          }}>
            {card?.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.profilePictureUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Icon size={28} strokeWidth={1.5} color="#fff" />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.35rem", fontWeight: 600, margin: 0, lineHeight: 1.1, color: "#fff" }}>
              {alias}
            </p>
            <p style={{ ...mono, fontSize: "0.58rem", color: "rgba(255,255,255,0.6)", margin: "4px 0 0" }}>
              {card?.memberNumber != null ? `Chef #${card.memberNumber} · ` : ""}{card?.rank ?? "Commis"}
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ ...mono, fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>Reading the card…</p>
        ) : !card ? (
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5 }}>
            This chef&apos;s card isn&apos;t available in local demo mode.
          </p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <MetricCell label="Academy" value={card.academyScore} />
              <MetricCell label="Kitchen" value={card.kitchenScore} />
              <MetricCell label="JSE Read" value={card.jseMarketScore} />
              <MetricCell label="Predictions" value={card.personalPredictionScore} />
              <MetricCell label="Kitchen Calls" value={card.kitchenPredictionScore} />
              <MetricCell label="Clearance" value={card.credentialStatus === "cleared" ? "Cleared" : "Training"} />
            </div>
            {card.currentKitchen && (
              <p style={{ ...mono, fontSize: "0.5rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Cooking in {card.currentKitchen}
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
            fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem",
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "10px 16px", cursor: "pointer", color: "#fff",
            justifySelf: "start",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
