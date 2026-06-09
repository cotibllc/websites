const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', 'public', 'css');
const mainCssPath = path.join(cssDir, 'main.css');
const outputCssPath = path.join(cssDir, 'main.bundle.css');

function bundleCss() {
  console.log('Bundling stylesheets...');

  if (!fs.existsSync(mainCssPath)) {
    console.error(`Error: main.css not found at ${mainCssPath}`);
    process.exit(1);
  }

  try {
    const mainCssContent = fs.readFileSync(mainCssPath, 'utf8');
    const importRegex = /@import\s+['"]([^'"]+)['"];/g;
    let match;
    let bundledCss = `/*\n * Earned Escape Compiled Stylesheet\n * Generated automatically - do not edit directly\n */\n\n`;

    while ((match = importRegex.exec(mainCssContent)) !== null) {
      const importFile = match[1].split('?')[0]; // Strip cache-busting query strings like ?v=20260613
      const importFilePath = path.join(cssDir, importFile);

      if (fs.existsSync(importFilePath)) {
        const fileContent = fs.readFileSync(importFilePath, 'utf8');
        bundledCss += `/* ==========================================================================\n`;
        bundledCss += `   Imported: ${importFile}\n`;
        bundledCss += `   ========================================================================== */\n\n`;
        bundledCss += fileContent + '\n\n';
      } else {
        console.warn(`Warning: Imported file not found: ${importFilePath}`);
      }
    }

    fs.writeFileSync(outputCssPath, bundledCss, 'utf8');
    console.log(`Success! Bundled CSS written to ${outputCssPath} (${Buffer.byteLength(bundledCss)} bytes)`);
  } catch (err) {
    console.error('Error during CSS bundling:', err);
    process.exit(1);
  }
}

bundleCss();
