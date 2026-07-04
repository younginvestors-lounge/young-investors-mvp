export function publicVeilEnabled(): boolean {
  const raw = process.env.YI_PUBLIC_VEIL?.trim().toLowerCase();
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "on") return true;
  if (raw === "0" || raw === "false" || raw === "no" || raw === "off") return false;
  return process.env.VERCEL_ENV === "production";
}
