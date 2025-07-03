import { test, expect } from '../fixtures/electron-app';
import { TestHelpers } from '../fixtures/test-helpers';
import path from 'path';

test.describe('Batch Processing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToView('batch');

    // Clear any existing batch items
    const clearButton = page.locator('button:has-text("Clear All")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  });

  test('should upload multiple files via drag and drop', async ({ page }) => {
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');

    // Drag and drop 5 test images
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    // Wait for files to be added
    await page.waitForTimeout(1000);

    // Verify all 5 files appear in the list
    const fileRows = page.locator('tbody tr');
    await expect(fileRows).toHaveCount(5);

    // Take screenshot for evidence
    await helpers.screenshot('batch-files-uploaded');
  });

  test('should upload files via Choose Images button', async ({ page }) => {
    const chooseButton = page.locator('button:has-text("Choose Images")');
    await expect(chooseButton).toBeVisible();

    // Click the button
    await chooseButton.click();

    // Handle file dialog (this will use the native dialog mock)
    const fileChooserPromise = page.waitForEvent('filechooser');
    const fileChooser = await fileChooserPromise;

    const testImages = helpers.getTestImagePaths();
    await fileChooser.setFiles(testImages.batch);

    // Wait for files to be added
    await page.waitForTimeout(1000);

    // Verify files appear in the list
    const fileRows = page.locator('tbody tr');
    await expect(fileRows).toHaveCount(5);
  });

  test('should display correct file sizes (not 0 Bytes)', async ({ page }) => {
    // Upload test files
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    await page.waitForTimeout(1000);

    // Check each file size display
    const fileSizes = page.locator('td:nth-child(3)'); // Original size column
    const count = await fileSizes.count();

    for (let i = 0; i < count; i++) {
      const sizeText = await fileSizes.nth(i).textContent();

      // Verify size is not "0 Bytes" or empty
      expect(sizeText).not.toBe('0 Bytes');
      expect(sizeText).not.toBe('');
      expect(sizeText).not.toContain('NaN');
      expect(sizeText).not.toContain('undefined');

      // Verify it matches expected format (e.g., "2.5 MB", "156 KB")
      expect(sizeText).toMatch(/^\d+(\.\d+)?\s*(Bytes|KB|MB|GB)$/);
    }

    await helpers.screenshot('batch-correct-file-sizes');
  });

  test('should show image thumbnails', async ({ page }) => {
    // Upload test files
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    await page.waitForTimeout(1000);

    // Check for thumbnail images
    const thumbnails = page.locator('td:first-child img');
    const count = await thumbnails.count();

    // Should have thumbnails for all uploaded images
    expect(count).toBe(5);

    // Verify thumbnails are visible and have src
    for (let i = 0; i < count; i++) {
      const thumbnail = thumbnails.nth(i);
      await expect(thumbnail).toBeVisible();

      const src = await thumbnail.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('file://');
    }

    await helpers.screenshot('batch-thumbnails-visible');
  });

  test('should process all files completely (5/5 not 4/5)', async ({ page }) => {
    // Upload 5 test files
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    await page.waitForTimeout(1000);

    // Start batch processing
    const startButton = page.locator('button:has-text("Start Batch")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Wait for processing to complete (with longer timeout)
    await helpers.waitForBatchComplete(60000);

    // Check final stats
    const totalImages = page.locator('[data-testid="total-images"], .chakra-stat:has-text("Total Images") .chakra-stat__number');
    const completedImages = page.locator('[data-testid="completed-images"], .chakra-stat:has-text("Completed") .chakra-stat__number');

    const totalText = await totalImages.textContent();
    const completedText = await completedImages.textContent();

    // Verify all 5 files were processed
    expect(totalText).toBe('5');
    expect(completedText).toBe('5'); // Not 4!

    // Verify all items show as completed
    const statuses = page.locator('td:has(.chakra-badge)');
    const statusCount = await statuses.count();

    for (let i = 0; i < statusCount; i++) {
      const statusText = await statuses.nth(i).textContent();
      expect(statusText).toContain('completed');
    }

    await helpers.screenshot('batch-all-files-completed');
  });

  test('should show real-time progress updates', async ({ page }) => {
    // Upload files
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    await page.waitForTimeout(1000);

    // Start processing
    const startButton = page.locator('button:has-text("Start Batch")');
    await startButton.click();

    // Check for progress bar
    const progressBar = page.locator('.chakra-progress');
    await expect(progressBar).toBeVisible();

    // Verify progress increases
    let previousProgress = 0;
    let progressIncreased = false;

    for (let i = 0; i < 10; i++) {
      const progressValue = await progressBar.getAttribute('aria-valuenow');
      const currentProgress = parseInt(progressValue || '0');

      if (currentProgress > previousProgress) {
        progressIncreased = true;
        break;
      }

      previousProgress = currentProgress;
      await page.waitForTimeout(1000);
    }

    expect(progressIncreased).toBe(true);
  });

  test('should allow preview of individual images', async ({ page }) => {
    // Upload files
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    await page.waitForTimeout(1000);

    // Click menu for first item
    const menuButton = page.locator('tbody tr').first().locator('button[aria-label*="menu"]');
    await menuButton.click();

    // Click preview option
    const previewOption = page.locator('div[role="menu"] button:has-text("Preview")');
    await expect(previewOption).toBeVisible();
    await previewOption.click();

    // Verify preview modal opens
    const modal = page.locator('.chakra-modal__content');
    await expect(modal).toBeVisible();

    // Verify image is displayed
    const previewImage = modal.locator('img');
    await expect(previewImage).toBeVisible();

    await helpers.screenshot('batch-image-preview');

    // Close modal
    const closeButton = modal.locator('button[aria-label="Close"]');
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to upload non-image file
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');

    await helpers.dragAndDropFiles(dropZone.first(), [testImages.invalid]);

    // Should show error toast
    const toast = page.locator('.chakra-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('No images found');

    // Should not add any files
    const fileRows = page.locator('tbody tr');
    await expect(fileRows).toHaveCount(0);
  });

  test('should not show NaN or undefined anywhere', async ({ page }) => {
    // Upload and process files
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch);

    await page.waitForTimeout(1000);

    // Start processing
    const startButton = page.locator('button:has-text("Start Batch")');
    await startButton.click();

    // Wait for completion
    await helpers.waitForBatchComplete(60000);

    // Check for invalid text
    const validation = await helpers.verifyNoInvalidText();
    expect(validation.hasInvalid).toBe(false);

    if (validation.hasInvalid) {
      console.error('Found invalid text:', validation.found);
      await helpers.screenshot('batch-invalid-text-found');
    }
  });

  test.afterEach(async ({ page }) => {
    // Check for console errors
    const errors = await helpers.checkForConsoleErrors();
    if (errors.length > 0) {
      console.error('Console errors found:', errors);
      await helpers.screenshot('console-errors');
    }
    expect(errors).toHaveLength(0);
  });
});
