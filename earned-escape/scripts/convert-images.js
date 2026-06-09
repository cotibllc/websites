const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const photosDir = path.join(__dirname, '..', 'public', 'images', 'photos');

async function convertToWebP() {
  console.log('Scanning photos directory for JPG images...');
  
  if (!fs.existsSync(photosDir)) {
    console.error(`Error: Photos directory not found at ${photosDir}`);
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(photosDir);
    const jpgFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.jpg' || ext === '.jpeg';
    });

    console.log(`Found ${jpgFiles.length} JPG files to convert.`);

    for (const file of jpgFiles) {
      const inputPath = path.join(photosDir, file);
      const extName = path.extname(file);
      const baseName = path.basename(file, extName);
      const outputPath = path.join(photosDir, `${baseName}.webp`);

      console.log(`Converting: ${file} -> ${baseName}.webp`);
      
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      const origSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(outputPath).size;
      const savings = ((origSize - webpSize) / origSize * 100).toFixed(1);
      
      console.log(`  Size: ${(origSize/1024).toFixed(1)} KB -> ${(webpSize/1024).toFixed(1)} KB (${savings}% savings)`);
    }

    console.log('Conversion complete!');
  } catch (err) {
    console.error('Error during image conversion:', err);
    process.exit(1);
  }
}

convertToWebP();
