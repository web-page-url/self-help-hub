const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceImage = path.join(__dirname, '..', 'public', 'self-help-hub-1.0.png');
const publicDir = path.join(__dirname, '..', 'public');

// Ensure the public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateFavicons() {
  console.log('🎨 Generating favicons from self-help-hub-1.0.png...');

  try {
    // Check if source image exists
    if (!fs.existsSync(sourceImage)) {
      throw new Error(`Source image not found: ${sourceImage}`);
    }

    // Standard favicon sizes
    const faviconSizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'favicon.ico', format: 'ico' }
    ];

    // Apple touch icon
    const appleSizes = [
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 152, name: 'apple-touch-icon-152x152.png' },
      { size: 167, name: 'apple-touch-icon-167x167.png' },
      { size: 180, name: 'apple-touch-icon-180x180.png' }
    ];

    // Android/Chrome icons
    const androidSizes = [
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' }
    ];

    // Microsoft tile icons
    const mstileSizes = [
      { size: 70, name: 'mstile-70x70.png' },
      { size: 144, name: 'mstile-144x144.png' },
      { size: 150, name: 'mstile-150x150.png' },
      { size: 310, name: 'mstile-310x310.png' }
    ];

    const allSizes = [
      ...faviconSizes,
      ...appleSizes,
      ...androidSizes,
      ...mstileSizes
    ];

    // Generate all icon sizes
    for (const icon of allSizes) {
      const outputPath = path.join(publicDir, icon.name);

      if (icon.format === 'ico') {
        // For .ico files, we'll create a PNG and rename it
        await sharp(sourceImage)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath.replace('.ico', '.png'));

        // Copy the PNG as ICO (simple approach)
        await fs.promises.copyFile(
          outputPath.replace('.ico', '.png'),
          outputPath
        );
      } else {
        await sharp(sourceImage)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✅ Generated: ${icon.name}`);
    }

    console.log('🎉 Favicon generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

// Also generate some additional sizes manually using sharp
async function generateAdditionalSizes() {
  console.log('📏 Generating additional icon sizes...');

  const sizes = [512, 384, 256, 192, 128, 96, 64, 32, 16];

  try {
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    console.log('🎉 Additional icon sizes generated successfully!');
  } catch (error) {
    console.error('❌ Error generating additional sizes:', error.message);
  }
}

// Generate Open Graph image (1200x630)
async function generateOGImage() {
  console.log('📱 Generating Open Graph image (1200x630)...');

  try {
    const ogImagePath = path.join(publicDir, 'og-image.png');
    await sharp(sourceImage)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(ogImagePath);

    console.log('✅ Generated: og-image.png (1200x630)');
  } catch (error) {
    console.error('❌ Error generating OG image:', error.message);
  }
}

// Generate Twitter Card image (1200x600)
async function generateTwitterImage() {
  console.log('🐦 Generating Twitter Card image (1200x600)...');

  try {
    const twitterImagePath = path.join(publicDir, 'twitter-image.png');
    await sharp(sourceImage)
      .resize(1200, 600, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(twitterImagePath);

    console.log('✅ Generated: twitter-image.png (1200x600)');
  } catch (error) {
    console.error('❌ Error generating Twitter image:', error.message);
  }
}

// Run all generation functions
async function main() {
  console.log('🚀 Starting icon generation process...\n');

  await generateFavicons();
  console.log('');
  await generateAdditionalSizes();
  console.log('');
  await generateOGImage();
  console.log('');
  await generateTwitterImage();

  console.log('\n🎊 All icon generation completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check the generated files in the public/ directory');
  console.log('2. Update your layout.tsx with the favicon meta tags');
  console.log('3. Test your SEO by sharing the URL on social media');
}

main().catch(console.error);