/**
 * Post-build script: copies PWA assets (icons, manifest, service-worker)
 * into the Expo web export dist/ folder after `expo export --platform web`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const ASSETS = path.join(ROOT, 'assets');

function copy(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`  ✓ ${path.relative(ROOT, src)} → dist/${path.relative(DIST, dest)}`);
}

console.log('\n📦 Copying PWA assets into dist/\n');

// Icons: copy and rename to match manifest.json
copy(path.join(ASSETS, 'adaptive-icon.png'), path.join(DIST, 'icon-192.png'));
copy(path.join(ASSETS, 'icon.png'),           path.join(DIST, 'icon-512.png'));

// Manifest & service worker from public/
copy(path.join(PUBLIC, 'manifest.json'),    path.join(DIST, 'manifest.json'));
copy(path.join(PUBLIC, 'service-worker.js'), path.join(DIST, 'service-worker.js'));

console.log('\n✅ PWA assets ready in dist/\n');
