import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

async function globalSetup(config: FullConfig) {
  console.log('Starting global test setup...');

  // Ensure test directories exist
  const dirs = [
    'tests/screenshots',
    'tests/videos',
    'tests/test-results',
    'tests/e2e/fixtures/test-images'
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Create test images if they don't exist
  await createTestImages();

  console.log('Global test setup completed.');
}

async function createTestImages() {
  const testImagesDir = path.join(__dirname, 'test-images');

  // Check if test images already exist
  try {
    const files = await fs.readdir(testImagesDir);
    if (files.length > 0) {
      console.log('Test images already exist.');
      return;
    }
  } catch (error) {
    // Directory might not exist, continue
  }

  // For now, we'll copy some sample images from the user's desktop if available
  // In a real scenario, we'd generate or include test images in the repo
  console.log('Note: Please add test images to tests/e2e/fixtures/test-images/');
  console.log('Required test images:');
  console.log('- small.jpg (100KB)');
  console.log('- medium.png (1MB)');
  console.log('- large.jpg (5MB)');
  console.log('- batch-1.jpg through batch-5.jpg');
  console.log('- invalid.txt (for error testing)');
}

export default globalSetup;
