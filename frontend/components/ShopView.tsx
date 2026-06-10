"use client";

import { useState } from "react";
import { CandlestickChart, Newspaper, PackageOpen } from "lucide-react";
import { JSEMarket } from "@/components/JSEMarket";
import { RevealBox } from "@/components/RevealBox";
import { useLiveTickers } from "@/lib/useLiveTickers";
import { formatMoney, formatPercent } from "@/lib/domain";
import type { MacroNewsCard, MarketTicker, TimesFeature } from "@/lib/types";

interface ShopViewProps {
  feature: TimesFeature;
  secondaryArticles: TimesFeature[];
  tickers: MarketTicker[];
  news: MacroNewsCard[];
}

function toneColor(v: number) {
  if (v > 0) return "#167a3a";
  if (v < 0) return "#b42318";
  return "#888";
}

type ShopAisle = "stocks" | "articles" | "future";

const SHOP_AISLES: { id: ShopAisle; label: string; Icon: typeof CandlestickChart }[] = [
  { id: "stocks", label: "Stock Aisle", Icon: CandlestickChart },
  { id: "articles", label: "Times & News", Icon: Newspaper },
  { id: "future", label: "Future Markets", Icon: PackageOpen },
];

export function ShopView({ feature, secondaryArticles, tickers: fallbackTickers, news }: ShopViewProps) {
  const { tickers } = useLiveTickers(fallbackTickers);
  const [aisle, setAisle] = useState<ShopAisle>("stocks");

  return (
    <section style={{ display: "grid", gap: 20 }} aria-labelledby="shop-heading">

      {/* Header */}
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
          Culture, signals, and taste
        </p>
        <h2 id="shop-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.3rem,5vw,1.55rem)", fontWeight: 600, margin: 0, lineHeight: 1.08 }}>
          The Shop
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid var(--yi-frame)" }} aria-label="Shop aisles">
        {SHOP_AISLES.map(({ id, label, Icon }, i) => {
          const active = aisle === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAisle(id)}
              aria-pressed={active}
              style={{
                minHeight: 46,
                border: "none",
                borderRight: i < SHOP_AISLES.length - 1 ? "1px solid var(--yi-frame)" : "none",
                background: active ? "var(--yi-black)" : "transparent",
                color: active ? "var(--yi-white)" : "var(--yi-ink)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "0 8px",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "clamp(0.52rem,1.8vw,0.62rem)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              <Icon size={14} strokeWidth={1.8} aria-hidden />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* The JSE — what's on the menu, with Gordon's heat check */}
      <div style={{ display: aisle === "stocks" ? "grid" : "none", gap: 12 }}>
        <RevealBox symbol={<CandlestickChart size={15} strokeWidth={1.8} aria-hidden />} title="Stock Aisle" meta="Long-press to add to Shelf" defaultOpen>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CandlestickChart size={16} strokeWidth={1.8} aria-hidden style={{ color: "var(--yi-ink)" }} />
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
            The JSE · Top 40 · tap a stock for Gordon&apos;s heat check
          </p>
        </div>
        <JSEMarket />
        </RevealBox>
      </div>

      {/* Lead article */}
      <div style={{ display: aisle === "articles" ? "grid" : "none", gap: 12 }}>
      <RevealBox symbol={<Newspaper size={15} strokeWidth={1.8} aria-hidden />} title="Young Investor Times" meta="Reasoning before recipes" defaultOpen>
      <div style={{ border: "1px solid var(--yi-frame)", padding: "18px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
          {feature.kicker}
        </p>
        <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.3rem,5vw,1.7rem)", fontWeight: 600, lineHeight: 1.1, margin: "0 0 10px", wordBreak: "break-word" }}>
          {feature.title}
        </h3>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.85rem,3vw,0.95rem)", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 10px", wordBreak: "break-word" }}>
          {feature.deck}
        </p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,1.8vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
          {feature.byline}
        </p>
      </div>
      </RevealBox>

      {/* Secondary articles */}
      <RevealBox symbol={<Newspaper size={15} strokeWidth={1.8} aria-hidden />} title="Market Stories" meta={`${secondaryArticles.length + news.length} reads`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: 12 }}>
        {secondaryArticles.map((a) => (
          <div key={a.title} style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,1.8vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 8px" }}>{a.kicker}</p>
            <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1rem,4vw,1.18rem)", fontWeight: 600, lineHeight: 1.2, margin: "0 0 8px", wordBreak: "break-word" }}>{a.title}</h3>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.8rem,2.8vw,0.88rem)", lineHeight: 1.55, color: "var(--yi-copy)", margin: "0 0 8px", wordBreak: "break-word" }}>{a.deck}</p>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.46rem,1.6vw,0.56rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>{a.byline}</p>
          </div>
        ))}
      </div>

      {/* JSE tickers */}
      <div style={{ display: aisle === "stocks" ? "block" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
            Market signals · JSE &amp; global
          </p>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--yi-hairline)", color: "var(--yi-muted)", padding: "2px 6px" }}>
            Simulated
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,160px),1fr))", gap: 10 }}>
          {tickers.map((ticker) => (
            <div key={ticker.symbol} style={{ border: `1px solid ${ticker.critical ? "#b42318" : "var(--yi-frame)"}`, borderLeft: `2px solid ${toneColor(ticker.changePercent)}`, padding: "12px 12px", background: "var(--yi-card-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 4 }}>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.82rem,3vw,1rem)", lineHeight: 1, color: "var(--yi-ink)", letterSpacing: "0.02em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ticker.symbol}
                </span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.6rem,2vw,0.7rem)", fontWeight: 600, color: toneColor(ticker.changePercent), flexShrink: 0 }}>
                  {formatPercent(ticker.changePercent)}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.7rem,2.5vw,0.78rem)", color: "var(--yi-muted)", margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {ticker.name}
              </p>
              <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.82rem,3vw,0.95rem)", fontWeight: 600, color: "var(--yi-ink)", margin: 0 }}>
                {formatMoney(ticker.price)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Macro news */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: 12, marginTop: 12 }}>
        {news.map((item) => (
          <div key={item.id} style={{ border: `1px solid ${item.critical ? "#b42318" : "var(--yi-frame)"}`, padding: "14px 16px", background: "var(--yi-card-bg)" }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,1.8vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: item.critical ? "#b42318" : "var(--yi-muted)", margin: "0 0 6px" }}>{item.region}</p>
            <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(0.95rem,3.5vw,1.1rem)", fontWeight: 600, lineHeight: 1.2, margin: "0 0 8px", wordBreak: "break-word" }}>{item.headline}</h3>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.8rem,2.8vw,0.88rem)", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0, wordBreak: "break-word" }}>{item.summary}</p>
          </div>
        ))}
      </div>
      </RevealBox>
      </div>

      {aisle === "future" && (
        <RevealBox symbol={<PackageOpen size={15} strokeWidth={1.8} aria-hidden />} title="Future Markets" meta="Reserved education shelves" defaultOpen>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: 12 }}>
          {[
            { title: "Capital Market Aisle", line: "Bonds, rates, and credit modules will live here once Gordon has the syllabus ready." },
            { title: "Commodity Market Aisle", line: "Gold, platinum, oil, maize, and resource-cycle lessons are reserved for the next shelf." },
            { title: "Currency Market Aisle", line: "FX, rand shocks, and regional money flows stay labelled as future education, not live trading." },
          ].map((item) => (
            <article key={item.title} style={{ border: "1px solid var(--yi-frame)", padding: "15px 16px", background: "var(--yi-card-bg)" }}>
              <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 8px" }}>
                Future module
              </p>
              <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.2, color: "var(--yi-ink)", margin: "0 0 8px" }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
                {item.line}
              </p>
            </article>
          ))}
        </div>
        </RevealBox>
      )}

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.46rem,1.6vw,0.56rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
        Simulated prices · MOCK_MVP_PAPER_TRADING_ONLY · Not financial advice
      </p>
    </section>
  );
}
