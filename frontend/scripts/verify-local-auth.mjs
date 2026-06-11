#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
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
  return process.env[name] || local[name] || "";
}

async function expectUrl(page, pattern, label) {
  if (pattern.test(page.url())) {
    console.log(`PASS   ${label}`);
    return;
  }
  await page.waitForURL(pattern, { timeout: 10000 });
  console.log(`PASS   ${label}`);
}

async function clickAndWaitFor(page, buttonName, selector) {
  const target = page.locator(selector);
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: buttonName }).click();
  try {
    await target.waitFor({ state: "visible", timeout: 2500 });
  } catch {
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: buttonName }).click();
    await target.waitFor({ state: "visible", timeout: 10000 });
  }
}

async function main() {
  const baseUrl = process.env.YI_AUTH_BASE_URL || "http://127.0.0.1:3000";
  const supabaseUrl = envValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (supabaseUrl || anonKey) {
    console.error("FAIL   Local auth verifier refused to run because Supabase env is configured.");
    console.error("INFO   Use npm.cmd run verify:supabase for live Supabase checks.");
    process.exit(1);
  }

  const ping = await fetch(`${baseUrl}/login`).catch(() => null);
  if (!ping || !ping.ok) {
    console.error(`FAIL   Dev server is not reachable at ${baseUrl}`);
    console.error("INFO   Start it with: npm.cmd run dev -- --hostname 127.0.0.1 --port 3000");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});

    await page.getByText(/New with us/i).first().waitFor({ state: "visible", timeout: 10000 });
    await page.getByText(/Already cooking with us/i).first().waitFor({ state: "visible", timeout: 10000 });
    console.log("PASS   /login shows new and returning auth lanes");

    await clickAndWaitFor(page, "Sign up with email", "#signup-email");
    await page.locator("#signup-email").fill("local-auth-smoke@example.test");
    await page.locator("#display-name").fill("Local Auth Smoke");
    await page.locator("#chef-alias").fill("Chef Smoke");
    await page.locator("#signup-password").fill("local-smoke-password");
    await page.locator("#signup-confirm").fill("local-smoke-password");
    await page.getByRole("button", { name: "Create account" }).click();
    await expectUrl(page, /\/onboarding/, "Signup creates local session and routes to onboarding");

    await page.locator("#display-name").fill("Local Auth Smoke");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator("#chef-alias").fill("Chef Smoke");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator("#age").fill("19");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Learn the craft" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Meet Gordon" }).click();
    await expectUrl(page, /\/gordon-intro/, "Onboarding completes and routes to the Gordon briefing");

    const storedProfile = await page.evaluate(() => JSON.parse(localStorage.getItem("yi_local_profile") || "{}"));
    if (storedProfile.onboarding_completed !== true) {
      throw new Error("Local profile did not persist onboarding_completed=true.");
    }
    if (storedProfile.mode !== "full_simulation") {
      throw new Error("Adult local profile did not persist full_simulation mode.");
    }
    console.log("PASS   Profile persistence includes onboarding completion and mode");

    await page.evaluate(() => localStorage.removeItem("yi_local_session_active"));
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await clickAndWaitFor(page, "Sign in with email", "#signin-email");
    await page.locator("#signin-email").fill("local-auth-smoke@example.test");
    await page.locator("#signin-password").fill("local-smoke-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expectUrl(page, /\/lobby/, "Returning local user signs in and routes to the Lobby");

    await page.goto(`${baseUrl}/reset-password`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.locator("#email").fill("local-auth-smoke@example.test");
    await page.waitForFunction(() => {
      const button = Array.from(document.querySelectorAll("button")).find((item) =>
        item.textContent?.includes("Send reset link")
      );
      return !!button && !button.disabled;
    });
    await page.getByRole("button", { name: /Send reset link/ }).click();
    await page.getByText(/does not send reset email/i).waitFor({ state: "visible", timeout: 10000 });
    console.log("PASS   Local reset screen is honest and does not call email auth");

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    if (horizontalOverflow) throw new Error("Mobile viewport has horizontal overflow.");
    const realErrors = consoleErrors.filter((text) => !text.includes("404"));
    if (realErrors.length > 0) throw new Error(`Console errors: ${realErrors.slice(0, 3).join(" | ")}`);
    console.log("PASS   Mobile viewport has no horizontal overflow or console errors");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`FAIL   ${error instanceof Error ? error.message : "Unknown local auth verification error"}`);
  process.exit(1);
});
