import clsx from "clsx";
import { Sofa, UsersRound } from "lucide-react";
import { BrutalistCard } from "@/components/BrutalistCard";
import { formatMoney, formatPercent } from "@/lib/domain";
import type { RankingRow } from "@/lib/types";

interface LoungeViewProps {
  rankings: RankingRow[];
}

function metricToneClass(value: number): string {
  if (value > 0) return "metric-positive";
  if (value < 0) return "metric-negative";
  return "metric-watch";
}

export function LoungeView({ rankings }: LoungeViewProps) {
  return (
    <section className="stack" aria-labelledby="lounge-heading">
      <div>
        <p className="eyebrow">Aggregated Kitchen status / members' room</p>
        <h2 id="lounge-heading" className="view-title">The Lounge</h2>
      </div>

      <BrutalistCard>
        <div className="status-line">
          <Sofa className="icon-inline" aria-hidden="true" />
          <span className="badge">Members' room</span>
          <span className="badge">Kitchen status board</span>
        </div>
        <p className="copy">
          The Lounge is the social room for aggregated Kitchen rankings, status, reputation, and
          cross-Kitchen comparison. Gordon can sit in the benchmark chair, but the room belongs to
          the university tables.
        </p>
      </BrutalistCard>

      <BrutalistCard>
        <div className="status-line">
          <UsersRound className="icon-inline" aria-hidden="true" />
          <span className="badge">Featured Kitchens</span>
        </div>
        <p className="copy">
          Featured Kitchens earn attention through explainable paper performance, steady
          participation, and recipes that earn the table. No hype gets a private room.
        </p>
      </BrutalistCard>

      <div className="table" role="table" aria-label="Lounge status board">
        {rankings.map((row) => (
          <div
            key={row.name}
            className={clsx("table-row", row.isGordon && "rank-one")}
            role="row"
          >
            <span className="number" role="cell">#{row.rank}</span>
            <div role="cell">
              <p className="meta">{row.institution}</p>
              <h3 className="section-title">{row.name}</h3>
              <p className="meta">{formatMoney(row.paperCapital)}</p>
            </div>
            <span className={`number ${metricToneClass(row.roiPercent)}`} role="cell">
              {formatPercent(row.roiPercent)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
