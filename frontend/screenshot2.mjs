import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

// Seed localStorage with a chef name
await page.goto("http://localhost:3000/kitchen");
await page.evaluate(() => {
  localStorage.setItem("yi_chef_name", "Denzel");
  localStorage.setItem("yi_gordon_intro_seen", "1");
});

await page.reload({ waitUntil: "networkidle" });
await page.screenshot({ path: "shot_kitchen_full.png", fullPage: true });
console.log("kitchen full");

await page.goto("http://localhost:3000/lounge", { waitUntil: "networkidle" });
await page.screenshot({ path: "shot_lounge_full.png", fullPage: true });
console.log("lounge full");

await page.goto("http://localhost:3000/gordon-intro", { waitUntil: "networkidle" });
await page.screenshot({ path: "shot_gordon_full.png", fullPage: true });
console.log("gordon full");

await browser.close();
