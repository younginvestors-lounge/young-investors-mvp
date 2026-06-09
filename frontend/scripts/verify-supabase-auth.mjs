#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_COLUMNS = [
  "id",
  "email",
  "display_name",
  "chef_alias",
  "age",
  "intent",
  "profile_icon",
  "profile_picture_url",
  "mode",
  "onboarding_completed",
  "rank",
  "credential_status",
  "created_at",
  "updated_at",
];

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function envValue(name) {
  const local = readEnvFile(join(process.cwd(), ".env.local"));
  const plain = readEnvFile(join(process.cwd(), ".env"));
  return process.env[name] || local[name] || plain[name] || "";
}

function line(status, label, detail = "") {
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`${status.padEnd(6)} ${label}${suffix}`);
}

async function getJson(url, anonKey) {
  const res = await fetch(url, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

async function main() {
  const supabaseUrl = envValue("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const anonKey = envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const siteUrl = envValue("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  let failures = 0;
  let warnings = 0;

  console.log("Young Investors Supabase auth verification");
  console.log("No secrets, tokens, emails, sessions, or tester rows are printed.\n");

  if (!supabaseUrl || !anonKey) {
    line("FAIL", "Supabase env", "missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    line("INFO", "Next step", "set the public Supabase URL/anon key locally or in CI, then rerun npm.cmd run verify:supabase");
    process.exit(1);
  }

  line("PASS", "Supabase env", "public URL and anon key are present");

  if (!siteUrl) {
    warnings += 1;
    line("WARN", "Site URL", "NEXT_PUBLIC_SITE_URL is missing; auth redirects may fall back to window origin");
  } else {
    line("PASS", "Site URL", "configured");
  }

  try {
    const { res, body } = await getJson(`${supabaseUrl}/auth/v1/settings`, anonKey);
    if (!res.ok) {
      failures += 1;
      line("FAIL", "Auth settings", `not reachable (${res.status})`);
    } else {
      line("PASS", "Auth settings", "reachable");

      if (body?.disable_signup === true) {
        failures += 1;
        line("FAIL", "Email signup", "disabled in Supabase Auth settings");
      } else {
        line("PASS", "Email signup", "enabled");
      }

      if (body?.external?.google === true) {
        line("PASS", "Google OAuth", "enabled");
      } else {
        failures += 1;
        line("FAIL", "Google OAuth", "not enabled in Supabase Auth settings");
      }

      if (body?.mailer_autoconfirm === true) {
        warnings += 1;
        line("WARN", "Email confirmation", "auto-confirm is ON; acceptable only for controlled frictionless tests");
      } else {
        line("PASS", "Email confirmation", "required");
      }
    }
  } catch (error) {
    failures += 1;
    line("FAIL", "Auth settings", error instanceof Error ? error.message : "unknown error");
  }

  try {
    const select = encodeURIComponent(REQUIRED_COLUMNS.join(","));
    const { res, body } = await getJson(`${supabaseUrl}/rest/v1/profiles?select=${select}&limit=1`, anonKey);
    if (!res.ok) {
      failures += 1;
      const detail = body?.message ? body.message : `HTTP ${res.status}`;
      line("FAIL", "Profiles schema", detail);
    } else {
      line("PASS", "Profiles schema", "recovered auth/onboarding columns are queryable");
    }
  } catch (error) {
    failures += 1;
    line("FAIL", "Profiles schema", error instanceof Error ? error.message : "unknown error");
  }

  try {
    const { res } = await getJson(`${supabaseUrl}/storage/v1/bucket/profile-pictures`, anonKey);
    if (res.ok) {
      line("PASS", "Profile pictures bucket", "reachable");
    } else {
      warnings += 1;
      line("WARN", "Profile pictures bucket", `could not verify with anon key (${res.status}); confirm bucket/policies in Supabase`);
    }
  } catch (error) {
    warnings += 1;
    line("WARN", "Profile pictures bucket", error instanceof Error ? error.message : "could not verify");
  }

  console.log("");
  if (failures > 0) {
    line("FAIL", "Verification", `${failures} failure(s), ${warnings} warning(s)`);
    process.exit(1);
  }
  line(warnings > 0 ? "WARN" : "PASS", "Verification", `${warnings} warning(s)`);
}

main().catch((error) => {
  line("FAIL", "Verification", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
