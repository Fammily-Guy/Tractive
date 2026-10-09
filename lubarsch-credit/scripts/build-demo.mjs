/**
 * Builds a STATIC DEMO of the site for Netlify Drop (or any static host).
 *
 *   npm run build:demo   →  lubarsch-credit-demo.zip  (drag the unzipped folder, or the zip, onto app.netlify.com/drop)
 *
 * What's different from the real site:
 *  - Plain HTML files, no server. All public pages in English, Yorùbá and Pidgin.
 *  - Forms are simulated in the browser (lib/api.ts) — nothing is sent or stored on a server.
 *  - No staff dashboard (/admin) and no API.
 * Language switching and clean URLs (/loans) work through Netlify's _redirects cookie rules.
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const work = path.join(root, ".demo-build");
const outDir = path.join(root, "demo-site");
const zipFile = path.join(root, "lubarsch-credit-demo.zip");
const skip = new Set(["node_modules", ".next", ".data", "out", ".demo-build", "demo-site", "test-results", "playwright-report", "lubarsch-credit-demo.zip"]);

console.log("1/4 Preparing a copy without server-only parts…");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
for (const entry of readdirSync(root)) if (!skip.has(entry)) cpSync(path.join(root, entry), path.join(work, entry), { recursive: true });
symlinkSync(path.join(root, "node_modules"), path.join(work, "node_modules"), "dir");
for (const p of ["app/admin", "app/api", "middleware.ts", "app/[locale]/[...rest]"]) rmSync(path.join(work, p), { recursive: true, force: true });

console.log("2/4 Building static export (this takes a minute)…");
execSync("npx next build", {
  cwd: work,
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "true", NEXT_PUBLIC_DEMO_MODE: "true", NODE_ENV: "production" },
});

console.log("3/4 Adding Netlify routing and headers…");
rmSync(outDir, { recursive: true, force: true });
cpSync(path.join(work, "out"), outDir, { recursive: true });

// Language is chosen by the switcher, which sets a cookie lc_yo / lc_pcm (Netlify matches cookie presence).
// Rules only apply when no real file exists, so /yo/loans, /_next/… and images are served directly.
writeFileSync(
  path.join(outDir, "_redirects"),
  [
    "# Clean URLs (/loans) → the right language folder",
    "/      /yo   200  Cookie=lc_yo",
    "/      /pcm  200  Cookie=lc_pcm",
    "/      /en   200",
    "/index.txt  /yo.txt   200  Cookie=lc_yo",
    "/index.txt  /pcm.txt  200  Cookie=lc_pcm",
    "/index.txt  /en.txt   200",
    "/*     /yo/:splat   200  Cookie=lc_yo",
    "/*     /pcm/:splat  200  Cookie=lc_pcm",
    "/*     /en/:splat   200",
    "",
  ].join("\n"),
);
writeFileSync(
  path.join(outDir, "_headers"),
  [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  X-Frame-Options: DENY",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "/sw.js",
    "  Cache-Control: no-cache",
    "",
  ].join("\n"),
);
if (!existsSync(path.join(outDir, "404.html")) && existsSync(path.join(outDir, "en", "404.html"))) {
  cpSync(path.join(outDir, "en", "404.html"), path.join(outDir, "404.html"));
}

console.log("4/4 Zipping…");
rmSync(zipFile, { force: true });
execSync(`zip -qr "${zipFile}" .`, { cwd: outDir });
rmSync(work, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
console.log(`\nDone → ${path.relative(root, zipFile)}  (folder: ${path.relative(root, outDir)}/)`);
