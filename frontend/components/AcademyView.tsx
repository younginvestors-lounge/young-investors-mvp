"use client";

import clsx from "clsx";
import { BookOpenCheck, CheckCircle, LockKeyhole, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { BrutalistButton } from "@/components/BrutalistButton";
import { BrutalistCard } from "@/components/BrutalistCard";
import { AcademyLessonModal } from "@/components/AcademyLessonModal";
import type { AcademyClearance, AcademyModule } from "@/lib/types";

interface AcademyViewProps {
  modules: AcademyModule[];
  clearance: AcademyClearance;
  onModuleStart: (moduleId: string) => void;
}

export function AcademyView({ modules, clearance, onModuleStart }: AcademyViewProps) {
  const passedCount = modules.filter((m) => m.passed).length;
  const totalCount = modules.length;

  const [chefName, setChefName] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    try {
      setChefName(localStorage.getItem("yi_chef_name") || "Chef");
    } catch {
      setChefName("Chef");
    }
  }, []);

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
            Welcome to the Academy, Chef {chefName}.
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
                    onClick={() => setOpenLesson({ id: module.id, title: module.title })}
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
          onClose={() => setOpenLesson(null)}
          onPass={(moduleId) => {
            onModuleStart(moduleId);
          }}
        />
      )}
    </section>
  );
}
