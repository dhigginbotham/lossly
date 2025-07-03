import { test, expect } from '../fixtures/electron-app';
import { TestHelpers } from '../fixtures/test-helpers';
import path from 'path';

test.describe('Single Image Upload & Compression', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToView('single');
  });

  test('should upload image via drag and drop', async ({ page }) => {
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');

    // Drag and drop a test image
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.medium]);

    // Wait for image to load
    await page.waitForTimeout(1000);

    // Verify image preview appears
    const imagePreview = page.locator('img[alt*="Original"], img[alt*="Preview"]').first();
    await expect(imagePreview).toBeVisible();

    // Verify file info is displayed
    const fileInfo = page.locator('text=/\\d+(\\.\\d+)?\\s*(KB|MB)/');
    await expect(fileInfo).toBeVisible();

    await helpers.screenshot('single-image-uploaded');
  });

  test('should upload image via file dialog', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Choose Image"), button:has-text("Select Image")');
    await expect(uploadButton).toBeVisible();

    // Set up file chooser before clicking
    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();

    const fileChooser = await fileChooserPromise;
    const testImages = helpers.getTestImagePaths();
    await fileChooser.setFiles([testImages.small]);

    // Wait for image to load
    await page.waitForTimeout(1000);

    // Verify image preview appears
    const imagePreview = page.locator('img[alt*="Original"], img[alt*="Preview"]').first();
    await expect(imagePreview).toBeVisible();
  });

  test('should display compression settings', async ({ page }) => {
    // Upload an image first
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.medium]);

    await page.waitForTimeout(1000);

    // Check for compression settings
    const qualitySlider = page.locator('input[type="range"][aria-label*="Quality"], input[type="range"][name="quality"]');
    await expect(qualitySlider).toBeVisible();

    const formatSelect = page.locator('select:has-text("Format"), select[name="format"]').first();
    await expect(formatSelect).toBeVisible();

    // Verify default values
    const qualityValue = await qualitySlider.inputValue();
    expect(parseInt(qualityValue)).toBeGreaterThan(0);
    expect(parseInt(qualityValue)).toBeLessThanOrEqual(100);
  });

  test('should compress image and show results', async ({ page }) => {
    // Upload an image
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.large]);

    await page.waitForTimeout(1000);

    // Click compress button
    const compressButton = page.locator('button:has-text("Compress")');
    await expect(compressButton).toBeVisible();
    await compressButton.click();

    // Wait for compression to complete
    await page.waitForFunction(
      () => {
        const button = document.querySelector('button:has-text("Download"), button:has-text("Save")');
        return button !== null;
      },
      { timeout: 30000 }
    );

    // Verify results are shown
    const savedText = page.locator('text=/Saved:\\s*\\d+(\\.\\d+)?%/');
    await expect(savedText).toBeVisible();

    // Verify before/after comparison
    const comparisonSlider = page.locator('[data-testid="comparison-slider"], .chakra-slider');
    await expect(comparisonSlider).toBeVisible();

    await helpers.screenshot('single-compression-complete');
  });

  test('should allow adjusting compression settings', async ({ page }) => {
    // Upload an image
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.medium]);

    await page.waitForTimeout(1000);

    // Adjust quality slider
    const qualitySlider = page.locator('input[type="range"][aria-label*="Quality"], input[type="range"][name="quality"]');
    await qualitySlider.fill('50');

    // Change format
    const formatSelect = page.locator('select:has-text("Format"), select[name="format"]').first();
    await formatSelect.selectOption('webp');

    // Compress with new settings
    const compressButton = page.locator('button:has-text("Compress")');
    await compressButton.click();

    // Wait for compression
    await page.waitForFunction(
      () => {
        const button = document.querySelector('button:has-text("Download"), button:has-text("Save")');
        return button !== null;
      },
      { timeout: 30000 }
    );

    // Verify compression happened with new format
    const outputInfo = page.locator('text=/Output.*webp/i');
    await expect(outputInfo).toBeVisible();
  });

  test('should save compressed image', async ({ page }) => {
    // Upload and compress an image
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.small]);

    await page.waitForTimeout(1000);

    const compressButton = page.locator('button:has-text("Compress")');
    await compressButton.click();

    // Wait for compression
    await page.waitForFunction(
      () => {
        const button = document.querySelector('button:has-text("Download"), button:has-text("Save")');
        return button !== null;
      },
      { timeout: 30000 }
    );

    // Click save button
    const saveButton = page.locator('button:has-text("Download"), button:has-text("Save")');
    await expect(saveButton).toBeVisible();

    // Set up download promise
    const downloadPromise = page.waitForEvent('download');
    await saveButton.click();

    // Handle file save dialog if it appears
    const download = await downloadPromise;
    expect(download).toBeTruthy();

    // Verify download started
    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toContain('compressed');
  });

  test('should show before/after comparison slider', async ({ page }) => {
    // Upload and compress an image
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.medium]);

    await page.waitForTimeout(1000);

    const compressButton = page.locator('button:has-text("Compress")');
    await compressButton.click();

    // Wait for compression
    await page.waitForFunction(
      () => {
        const slider = document.querySelector('[data-testid="comparison-slider"], .chakra-slider');
        return slider !== null;
      },
      { timeout: 30000 }
    );

    // Verify comparison slider is interactive
    const slider = page.locator('[data-testid="comparison-slider"], .chakra-slider');
    const sliderThumb = slider.locator('[role="slider"]');

    // Get initial position
    const initialValue = await sliderThumb.getAttribute('aria-valuenow');

    // Drag slider
    await sliderThumb.dragTo(slider, {
      targetPosition: { x: 100, y: 0 }
    });

    // Verify position changed
    const newValue = await sliderThumb.getAttribute('aria-valuenow');
    expect(newValue).not.toBe(initialValue);

    await helpers.screenshot('single-comparison-slider');
  });

  test('should handle invalid file types', async ({ page }) => {
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');

    // Try to upload non-image file
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.invalid]);

    // Should show error
    const toast = page.locator('.chakra-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/invalid|error|not.*image/i);

    // Should not show image preview
    const imagePreview = page.locator('img[alt*="Original"], img[alt*="Preview"]');
    await expect(imagePreview).not.toBeVisible();
  });

  test('should reset when clicking new image', async ({ page }) => {
    // Upload and compress first image
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.small]);

    await page.waitForTimeout(1000);

    const compressButton = page.locator('button:has-text("Compress")');
    await compressButton.click();

    // Wait for compression
    await page.waitForSelector('button:has-text("Download"), button:has-text("Save")', { timeout: 30000 });

    // Click new image button
    const newImageButton = page.locator('button:has-text("New Image"), button:has-text("Upload Another")');
    await expect(newImageButton).toBeVisible();
    await newImageButton.click();

    // Verify reset to initial state
    const uploadPrompt = page.locator('text=/Drag.*drop.*image/i');
    await expect(uploadPrompt).toBeVisible();

    // Compression results should be gone
    const savedText = page.locator('text=/Saved:\\s*\\d+(\\.\\d+)?%/');
    await expect(savedText).not.toBeVisible();
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
