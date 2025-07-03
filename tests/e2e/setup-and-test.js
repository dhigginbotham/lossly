#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Lossly E2E Test Setup\n');

// Check if app is built
const mainPath = path.join(__dirname, '../../dist/main/index.js');
const rendererPath = path.join(__dirname, '../../dist/renderer/index.html');

async function runCommand (command, args, description) {
  console.log(`\n${description}...`);
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '../..')
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed`);
        resolve();
      } else {
        console.error(`❌ ${description} failed with code ${code}`);
        reject(new Error(`${description} failed`));
      }
    });

    proc.on('error', (err) => {
      console.error(`Failed to run ${description}:`, err);
      reject(err);
    });
  });
}

async function main () {
  try {
    // Check if built
    if (!fs.existsSync(mainPath) || !fs.existsSync(rendererPath)) {
      console.log('⚠️  App not built. Building now...');
      await runCommand('npm', ['run', 'build'], 'Building app');
    } else {
      console.log('✅ App already built');
    }

    // Ensure backend is running
    console.log('\n⚠️  Make sure the backend is running (npm run dev:server)');
    console.log('   The tests will connect to http://localhost:3001\n');

    // Add test images reminder
    console.log('📁 Test images reminder:');
    console.log('   Add test images to: tests/e2e/fixtures/test-images/');
    console.log('   Required: small.jpg, medium.png, large.jpg, batch-1.jpg through batch-5.jpg\n');

    // Run tests
    const testArgs = ['playwright', 'test', '--config=tests/e2e/playwright.config.ts'];
    if (process.argv[2]) {
      testArgs.push(process.argv[2]);
    }

    await runCommand('npx', testArgs, 'Running E2E tests');

    console.log('\n✅ Tests completed!');
    console.log('📊 View report: npm run test:e2e:report');

  } catch (error) {
    console.error('\n❌ Test setup failed:', error.message);
    process.exit(1);
  }
}

main();
