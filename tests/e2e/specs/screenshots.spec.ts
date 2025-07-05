import { test, expect } from '../fixtures/electron-app';
import path from 'path';

test.describe('Application Screenshots', () => {
  test('capture main compression view', async ({ page }) => {
    // Wait for the app to load completely
    await page.waitForTimeout(3000);

    // Try to load a test image to show the compression interface in action
    try {
      const testImagePath = path.join(__dirname, '../fixtures/test-images/small.jpg');

      // Look for file input or drag-drop area
      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles(testImagePath);
        await page.waitForTimeout(2000); // Wait for image to load
      }
    } catch (error) {
      console.log('Could not load test image in compression view:', error.message);
    }

    // Take screenshot of the main compression view
    await page.screenshot({
      path: path.join(__dirname, '../../../docs/screenshots/compression-view.png'),
      fullPage: true,
    });
  });

  test('capture batch processing view', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(2000);

    // Click on Batch Processing in sidebar
    await page.click('text=Batch Processing');
    await page.waitForTimeout(1000);

    // Try to add some test images to the batch to show functionality
    try {
      const batchImages = [
        path.join(__dirname, '../fixtures/test-images/batch-1.jpg'),
        path.join(__dirname, '../fixtures/test-images/batch-2.jpg'),
        path.join(__dirname, '../fixtures/test-images/batch-3.jpg'),
      ];

      // Look for file input in batch view
      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles(batchImages);
        await page.waitForTimeout(2000); // Wait for images to load
      }
    } catch (error) {
      console.log('Could not load test images in batch view:', error.message);
    }

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../../../docs/screenshots/batch-processing.png'),
      fullPage: true,
    });
  });

  test('capture presets system', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(2000);

    // Click on Presets in sidebar
    await page.click('text=Presets');
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../../../docs/screenshots/presets-system.png'),
      fullPage: true,
    });
  });

  test('capture history and analytics', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(2000);

    // Click on History in sidebar
    await page.click('text=History');
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../../../docs/screenshots/history-analytics.png'),
      fullPage: true,
    });
  });

  test('capture settings panel', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(2000);

    // Click on Settings in sidebar - try different possible text variations
    try {
      await page.click('text=Settings');
    } catch {
      try {
        await page.click('text=Compression Settings');
      } catch {
        console.log('Could not find Settings navigation');
      }
    }
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../../../docs/screenshots/settings-panel.png'),
      fullPage: true,
    });
  });
});
