const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "public", "logo");
const svgDir = path.join(root, "svg");
const pngDir = path.join(root, "png");
const jpgDir = path.join(root, "jpg");

const markSvg = fs.readFileSync(path.join(svgDir, "logo-mark.svg"));
const fullSvg = fs.readFileSync(path.join(svgDir, "logo-full.svg"));

// Mark sizes (square)
const markSizes = [1024, 512, 256, 192, 128, 64, 48, 32, 16];
// Full wordmark widths
const fullWidths = [1800, 900, 600, 400];

(async () => {
  // Marks -> PNG (transparent) + JPG (black bg)
  for (const size of markSizes) {
    await sharp(markSvg, { density: 400 })
      .resize(size, size)
      .png()
      .toFile(path.join(pngDir, `logo-mark-${size}.png`));
    await sharp(markSvg, { density: 400 })
      .resize(size, size)
      .flatten({ background: "#0a0a0a" })
      .jpeg({ quality: 92 })
      .toFile(path.join(jpgDir, `logo-mark-${size}.jpg`));
  }

  // Full wordmark -> PNG + JPG
  for (const w of fullWidths) {
    const h = Math.round((w * 240) / 900);
    await sharp(fullSvg, { density: 400 })
      .resize(w, h)
      .png()
      .toFile(path.join(pngDir, `logo-full-${w}.png`));
    await sharp(fullSvg, { density: 400 })
      .resize(w, h)
      .flatten({ background: "#0a0a0a" })
      .jpeg({ quality: 92 })
      .toFile(path.join(jpgDir, `logo-full-${w}.jpg`));
  }

  // Canonical favicon + app icons at project public root
  const publicRoot = path.join(__dirname, "..", "public");
  await sharp(markSvg, { density: 400 }).resize(32, 32).png().toFile(path.join(publicRoot, "favicon-32.png"));
  await sharp(markSvg, { density: 400 }).resize(180, 180).png().toFile(path.join(publicRoot, "apple-touch-icon.png"));
  await sharp(markSvg, { density: 400 }).resize(192, 192).png().toFile(path.join(publicRoot, "icon-192.png"));
  await sharp(markSvg, { density: 400 }).resize(512, 512).png().toFile(path.join(publicRoot, "icon-512.png"));
  // OG image 1200x630 black bg with full logo centered
  const ogLogo = await sharp(fullSvg, { density: 400 }).resize(820, 219).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#0a0a0a" } })
    .composite([{ input: ogLogo, gravity: "center" }])
    .png()
    .toFile(path.join(publicRoot, "og-image.png"));

  console.log("✅ Generated all logo assets (PNG + JPG + favicons + OG image)");
})().catch((e) => { console.error(e); process.exit(1); });
