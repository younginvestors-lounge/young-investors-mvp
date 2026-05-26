import { BrutalistCard } from "@/components/BrutalistCard";
import { formatMoney, formatPercent } from "@/lib/domain";
import type { MacroNewsCard, MarketTicker, TimesFeature } from "@/lib/types";

interface ShopViewProps {
  feature: TimesFeature;
  secondaryArticles: TimesFeature[];
  tickers: MarketTicker[];
  news: MacroNewsCard[];
}

function metricToneClass(value: number): string {
  if (value > 0) return "metric-positive";
  if (value < 0) return "metric-negative";
  return "metric-watch";
}

export function ShopView({ feature, secondaryArticles, tickers, news }: ShopViewProps) {
  return (
    <section className="stack" aria-labelledby="shop-heading">
      <div>
        <p className="eyebrow">Culture, signals, and taste</p>
        <h2 id="shop-heading" className="view-title">The Shop</h2>
      </div>

      {/* Lead article */}
      <section className="feature-block" aria-label="Young Investor Times lead article">
        <p className="eyebrow">{feature.kicker}</p>
        <h3 className="feature-title">{feature.title}</h3>
        <p className="subtitle">{feature.deck}</p>
        <p className="meta">{feature.byline}</p>
      </section>

      {/* Secondary articles */}
      {secondaryArticles.length > 0 && (
        <div className="grid grid-two">
          {secondaryArticles.map((article) => (
            <BrutalistCard key={article.title}>
              <p className="eyebrow">{article.kicker}</p>
              <h3 className="section-title">{article.title}</h3>
              <p className="copy">{article.deck}</p>
              <p className="meta" style={{ marginTop: 8 }}>{article.byline}</p>
            </BrutalistCard>
          ))}
        </div>
      )}

      {/* JSE tickers */}
      <div>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Market signals / JSE &amp; global</p>
        <div className="grid grid-three" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {tickers.map((ticker) => (
            <BrutalistCard key={ticker.symbol} critical={ticker.critical}>
              <div className="ticker-row">
                <span className="proposal-symbol ticker">{ticker.symbol}</span>
                <span className={`badge ${ticker.critical ? "badge-critical" : metricToneClass(ticker.changePercent)}`}>
                  {formatPercent(ticker.changePercent)}
                </span>
              </div>
              <h3 className="section-title">{ticker.name}</h3>
              <p className="metric-number">{formatMoney(ticker.price)}</p>
            </BrutalistCard>
          ))}
        </div>
      </div>

      {/* Macro news */}
      <div className="grid grid-two">
        {news.map((item) => (
          <BrutalistCard key={item.id} critical={item.critical}>
            <p className="eyebrow">{item.region}</p>
            <h3 className="section-title">{item.headline}</h3>
            <p className="copy">{item.summary}</p>
          </BrutalistCard>
        ))}
      </div>
    </section>
  );
}
