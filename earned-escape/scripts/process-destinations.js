const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '..', 'photos-to-use');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'photos');
const ENHANCED_DIR = path.join(__dirname, '..', 'photos-to-use', 'enhanced');

// Target dimensions
const SIZES = {
  hero: { width: 2400, height: 1350 },  // 16:9
  story: { width: 1600, height: 1200 }, // 4:3
  card: { width: 1000, height: 750 }    // 4:3
};

async function processPhoto(srcPath, destBaseName, type) {
  const size = SIZES[type];
  if (!size) throw new Error(`Unknown size type: ${type}`);

  // Create paths
  const jpgDestProd = path.join(OUT_DIR, `${destBaseName}.jpg`);
  const webpDestProd = path.join(OUT_DIR, `${destBaseName}.webp`);
  const jpgDestEnh = path.join(ENHANCED_DIR, type, `${destBaseName}.jpg`);

  // Ensure directories exist
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(ENHANCED_DIR, type), { recursive: true });

  console.log(`Processing ${type}: ${path.basename(srcPath)} -> ${destBaseName}`);

  // 1. Process and save JPG to public/images/photos/ and photos-to-use/enhanced/[type]/
  await sharp(srcPath)
    .resize(size.width, size.height, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, progressive: true })
    .toFile(jpgDestProd);

  // Copy to enhanced working directory
  fs.copyFileSync(jpgDestProd, jpgDestEnh);

  // 2. Process and save WebP to public/images/photos/
  await sharp(srcPath)
    .resize(size.width, size.height, { fit: 'cover', position: 'center' })
    .webp({ quality: 82 })
    .toFile(webpDestProd);

  const origSize = fs.statSync(srcPath).size;
  const webpSize = fs.statSync(webpDestProd).size;
  const savings = (((origSize - webpSize) / origSize) * 100).toFixed(1);
  console.log(`  WebP optimized: ${(webpSize / 1024).toFixed(1)} KB (savings: ${savings}%)`);
}

async function run() {
  try {
    // 1. Process Disney Photos
    const disneySrcDir = path.join(SOURCE_DIR, 'Disney');
    if (fs.existsSync(disneySrcDir)) {
      console.log('--- Processing Disney Photos ---');
      const files = fs.readdirSync(disneySrcDir);
      
      // Hero & Story
      const heroFile = files.find(f => f.includes('hero'));
      const storyFile = files.find(f => f.includes('story'));
      
      if (heroFile) {
        await processPhoto(path.join(disneySrcDir, heroFile), 'wdw-hero', 'hero');
      } else {
        console.warn('Warning: disney_hero.jpg not found.');
      }

      if (storyFile) {
        await processPhoto(path.join(disneySrcDir, storyFile), 'wdw-story', 'story');
      } else {
        console.warn('Warning: disney_story.jpg not found.');
      }

      // Gallery Cards
      const galleryFiles = files.filter(f => !f.includes('hero') && !f.includes('story') && f.toLowerCase().endsWith('.jpg'));
      console.log(`Found ${galleryFiles.length} Disney gallery files.`);
      
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        await processPhoto(path.join(disneySrcDir, file), `wdw-card-${i + 1}`, 'card');
      }
    } else {
      console.error('Disney source directory not found.');
    }

    // 2. Process Universal Photos
    const universalSrcDir = path.join(SOURCE_DIR, 'Universal');
    if (fs.existsSync(universalSrcDir)) {
      console.log('\n--- Processing Universal Photos ---');
      const files = fs.readdirSync(universalSrcDir);
      
      // Hero & Story
      const heroFile = files.find(f => f.includes('hero'));
      const storyFile = files.find(f => f.includes('story'));
      
      if (heroFile) {
        await processPhoto(path.join(universalSrcDir, heroFile), 'universal-hero', 'hero');
      } else {
        console.warn('Warning: universal_hero.jpg not found.');
      }

      if (storyFile) {
        await processPhoto(path.join(universalSrcDir, storyFile), 'universal-story', 'story');
      } else {
        console.warn('Warning: universal_story.jpg not found.');
      }

      // Gallery Cards
      const galleryFiles = files.filter(f => !f.includes('hero') && !f.includes('story') && f.toLowerCase().endsWith('.jpg'));
      console.log(`Found ${galleryFiles.length} Universal gallery files.`);
      
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        await processPhoto(path.join(universalSrcDir, file), `universal-card-${i + 1}`, 'card');
      }
    } else {
      console.error('Universal source directory not found.');
    }

    console.log('\nAll destination photos processed successfully!');
  } catch (error) {
    console.error('Error processing photos:', error);
  }
}

run();
