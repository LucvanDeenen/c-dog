import sharp from 'sharp';
import toIco from 'to-ico';
import { writeFileSync, mkdirSync } from 'fs';

const sizes = [16, 32, 48, 64, 128, 256];

const pngs = await Promise.all(
  sizes.map(size =>
    sharp('src/public/icon.svg').resize(size, size).png().toBuffer()
  )
);

// Write ICO for the installer (build/icon.ico)
const ico = await toIco(pngs);
mkdirSync('build', { recursive: true });
writeFileSync('build/icon.ico', ico);
console.log('Icon generated: build/icon.ico');

// Write PNG for the tray/window icon (src/public/icon.png)
// Use 256x256 — Vite will copy this to dist/ as a static asset
writeFileSync('src/public/icon.png', pngs[pngs.length - 1]);
console.log('Icon generated: src/public/icon.png');
