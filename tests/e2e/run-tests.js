#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Lossly E2E Test Runner\n');

// Check if test images exist
const testImagesDir = path.join(__dirname, 'fixtures', 'test-images');
const requiredImages = [
  'small.jpg',
  'medium.png', 
  'large.jpg',
  'batch-1.jpg',
  'batch-2.jpg',
  'batch-3.jpg',
  'batch-4.jpg',
  'batch-5.jpg',
  'invalid.txt'
];

console.log('📁 Checking for test images...');
const missingImages = requiredImages.filter(img => {
  const imgPath = path.join(testImagesDir, img);
  return !fs.existsSync(imgPath);
});

if (missingImages.length > 0) {
  console.warn('⚠️  Missing test images:');
  missingImages.forEach(img => console.warn(`   - ${img}`));
  console.warn('\nPlease add test images to: tests/e2e/fixtures/test-images/');
  console.warn('You can use the images from your Desktop for testing.\n');
}

// Run specific test suite based on argument
const testSuite = process.argv[2];
const validSuites = ['single', 'batch', 'presets', 'history', 'all'];

if (testSuite && !validSuites.includes(testSuite)) {
  console.error(`❌ Invalid test suite: ${testSuite}`);
  console.log(`\nValid options: ${validSuites.join(', ')}`);
  process.exit(1);
}

// Build the playwright command
let command = 'npx';
let args = ['playwright', 'test', '--config=tests/e2e/playwright.config.ts'];

if (testSuite && testSuite !== 'all') {
  const suiteMap = {
    'single': '01-single-upload.spec.ts',
    'batch': '02-batch-processing.spec.ts',
    'presets': '03-presets.spec.ts',
    'history': '04-history.spec.ts'
  };
  args.push(`tests/e2e/specs/${suiteMap[testSuite]}`);
}

// Add reporter
args.push('--reporter=list');

console.log(`\n🚀 Running ${testSuite || 'all'} tests...\n`);
console.log(`Command: ${command} ${args.join(' ')}\n`);

// Run tests
const testProcess = spawn(command, args, { 
  stdio: 'inherit',
  shell: true
});

testProcess.on('close', (code) => {
  console.log('\n' + '='.repeat(60));
  
  if (code === 0) {
    console.log('✅ All tests passed!');
    console.log('\nView detailed report: npm run test:e2e:report');
  } else {
    console.log('❌ Some tests failed.');
    console.log('\nDebug failed tests: npm run test:e2e:debug');
    console.log('View report: npm run test:e2e:report');
  }
  
  console.log('='.repeat(60));
  process.exit(code);
});

testProcess.on('error', (err) => {
  console.error('Failed to start test process:', err);
  process.exit(1);
});
