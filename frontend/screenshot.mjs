import { chromium } from "@playwright/test";
import path from "path";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

const shots = [
  { url: "http://localhost:3000", file: "shot_splash.png" },
  { url: "http://localhost:3000/onboarding", file: "shot_onboarding.png" },
  { url: "http://localhost:3000/gordon-intro", file: "shot_gordon.png" },
  { url: "http://localhost:3000/academy", file: "shot_academy.png" },
  { url: "http://localhost:3000/kitchen", file: "shot_kitchen.png" },
  { url: "http://localhost:3000/lounge", file: "shot_lounge.png" },
];

for (const { url, file } of shots) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: file, fullPage: false });
  console.log("captured", file);
}

await browser.close();
