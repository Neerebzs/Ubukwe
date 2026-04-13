const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Installing sharp package for image processing...');
  console.log('Please run: npm install sharp --save-dev');
  process.exit(1);
}

const logoPath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from logo.png...\n');

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: logo.png not found in /public folder');
    process.exit(1);
  }

  for (const { size, name } of sizes) {
    const outputPath = path.join(outputDir, name);
    
    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error creating ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('Your PWA icons are ready in /public folder');
}

generateIcons();
