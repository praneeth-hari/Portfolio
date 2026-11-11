import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PUB = path.resolve('public');

async function makeVariant(srcRel, outRel, width, format, options) {
  const src = path.join(PUB, srcRel);
  const out = path.join(PUB, outRel);
  if (!fs.existsSync(src)) return;
  const img = sharp(src);
  if (width) img.resize({ width, withoutEnlargement: true });
  await img[format](options).toFile(out);
  const kb = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`${outRel}: ${kb} KB`);
}

async function run() {
  // Hero portraits (900x1600 -> 640w + AVIF variants)
  for (const name of ['hero-base', 'hero-reveal']) {
    await makeVariant(`hero/${name}.webp`, `hero/${name}-640.webp`, 640, 'webp', { quality: 82 });
    await makeVariant(`hero/${name}.webp`, `hero/${name}-640.avif`, 640, 'avif', { quality: 58 });
    await makeVariant(`hero/${name}.webp`, `hero/${name}.avif`, null, 'avif', { quality: 60 });
  }

  // Project covers (1448x1086 -> 640w, 1024w + AVIF)
  for (const name of ['ai-stock-trader', 'medicinal-plant', 'secure-cloud-ml', 'bob-assistant']) {
    await makeVariant(`projects/${name}.webp`, `projects/${name}-640.webp`, 640, 'webp', { quality: 80 });
    await makeVariant(`projects/${name}.webp`, `projects/${name}-1024.webp`, 1024, 'webp', { quality: 82 });
    await makeVariant(`projects/${name}.webp`, `projects/${name}-640.avif`, 640, 'avif', { quality: 58 });
    await makeVariant(`projects/${name}.webp`, `projects/${name}-1024.avif`, 1024, 'avif', { quality: 60 });
    await makeVariant(`projects/${name}.webp`, `projects/${name}.avif`, null, 'avif', { quality: 60 });
  }

  // Case study screenshots
  for (const name of ['ai-stock-trader-dashboard', 'secure-cloud-dashboard', 'secure-cloud-predict']) {
    await makeVariant(`projects/${name}.webp`, `projects/${name}-720.webp`, 720, 'webp', { quality: 82 });
    await makeVariant(`projects/${name}.webp`, `projects/${name}-720.avif`, 720, 'avif', { quality: 60 });
    await makeVariant(`projects/${name}.webp`, `projects/${name}.avif`, null, 'avif', { quality: 62 });
  }

  // Video poster -> WebP
  await makeVariant('projects/medicinal-plant-demo-poster.jpg', 'projects/medicinal-plant-demo-poster.webp', null, 'webp', { quality: 82 });

  // Awards / Highlights JPEGs -> WebP + AVIF
  await makeVariant('awards/expo-1.jpg', 'awards/expo-1-640.webp', 640, 'webp', { quality: 80 });
  await makeVariant('awards/expo-1.jpg', 'awards/expo-1.webp', null, 'webp', { quality: 82 });
  await makeVariant('awards/expo-1.jpg', 'awards/expo-1-640.avif', 640, 'avif', { quality: 58 });
  await makeVariant('awards/expo-1.jpg', 'awards/expo-1.avif', null, 'avif', { quality: 60 });

  await makeVariant('awards/volunteer-1.jpg', 'awards/volunteer-1.webp', null, 'webp', { quality: 82 });
  await makeVariant('awards/volunteer-1.jpg', 'awards/volunteer-1.avif', null, 'avif', { quality: 60 });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

