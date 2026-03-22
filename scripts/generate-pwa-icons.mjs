import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public", "logo.jpg");
const OUT_DIR = path.join(ROOT, "public", "icons");
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

await mkdir(OUT_DIR, { recursive: true });
const buffer = await sharp(SRC).resize(736, 736).toBuffer();

for (const size of SIZES) {
  const outPath = path.join(OUT_DIR, `icon-${size}x${size}.png`);
  await sharp(buffer).resize(size, size).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}

console.log("Done.");
