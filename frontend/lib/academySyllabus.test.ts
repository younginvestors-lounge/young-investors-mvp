import { describe, expect, it } from "vitest";
import { dynamicQuorum } from "./domain";
import {
  ACADEMY_LESSON_CONTENT,
  ACADEMY_LESSON_OUTCOMES,
  ACADEMY_MODULES,
  ACADEMY_PRACTICE_BEATS,
  ACADEMY_QUIZZES,
} from "./academySyllabus";

describe("Academy syllabus structure", () => {
  it("has exactly 26 modules — 13 Follow The Money + 13 Follow The Mind", () => {
    expect(ACADEMY_MODULES).toHaveLength(26);
    const money = ACADEMY_MODULES.filter((m) => (m.track ?? "follow-money") === "follow-money");
    const mind = ACADEMY_MODULES.filter((m) => m.track === "follow-mind");
    expect(money).toHaveLength(13);
    expect(mind).toHaveLength(13);
  });

  it("requires every Follow The Money module for Kitchen access and no Follow The Mind module", () => {
    for (const m of ACADEMY_MODULES) {
      if ((m.track ?? "follow-money") === "follow-money") {
        expect(m.requiredForKitchen).toBe(true);
      } else {
        expect(m.requiredForKitchen).toBe(false);
      }
    }
  });

  it("keeps every module in the 5-7 minute band", () => {
    for (const m of ACADEMY_MODULES) {
      expect(m.estimatedMinutes).toBeGreaterThanOrEqual(5);
      expect(m.estimatedMinutes).toBeLessThanOrEqual(7);
    }
  });

  it("gives every module lesson content, a practice beat, learning outcomes, and exactly 5 quiz questions", () => {
    for (const m of ACADEMY_MODULES) {
      expect(ACADEMY_LESSON_CONTENT[m.id], `missing lesson content for ${m.id}`).toBeDefined();
      expect(ACADEMY_PRACTICE_BEATS[m.id], `missing practice beat for ${m.id}`).toBeDefined();
      expect(ACADEMY_LESSON_OUTCOMES[m.id], `missing outcomes for ${m.id}`).toBeDefined();
      expect(ACADEMY_LESSON_OUTCOMES[m.id].length).toBeGreaterThan(0);

      const quizzes = ACADEMY_QUIZZES[m.id];
      expect(quizzes, `missing quizzes for ${m.id}`).toBeDefined();
      expect(quizzes, `${m.id} must have exactly 5 questions`).toHaveLength(5);

      for (const q of quizzes) {
        expect(q.options, `${m.id} question must have exactly 4 options`).toHaveLength(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThanOrEqual(3);
        expect(q.question.length).toBeGreaterThan(0);
        expect(q.gordonsAnswer.length).toBeGreaterThan(0);
        expect(q.wrongAnswer.length).toBeGreaterThan(0);
      }
    }
  });

  it("passes a module at the same dynamicQuorum() threshold that runs the Kitchen's 60% Rule", () => {
    expect(dynamicQuorum(5)).toBe(3);
  });
});
