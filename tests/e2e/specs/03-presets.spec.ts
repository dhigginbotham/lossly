import { test, expect } from '../fixtures/electron-app';
import { TestHelpers } from '../fixtures/test-helpers';

test.describe('Presets', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToView('single');

    // Upload an image to access compression settings
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.small]);
    await page.waitForTimeout(1000);
  });

  test('should show preset options in compression settings', async ({ page }) => {
    // Look for preset section
    const presetSection = page.locator('text=/Preset/i, label:has-text("Preset")').first();
    await expect(presetSection).toBeVisible();

    // Check for preset dropdown or buttons
    const presetSelect = page.locator('select:has-text("Preset"), select[name="preset"]');
    const presetButtons = page.locator('button:has-text("High Quality"), button:has-text("Balanced")');

    // Should have either dropdown or buttons
    const hasPresetUI = await presetSelect.isVisible() || await presetButtons.first().isVisible();
    expect(hasPresetUI).toBe(true);

    await helpers.screenshot('presets-ui-visible');
  });

  test('should create custom preset', async ({ page }) => {
    // Adjust settings
    const qualitySlider = page.locator('input[type="range"][aria-label*="Quality"], input[type="range"][name="quality"]');
    await qualitySlider.fill('75');

    const formatSelect = page.locator('select:has-text("Format"), select[name="format"]').first();
    await formatSelect.selectOption('webp');

    // Save as preset
    const savePresetButton = page.locator('button:has-text("Save as Preset"), button:has-text("Save Preset")');
    await expect(savePresetButton).toBeVisible();
    await savePresetButton.click();

    // Enter preset name
    const presetNameInput = page.locator('input[placeholder*="Preset name"], input[placeholder*="Name"]');
    await expect(presetNameInput).toBeVisible();
    await presetNameInput.fill('My Custom Preset');

    // Confirm save
    const confirmButton = page.locator('button:has-text("Save"):visible').last();
    await confirmButton.click();

    // Verify preset was saved
    await page.waitForTimeout(1000);

    // Check if preset appears in list
    const customPreset = page.locator('text="My Custom Preset", option:has-text("My Custom Preset")');
    await expect(customPreset).toBeVisible();

    await helpers.screenshot('preset-created');
  });

  test('should load saved preset', async ({ page }) => {
    // First create a preset
    const qualitySlider = page.locator('input[type="range"][aria-label*="Quality"], input[type="range"][name="quality"]');
    await qualitySlider.fill('60');

    const savePresetButton = page.locator('button:has-text("Save as Preset"), button:has-text("Save Preset")');
    await savePresetButton.click();

    const presetNameInput = page.locator('input[placeholder*="Preset name"], input[placeholder*="Name"]');
    await presetNameInput.fill('Test Preset 60');

    const confirmButton = page.locator('button:has-text("Save"):visible').last();
    await confirmButton.click();

    await page.waitForTimeout(1000);

    // Change quality to something else
    await qualitySlider.fill('90');

    // Load the preset
    const presetOption = page.locator('text="Test Preset 60", option:has-text("Test Preset 60")');
    if (await presetOption.isVisible()) {
      // It's in a dropdown
      const presetSelect = page.locator('select:has(option:has-text("Test Preset 60"))');
      await presetSelect.selectOption('Test Preset 60');
    } else {
      // It's a button
      const presetButton = page.locator('button:has-text("Test Preset 60")');
      await presetButton.click();
    }

    await page.waitForTimeout(500);

    // Verify quality was restored to 60
    const currentQuality = await qualitySlider.inputValue();
    expect(currentQuality).toBe('60');
  });

  test('should apply preset to compression', async ({ page }) => {
    // Create a preset with specific settings
    const qualitySlider = page.locator('input[type="range"][aria-label*="Quality"], input[type="range"][name="quality"]');
    await qualitySlider.fill('45');

    const formatSelect = page.locator('select:has-text("Format"), select[name="format"]').first();
    await formatSelect.selectOption('webp');

    const savePresetButton = page.locator('button:has-text("Save as Preset"), button:has-text("Save Preset")');
    await savePresetButton.click();

    const presetNameInput = page.locator('input[placeholder*="Preset name"], input[placeholder*="Name"]');
    await presetNameInput.fill('Low Quality WebP');

    const confirmButton = page.locator('button:has-text("Save"):visible').last();
    await confirmButton.click();

    await page.waitForTimeout(1000);

    // Compress with this preset
    const compressButton = page.locator('button:has-text("Compress")');
    await compressButton.click();

    // Wait for compression
    await page.waitForSelector('button:has-text("Download"), button:has-text("Save")', { timeout: 30000 });

    // Verify output format is WebP
    const outputInfo = page.locator('text=/Output.*webp/i, text=/Format.*webp/i');
    await expect(outputInfo).toBeVisible();

    await helpers.screenshot('preset-applied-compression');
  });

  test('should delete custom preset', async ({ page }) => {
    // Create a preset first
    const savePresetButton = page.locator('button:has-text("Save as Preset"), button:has-text("Save Preset")');
    await savePresetButton.click();

    const presetNameInput = page.locator('input[placeholder*="Preset name"], input[placeholder*="Name"]');
    await presetNameInput.fill('Preset to Delete');

    const confirmButton = page.locator('button:has-text("Save"):visible').last();
    await confirmButton.click();

    await page.waitForTimeout(1000);

    // Open preset management (if exists)
    const managePresetsButton = page.locator('button:has-text("Manage Presets"), button[aria-label*="Manage presets"]');
    if (await managePresetsButton.isVisible()) {
      await managePresetsButton.click();

      // Find and delete the preset
      const presetItem = page.locator('text="Preset to Delete"').locator('..');
      const deleteButton = presetItem.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
      await deleteButton.click();

      // Confirm deletion
      const confirmDelete = page.locator('button:has-text("Delete"):visible, button:has-text("Confirm"):visible').last();
      await confirmDelete.click();

      await page.waitForTimeout(1000);

      // Verify preset is gone
      const deletedPreset = page.locator('text="Preset to Delete"');
      await expect(deletedPreset).not.toBeVisible();
    } else {
      // Alternative: Right-click on preset
      const presetOption = page.locator('text="Preset to Delete", option:has-text("Preset to Delete")');
      if (await presetOption.isVisible()) {
        await presetOption.click({ button: 'right' });

        const deleteOption = page.locator('text="Delete", text="Remove"');
        if (await deleteOption.isVisible()) {
          await deleteOption.click();

          // Verify deletion
          await page.waitForTimeout(1000);
          await expect(presetOption).not.toBeVisible();
        }
      }
    }
  });

  test('should have default presets available', async ({ page }) => {
    // Check for common default presets
    const defaultPresets = [
      'High Quality',
      'Balanced',
      'Small File Size',
      'Web Optimized'
    ];

    let foundDefault = false;

    for (const presetName of defaultPresets) {
      const preset = page.locator(`text="${presetName}", option:has-text("${presetName}"), button:has-text("${presetName}")`);
      if (await preset.isVisible({ timeout: 1000 })) {
        foundDefault = true;
        break;
      }
    }

    expect(foundDefault).toBe(true);
  });

  test('should persist presets across sessions', async ({ page }) => {
    // Create a preset
    const savePresetButton = page.locator('button:has-text("Save as Preset"), button:has-text("Save Preset")');
    await savePresetButton.click();

    const presetNameInput = page.locator('input[placeholder*="Preset name"], input[placeholder*="Name"]');
    await presetNameInput.fill('Persistent Preset');

    const confirmButton = page.locator('button:has-text("Save"):visible').last();
    await confirmButton.click();

    await page.waitForTimeout(1000);

    // Navigate away and back
    await helpers.navigateToView('batch');
    await page.waitForTimeout(500);
    await helpers.navigateToView('single');

    // Upload image again to access presets
    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.small]);
    await page.waitForTimeout(1000);

    // Check if preset still exists
    const persistentPreset = page.locator('text="Persistent Preset", option:has-text("Persistent Preset")');
    await expect(persistentPreset).toBeVisible();
  });

  test('should show preset details on hover/focus', async ({ page }) => {
    // Skip if UI doesn't support this
    const presetOption = page.locator('button:has-text("High Quality"), option:has-text("High Quality")').first();

    if (!(await presetOption.isVisible())) {
      test.skip();
      return;
    }

    // Hover over preset
    await presetOption.hover();
    await page.waitForTimeout(500);

    // Check for tooltip or details
    const tooltip = page.locator('[role="tooltip"], .chakra-tooltip');
    const hasTooltip = await tooltip.isVisible({ timeout: 1000 });

    if (hasTooltip) {
      const tooltipText = await tooltip.textContent();

      // Should show some settings info
      expect(tooltipText).toMatch(/Quality|Format|Settings/i);

      await helpers.screenshot('preset-tooltip');
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
