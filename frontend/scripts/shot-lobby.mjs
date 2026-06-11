#!/usr/bin/env node
// One-off visual check of /lobby: creates a disposable live account, completes
// onboarding, then screenshots the Lobby at mobile + desktop. Run with
// YI_ALLOW_LIVE_AUTH_WRITE=1; delete the account from Supabase later if desired.

import { chromium } from "@playwright/test";

const baseUrl = process.env.YI_AUTH_BASE_URL || "http://127.0.0.1:3000";
const suffix = Date.now();
const email = `yi.live.smoke+lobbyshot${suffix}@gmail.com`;
const password = `Lobby-shot-${suffix}!`;

if (process.env.YI_ALLOW_LIVE_AUTH_WRITE !== "1") {
  console.error("Set YI_ALLOW_LIVE_AUTH_WRITE=1 to run.");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
await page.getByRole("button", { name: "Sign up with email" }).click();
await page.locator("#signup-email").fill(email);
await page.locator("#display-name").fill("Lobby Shot");
await page.locator("#chef-alias").fill("Chef Lobby Shot");
await page.locator("#signup-password").fill(password);
await page.locator("#signup-confirm").fill(password);
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL(/\/(onboarding|verify-email)/, { timeout: 30000 });

if (page.url().includes("verify-email")) {
  console.error("Email confirmation required; cannot screenshot lobby without inbox.");
  await browser.close();
  process.exit(1);
}

await page.locator("#display-name").fill("Lobby Shot");
await page.getByRole("button", { name: "Continue" }).click();
await page.locator("#chef-alias").fill("Chef Lobby Shot");
await page.getByRole("button", { name: "Continue" }).click();
await page.locator("#age").fill("21");
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Learn the craft" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("button", { name: "Meet Gordon" }).click();
await page.waitForURL(/\/gordon-intro/, { timeout: 30000 });

await page.goto(`${baseUrl}/lobby`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "shot_lobby_mobile.png", fullPage: true });

await page.setViewportSize({ width: 1280, height: 900 });
await page.waitForTimeout(600);
await page.screenshot({ path: "shot_lobby_desktop.png", fullPage: true });

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
console.log(overflow ? "WARN horizontal overflow on desktop" : "OK no horizontal overflow");
await browser.close();
console.log("Saved shot_lobby_mobile.png + shot_lobby_desktop.png");
