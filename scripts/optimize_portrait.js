import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceFile = path.resolve('IMG_20261006_105707.png');
const targetDir = path.resolve('public/images');

async function optimize() {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file ${sourceFile} does not exist`);
  }

  const meta = await sharp(sourceFile).metadata();
  console.log('Source Image Metadata:', {
    width: meta.width,
    height: meta.height,
    format: meta.format,
    hasAlpha: meta.hasAlpha,
    channels: meta.channels,
  });

  // 1. Lossless PNG copy without palette quantization (keeps full 32-bit truecolor RGBA)
  fs.copyFileSync(sourceFile, path.join(targetDir, 'harsh-raj.png'));
  console.log('Copied lossless original to public/images/harsh-raj.png (size:', fs.statSync(path.join(targetDir, 'harsh-raj.png')).size, 'bytes)');

  // 2. High-Fidelity WebP at native resolution (quality 98, effort 6, no chroma subsampling)
  await sharp(sourceFile)
    .webp({ quality: 98, effort: 6, lossless: false })
    .toFile(path.join(targetDir, 'harsh-raj.webp'));
  console.log('Generated public/images/harsh-raj.webp');

  // 3. High-Fidelity AVIF at native resolution (quality 92, 4:4:4 chroma to keep skin tones ultra-crisp)
  await sharp(sourceFile)
    .avif({ quality: 92, effort: 6, chromaSubsampling: '4:4:4' })
    .toFile(path.join(targetDir, 'harsh-raj.avif'));
  console.log('Generated public/images/harsh-raj.avif');

  // 4. Mobile optimized 360w variant
  await sharp(sourceFile)
    .resize({ width: 360, withoutEnlargement: true })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(targetDir, 'harsh-raj-360.webp'));
  await sharp(sourceFile)
    .resize({ width: 360, withoutEnlargement: true })
    .avif({ quality: 90, effort: 6, chromaSubsampling: '4:4:4' })
    .toFile(path.join(targetDir, 'harsh-raj-360.avif'));
  console.log('Generated 360w mobile variants');

  // If a source with height >= 800 / 1200 / 1600 is supplied in the future, generate them
  const targetHeights = [800, 1200, 1600];
  for (const th of targetHeights) {
    if (meta.height && meta.height >= th) {
      await sharp(sourceFile)
        .resize({ height: th, withoutEnlargement: true })
        .webp({ quality: 95 })
        .toFile(path.join(targetDir, `harsh-raj-${th}.webp`));
      await sharp(sourceFile)
        .resize({ height: th, withoutEnlargement: true })
        .avif({ quality: 90, chromaSubsampling: '4:4:4' })
        .toFile(path.join(targetDir, `harsh-raj-${th}.avif`));
      console.log(`Generated ${th}h variants`);
    }
  }

  console.log('All image optimization finished cleanly.');
}

optimize().catch((err) => {
  console.error(err);
  process.exit(1);
});
