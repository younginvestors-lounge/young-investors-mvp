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

async function clickAndWaitFor(page, buttonName, selector) {
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: buttonName }).click();
  await page.locator(selector).waitFor({ state: "visible", timeout: 10000 });
}

async function signUp(page, email, password, alias) {
  await clickAndWaitFor(page, "Sign up with email", "#signup-email");
  await page.locator("#signup-email").fill(email);
  await page.locator("#display-name").fill("YI Live Auth Smoke");
  await page.locator("#chef-alias").fill(alias);
  await page.locator("#signup-password").fill(password);
  await page.locator("#signup-confirm").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
}

async function signIn(page, email, password) {
  await clickAndWaitFor(page, "Sign in with email", "#signin-email");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function completeOnboarding(page) {
  await page.locator("#display-name").fill("YI Live Auth Smoke");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("#chef-alias").fill(`Chef Live Verified ${Date.now()}`);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("#age").fill("19");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Learn the craft" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Meet Gordon" }).click();
  // Onboarding hands off to the Gordon/Sicilia briefing, which later routes to /academy.
  await page.waitForFunction(() => location.pathname === "/gordon-intro", null, { timeout: 30000 });
}

async function waitForRoute(page, routes) {
  await page.waitForFunction((allowed) => allowed.includes(location.pathname), routes, { timeout: 30000 });
  return page.evaluate(() => location.pathname);
}

async function currentProfile(page, supabaseUrl, anonKey) {
  return page.evaluate(
    async ({ supabaseUrl: base, anonKey: key }) => {
      const storageKeys = Object.keys(localStorage).filter((item) => item.includes("supabase") || item.includes("sb-"));
      let token = "";
      for (const storageKey of storageKeys) {
        try {
          const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
          token = parsed?.access_token || parsed?.currentSession?.access_token || parsed?.session?.access_token || token;
        } catch {
          // ignore non-JSON storage
        }
      }
      if (!token) return { hasSession: false };
      const res = await fetch(`${base}/rest/v1/profiles?select=onboarding_completed,mode&limit=1`, {
        headers: { apikey: key, authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return {
        hasSession: true,
        status: res.status,
        onboarding_completed: data?.[0]?.onboarding_completed,
        mode: data?.[0]?.mode,
      };
    },
    { supabaseUrl, anonKey }
  );
}

async function main() {
  if (process.env.YI_ALLOW_LIVE_AUTH_WRITE !== "1") {
    console.error("FAIL   Refusing to create live disposable auth users without YI_ALLOW_LIVE_AUTH_WRITE=1.");
    process.exit(1);
  }

  const baseUrl = process.env.YI_AUTH_BASE_URL || "http://127.0.0.1:3000";
  const supabaseUrl = envValue("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const anonKey = envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    console.error("FAIL   Missing Supabase public URL or publishable key.");
    process.exit(1);
  }

  const ping = await fetch(`${baseUrl}/login`).catch(() => null);
  if (!ping || !ping.ok) {
    console.error(`FAIL   Dev server is not reachable at ${baseUrl}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const suffix = Date.now();
  const completeEmail = `yi-auth-live-complete-${suffix}@example.com`;
  const incompleteEmail = `yi-auth-live-incomplete-${suffix}@example.com`;
  const sharedAlias = `Chef Shared Alias ${suffix}`;
  const password = "YI-live-auth-password-123";

  async function pageForTest() {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    page.on("console", (msg) => {
      // Chrome auto-logs failed resource loads even when JS catches them:
      //   404 — expected missing assets (fonts, icons)
      //   400 — expected from wrong-password test (Supabase auth/v1/token invalid_credentials)
      //   422 — expected from duplicate-email signup (Supabase returns 422 for already-registered)
      // Behaviour for each is verified by explicit DOM checks, not console noise.
      if (
        msg.type() === "error" &&
        !msg.text().includes("404") &&
        !msg.text().includes("400") &&
        !msg.text().includes("422")
      )
        errors.push(msg.text());
    });
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    return page;
  }

  try {
    const signupPage = await pageForTest();
    await signUp(signupPage, completeEmail, password, sharedAlias);
    const signupRoute = await waitForRoute(signupPage, ["/onboarding", "/verify-email"]);
    if (signupRoute === "/verify-email") throw new Error("Email confirmation is required; cannot complete browser smoke without inbox.");
    console.log("PASS   Fresh Supabase signup routes to onboarding");
    await completeOnboarding(signupPage);
    const profile = await currentProfile(signupPage, supabaseUrl, anonKey);
    if (!profile.hasSession || profile.status !== 200 || profile.onboarding_completed !== true || profile.mode !== "full_simulation") {
      throw new Error("Completed signup did not persist onboarding profile state.");
    }
    console.log("PASS   Completed onboarding persists profile state in Supabase");
    await signupPage.close();

    const signInPage = await pageForTest();
    await signIn(signInPage, completeEmail, password);
    const completedRoute = await waitForRoute(signInPage, ["/lobby", "/onboarding"]);
    if (completedRoute !== "/lobby") throw new Error("Completed Supabase account did not enter the Lobby on sign-in.");
    console.log("PASS   Completed Supabase account signs in and enters the app");
    await signInPage.close();

    const wrongPasswordPage = await pageForTest();
    await signIn(wrongPasswordPage, completeEmail, "wrong-password-123");
    await wrongPasswordPage.getByText(/incorrect|invalid/i).waitFor({ state: "visible", timeout: 15000 });
    if ((await wrongPasswordPage.evaluate(() => location.pathname)) !== "/login") {
      throw new Error("Wrong-password attempt should stay on /login.");
    }
    console.log("PASS   Wrong password stays on login with a clear error");
    await wrongPasswordPage.close();

    const duplicatePage = await pageForTest();
    await signUp(duplicatePage, completeEmail, password, `Chef Duplicate ${suffix}`);
    await duplicatePage.getByText(/registered|signing in|sign in/i).waitFor({ state: "visible", timeout: 15000 });
    if ((await duplicatePage.evaluate(() => location.pathname)) !== "/login") {
      throw new Error("Duplicate signup should stay on /login.");
    }
    console.log("PASS   Duplicate email signup does not strand the user");
    await duplicatePage.close();

    const incompleteSignup = await pageForTest();
    await signUp(incompleteSignup, incompleteEmail, password, sharedAlias);
    const incompleteRoute = await waitForRoute(incompleteSignup, ["/onboarding", "/verify-email"]);
    if (incompleteRoute === "/verify-email") throw new Error("Email confirmation is required; cannot verify incomplete routing without inbox.");
    console.log("PASS   Second account can reuse the same Chef alias and lands on onboarding");
    await incompleteSignup.close();

    const incompleteSignIn = await pageForTest();
    await signIn(incompleteSignIn, incompleteEmail, password);
    const incompleteReturnRoute = await waitForRoute(incompleteSignIn, ["/onboarding", "/lobby"]);
    if (incompleteReturnRoute !== "/onboarding") throw new Error("Incomplete Supabase account should return to onboarding.");
    console.log("PASS   Incomplete Supabase account signs in back to onboarding");
    const horizontalOverflow = await incompleteSignIn.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    if (horizontalOverflow) throw new Error("Mobile viewport has horizontal overflow.");
    await incompleteSignIn.close();

    if (errors.length > 0) throw new Error(`Console errors: ${errors.slice(0, 3).join(" | ")}`);
    console.log("PASS   Live auth browser smoke completed without console errors");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`FAIL   ${error instanceof Error ? error.message : "Unknown live auth verification error"}`);
  process.exit(1);
});
