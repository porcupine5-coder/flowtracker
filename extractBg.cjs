const fs = require('fs');
const path = require('path');
const content = fs.readFileSync('c:/Users/YS/OneDrive/Documents/FLOW/FOR THE COUSTOM BACKGROUND ANIMATION.txt', 'utf8');

const blocks = content.split(/NPM\s*:?\s*npx\s+shadcn.*?\.json[^\n]*/i);
const names = [
  "BackgroundBeamsWithCollision", "BackgroundCircles", "ConstellationBackground", 
  "Meteors", "RainBackground", "ShootingStars", "SnowBackground", "SparklesCore", 
  "StarfieldBackground", "UnderwaterBackground"
];

const bgDir = path.join(__dirname, 'src/components/bg');
if (!fs.existsSync(bgDir)) fs.mkdirSync(bgDir, { recursive: true });

for (let i = 0; i < names.length; i++) {
  const block = blocks[i];
  if (!block) continue;
  const match = block.match(/->([\s\S]+)/);
  if (match) {
    let code = match[1].trim();
    if (code.startsWith('"use client"')) {
      code = code.replace('"use client"', '"use client";');
    }
    fs.writeFileSync(path.join(bgDir, `${names[i]}.tsx`), code);
    console.log(`Wrote ${names[i]}.tsx`);
  } else {
    console.log(`Failed to match code for ${names[i]}`);
  }
}
