/* Build step for the paid site (Cloudflare Pages build command: `node tools/configure.mjs`).
   Writes assets/js/config.js from PAID, CHECKOUT_URL, PRICE_LABEL and FREE_SCANS. Secrets stay in the
   server function's environment and never reach this file. */
import { writeFileSync } from "node:fs";
const cfg = {
  paid: process.env.PAID === "1" || process.env.PAID === "true",
  checkoutUrl: process.env.CHECKOUT_URL || "",
  priceLabel: process.env.PRICE_LABEL || "",
  freeScans: Math.max(0, parseInt(process.env.FREE_SCANS || "3", 10) || 0),
  verifyUrl: "/api/verify"
};
writeFileSync(new URL("../assets/js/config.js", import.meta.url),
  "/* Written by tools/configure.mjs at build time. */\nself.FIO_CONFIG = " + JSON.stringify(cfg) + ";\n");
console.log("config.js written:", cfg);
