"use client";

export const TASK_TOAST_EVENT = "yi:task-toast";

export function notifyTask(title: string, line?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TASK_TOAST_EVENT, { detail: { title, line } }));
}
