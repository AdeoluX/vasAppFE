/**
 * Post-build script: copies PWA assets and patches dist/index.html
 * with required PWA meta tags that Expo's static export omits.
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

// Use logo.png as the PWA icon for both sizes
copy(path.join(ASSETS, 'logo.png'), path.join(DIST, 'icon-192.png'));
copy(path.join(ASSETS, 'logo.png'), path.join(DIST, 'icon-512.png'));

// Manifest & service worker from public/
copy(path.join(PUBLIC, 'manifest.json'),     path.join(DIST, 'manifest.json'));
copy(path.join(PUBLIC, 'service-worker.js'), path.join(DIST, 'service-worker.js'));

// Patch dist/service-worker.js — inject a build version/timestamp into CACHE_NAME
console.log('\n🏷️  Versioning dist/service-worker.js\n');
const swPath = path.join(DIST, 'service-worker.js');
let swContent = fs.readFileSync(swPath, 'utf8');
const buildId = new Date().getTime();
swContent = swContent.replace(
  /const CACHE_NAME = '([^']+)';/,
  `const CACHE_NAME = '$1-build-${buildId}';`
);
fs.writeFileSync(swPath, swContent);
console.log(`  ✓ Updated CACHE_NAME to include build ID: ${buildId}`);

// Patch dist/index.html — inject PWA meta tags into <head>
console.log('\n🔧 Patching dist/index.html with PWA meta tags\n');
const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const PWA_TAGS = `
  <!-- PWA: Manifest -->
  <link rel="manifest" href="/manifest.json" />
  <!-- PWA: Theme & Icons -->
  <meta name="theme-color" content="#1a1a2e" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="vasApp" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <!-- PWA: Global UI fixes -->
  <style>
    /* Hide scrollbars on all scroll containers */
    * {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    *::-webkit-scrollbar {
      display: none;
    }
    /* Remove browser focus outline/highlight from all inputs */
    input, textarea, select, [contenteditable] {
      outline: none !important;
      box-shadow: none !important;
    }
    input:focus, textarea:focus, select:focus, [contenteditable]:focus {
      outline: none !important;
      box-shadow: none !important;
    }
  </style>
  <!-- PWA: Service Worker handled via React/App logic for update notifications -->`;

// Inject before </head>
if (html.includes('</head>')) {
  html = html.replace('</head>', PWA_TAGS + '\n</head>');
  fs.writeFileSync(indexPath, html);
  console.log('  ✓ Injected manifest link, theme-color, apple-touch-icon');
} else {
  console.warn('  ⚠ Could not find </head> in dist/index.html — skipping patch');
}

console.log('\n✅ PWA assets ready in dist/\n');
