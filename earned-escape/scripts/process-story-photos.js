const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '..', 'photos-to-use');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'photos');

const SIZES = {
  landscape: { width: 1600, height: 1200 },
  portrait: { width: 1200, height: 1600 }
};

const PHOTOS_TO_PROCESS = [
  {
    src: 'IMG_7537.JPG',
    dest: 'aruba-sunset-story',
    type: 'landscape'
  },
  {
    src: 'dsc00113.JPG',
    dest: 'ecuador-hike-story',
    type: 'landscape'
  },
  {
    src: 'dsc00222.JPG',
    dest: 'ecuador-landscape-story',
    type: 'landscape'
  },
  {
    src: 'PXL_20260113_033336743_Original.JPG',
    dest: 'china-chongqing-story',
    type: 'portrait'
  },
  {
    src: 'P7240407.JPG',
    dest: 'hawaii-beach-story',
    type: 'landscape'
  }
];

async function processPhoto(srcFile, destBaseName, type) {
  const srcPath = path.join(SOURCE_DIR, srcFile);
  if (!fs.existsSync(srcPath)) {
    console.error(`Error: Source file not found: ${srcPath}`);
    return;
  }

  const size = SIZES[type];
  const jpgDest = path.join(OUT_DIR, `${destBaseName}.jpg`);
  const webpDest = path.join(OUT_DIR, `${destBaseName}.webp`);

  console.log(`Processing ${type} (${size.width}x${size.height}): ${srcFile} -> ${destBaseName}`);

  // Save JPG
  await sharp(srcPath)
    .resize(size.width, size.height, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, progressive: true })
    .toFile(jpgDest);

  // Save WebP
  await sharp(srcPath)
    .resize(size.width, size.height, { fit: 'cover', position: 'center' })
    .webp({ quality: 82 })
    .toFile(webpDest);

  const origSize = fs.statSync(srcPath).size;
  const webpSize = fs.statSync(webpDest).size;
  const savings = (((origSize - webpSize) / origSize) * 100).toFixed(1);
  console.log(`  WebP optimized: ${(webpSize / 1024).toFixed(1)} KB (savings: ${savings}%)`);
}

async function run() {
  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log('--- Processing New Story Photos ---');
    for (const photo of PHOTOS_TO_PROCESS) {
      await processPhoto(photo.src, photo.dest, photo.type);
    }
    console.log('--- All new story photos processed successfully! ---');
  } catch (err) {
    console.error('Error processing story photos:', err);
  }
}

run();
