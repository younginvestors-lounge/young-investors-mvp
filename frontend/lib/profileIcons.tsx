/**
 * Profile-icon catalog. The `key` values MUST match the backend
 * ChefUser.profile_icon choices in accounts/models.py exactly.
 */
import {
  ChefHat,
  Utensils,
  CookingPot,
  Flame,
  DollarSign,
  TrendingUp,
  Shield,
  Scale,
  Star,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface ProfileIconDef {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const PROFILE_ICONS: ProfileIconDef[] = [
  { key: "chef-default", label: "Chef", Icon: ChefHat },
  { key: "flame", label: "Flame", Icon: Flame },
  { key: "pot", label: "Pot", Icon: CookingPot },
  { key: "spoon", label: "Utensils", Icon: Utensils },
  { key: "dollar", label: "Capital", Icon: DollarSign },
  { key: "growth", label: "Growth", Icon: TrendingUp },
  { key: "shield", label: "Shield", Icon: Shield },
  { key: "balance", label: "Balance", Icon: Scale },
  { key: "star", label: "Star", Icon: Star },
  { key: "chart", label: "Chart", Icon: BarChart3 },
];

const ICON_BY_KEY: Record<string, LucideIcon> = Object.fromEntries(
  PROFILE_ICONS.map((i) => [i.key, i.Icon])
);

export function getProfileIcon(key: string | null | undefined): LucideIcon {
  return (key && ICON_BY_KEY[key]) || ChefHat;
}
