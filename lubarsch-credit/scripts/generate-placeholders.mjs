/**
 * Generates clearly-labelled placeholder images, app icons and the Open Graph image.
 * Replace files in /public/images with real photography (same file names), or update the paths in /content.
 *   npm run images
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const img = (f) => path.join(root, "public/images", f);
const icon = (f) => path.join(root, "public/icons", f);
mkdirSync(path.join(root, "public/images"), { recursive: true });
mkdirSync(path.join(root, "public/icons"), { recursive: true });

const GREEN = "#0f5c3a", GOLD = "#d99a1e", CREAM = "#fbf7ef", SAND = "#f1e8d6";

function pattern(color, opacity = 0.25) {
  return `<defs><pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse">
    <path d="M40 6 L74 40 L40 74 L6 40 Z" fill="none" stroke="${color}" stroke-width="2" opacity="${opacity}"/>
    <circle cx="40" cy="40" r="6" fill="none" stroke="${color}" stroke-width="2" opacity="${opacity}"/></pattern></defs>`;
}

function escape(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

async function placeholder(file, w, h, title, lines) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${pattern(GREEN, 0.18)}
    <rect width="100%" height="100%" fill="${SAND}"/><rect width="100%" height="100%" fill="url(#p)"/>
    <rect x="${w * 0.06}" y="${h * 0.3}" width="${w * 0.88}" height="${h * 0.4}" rx="24" fill="${CREAM}" opacity="0.92"/>
    <text x="50%" y="${h * 0.42}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${Math.round(w / 22)}" fill="${GREEN}">PLACEHOLDER — ${escape(title)}</text>
    ${lines.map((l, i) => `<text x="50%" y="${h * 0.52 + i * (w / 30)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(w / 36)}" fill="#4d4944">${escape(l)}</text>`).join("")}
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 72, mozjpeg: true }).toFile(img(file));
}

const logoSvg = (size, pad = 0) => {
  const s = size, p = pad, inner = s - p * 2, k = inner / 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="${GREEN}" ${pad ? "" : `rx="${s * 0.22}"`}/>
    <g transform="translate(${p},${p}) scale(${k})">
      <path d="M6 40 L12 34 L18 40 L24 34 L30 40 L36 34 L42 40" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M16 10 v20 h16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="33" cy="14" r="4" fill="${GOLD}"/></g></svg>`;
};

await placeholder("placeholder-hero.jpg", 1200, 900, "Hero photo", ["A smiling Ibadan market woman at her foodstuff stall,", "Bodija Market, morning light, pepper & tomatoes in front."]);
await placeholder("placeholder-story-1.jpg", 800, 600, "Story photo 1", ["Iya Tunde beside sacks of beans & garri", "at her Bodija Market stall"]);
await placeholder("placeholder-story-2.jpg", 800, 600, "Story photo 2", ["Mama Kemi holding folded aso-oke", "in her Oje Market shop"]);
await placeholder("placeholder-story-3.jpg", 800, 600, "Story photo 3", ["Alhaja Fausat at her full provision", "kiosk in Oja'ba Market"]);
for (const n of [1, 2, 3, 4]) await placeholder(`placeholder-team-${n}.jpg`, 600, 600, `Team photo ${n}`, ["Head-and-shoulders portrait,", "plain background, Lubarsch shirt"]);
await placeholder("placeholder-office.jpg", 1200, 800, "Office photo", ["Front of the Lubarsch Credit office", "in Ibadan with signboard visible"]);
await placeholder("placeholder-video-poster.jpg", 1280, 720, "Video poster", ["Still from the 2-minute explainer video:", "officer greeting a trader at her stall"]);
await placeholder("placeholder-agent.jpg", 1200, 800, "Agent photo", ["Lubarsch field officer with ID card", "talking with a trader in the market"]);

// App icons
await sharp(Buffer.from(logoSvg(192))).png().toFile(icon("icon-192.png"));
await sharp(Buffer.from(logoSvg(512))).png().toFile(icon("icon-512.png"));
await sharp(Buffer.from(logoSvg(512, 80))).png().toFile(icon("maskable-512.png"));
await sharp(Buffer.from(logoSvg(180, 20))).png().toFile(icon("apple-touch-icon.png"));
await sharp(Buffer.from(logoSvg(48))).png().toFile(path.join(root, "app/icon.png"));

// favicon.ico (ICO container holding a 32px PNG)
const png32 = await sharp(Buffer.from(logoSvg(32))).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
writeFileSync(path.join(root, "app/favicon.ico"), Buffer.concat([ico, png32]));

// Open Graph image (no text-in-image requirement applies to UI; OG cards need a title)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${pattern(GOLD, 0.25)}
  <rect width="100%" height="100%" fill="${GREEN}"/><rect width="100%" height="100%" fill="url(#p)"/>
  <rect x="70" y="150" width="1060" height="330" rx="32" fill="${CREAM}"/>
  <text x="120" y="270" font-family="Arial, sans-serif" font-weight="800" font-size="84" fill="${GREEN}">Lubarsch Credit</text>
  <text x="120" y="350" font-family="Arial, sans-serif" font-weight="700" font-size="40" fill="#4d4944">Money for your market, when you need it.</text>
  <text x="120" y="420" font-family="Arial, sans-serif" font-size="32" fill="${GOLD}">Daily &amp; weekly loans for traders in Ibadan</text></svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 80 }).toFile(path.join(root, "public/og.jpg"));

console.log("Placeholders generated.");
