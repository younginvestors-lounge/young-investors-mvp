import { MOCK_MVP_DASHBOARD } from "@/lib/mockData";
import type { DashboardSnapshot } from "@/lib/types";

export function getDashboardSnapshot(): DashboardSnapshot {
  return MOCK_MVP_DASHBOARD;
}

export async function getDashboardSnapshotFuture(): Promise<DashboardSnapshot> {
  return MOCK_MVP_DASHBOARD;
}
