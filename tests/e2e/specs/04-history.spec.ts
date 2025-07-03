import { test, expect } from '../fixtures/electron-app';
import { TestHelpers } from '../fixtures/test-helpers';

test.describe('History', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // First, create some history by compressing an image
    await helpers.navigateToView('single');

    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="single-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), [testImages.small]);

    await page.waitForTimeout(1000);

    const compressButton = page.locator('button:has-text("Compress")');
    await compressButton.click();

    // Wait for compression to complete
    await page.waitForSelector('button:has-text("Download"), button:has-text("Save")', { timeout: 30000 });

    // Now navigate to history
    await helpers.navigateToView('history');
  });

  test('should display compression history entries', async ({ page }) => {
    // Check for history table
    const historyTable = page.locator('table, [data-testid="history-table"]');
    await expect(historyTable).toBeVisible();

    // Check for at least one history entry
    const historyRows = page.locator('tbody tr');
    const rowCount = await historyRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify entry has required information
    const firstRow = historyRows.first();

    // Check for filename
    const filename = firstRow.locator('td').first();
    await expect(filename).toContainText(/\.(jpg|jpeg|png|webp|gif)/i);

    await helpers.screenshot('history-entries-displayed');
  });

  test('should display correct file sizes (not NaN undefined)', async ({ page }) => {
    const historyRows = page.locator('tbody tr');
    const firstRow = historyRows.first();

    // Find the size columns (original and compressed)
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();

    let foundValidSize = false;
    for (let i = 0; i < cellCount; i++) {
      const cellText = await cells.nth(i).textContent();

      // Check if this looks like a file size
      if (cellText && /\d+(\.\d+)?\s*(Bytes|KB|MB|GB)/.test(cellText)) {
        foundValidSize = true;

        // Verify it's not invalid
        expect(cellText).not.toContain('NaN');
        expect(cellText).not.toContain('undefined');
        expect(cellText).not.toBe('0 Bytes');
      }
    }

    expect(foundValidSize).toBe(true);

    await helpers.screenshot('history-valid-file-sizes');
  });

  test('should show compression statistics', async ({ page }) => {
    const historyRows = page.locator('tbody tr');
    const firstRow = historyRows.first();

    // Look for reduction percentage
    const reductionCell = firstRow.locator('td:has-text("%"), .chakra-badge:has-text("%")');
    await expect(reductionCell).toBeVisible();

    const reductionText = await reductionCell.textContent();
    expect(reductionText).toMatch(/\d+(\.\d+)?%/);

    // Verify it's a reasonable reduction (between 1% and 99%)
    const percentage = parseFloat(reductionText!.replace('%', ''));
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThan(100);
  });

  test('should show history item details on click', async ({ page }) => {
    const historyRows = page.locator('tbody tr');
    const firstRow = historyRows.first();

    // Click on the row or details button
    const detailsButton = firstRow.locator('button:has-text("Details"), button[aria-label*="details"]');
    if (await detailsButton.isVisible()) {
      await detailsButton.click();
    } else {
      await firstRow.click();
    }

    // Wait for details modal/panel
    const detailsModal = page.locator('.chakra-modal__content, [data-testid="history-details"]');
    await expect(detailsModal).toBeVisible({ timeout: 5000 });

    // Verify details content
    const modalText = await detailsModal.textContent();

    // Should contain file information
    expect(modalText).toContain('Original');
    expect(modalText).toContain('Compressed');
    expect(modalText).toMatch(/\d+(\.\d+)?\s*(Bytes|KB|MB|GB)/);

    // Should not contain invalid text
    expect(modalText).not.toContain('NaN');
    expect(modalText).not.toContain('undefined');

    await helpers.screenshot('history-item-details');

    // Close modal
    const closeButton = detailsModal.locator('button[aria-label="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(detailsModal).not.toBeVisible();
    }
  });

  test('should delete individual history items', async ({ page }) => {
    // Get initial count
    const historyRows = page.locator('tbody tr');
    const initialCount = await historyRows.count();

    // Delete first item
    const firstRow = historyRows.first();
    const deleteButton = firstRow.locator('button:has-text("Delete"), button[aria-label*="delete"]');
    await deleteButton.click();

    // Confirm deletion if dialog appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"):visible');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify count decreased
    const newCount = await historyRows.count();
    expect(newCount).toBe(initialCount - 1);

    // If no items left, should show empty state
    if (newCount === 0) {
      const emptyState = page.locator('text=/No.*history.*found/i');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should clear all history', async ({ page }) => {
    // First verify we have history items
    const historyRows = page.locator('tbody tr');
    const initialCount = await historyRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Find and click clear all button
    const clearAllButton = page.locator('button:has-text("Clear All"), button:has-text("Clear History")');
    await expect(clearAllButton).toBeVisible();
    await clearAllButton.click();

    // Confirm if dialog appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Clear"):visible');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }

    // Wait for clearing
    await page.waitForTimeout(1000);

    // Verify history is empty
    const emptyState = page.locator('text=/No.*history.*found/i, text=/History.*empty/i');
    await expect(emptyState).toBeVisible();

    // Verify table has no rows or is hidden
    const rowCount = await historyRows.count();
    expect(rowCount).toBe(0);

    await helpers.screenshot('history-cleared');
  });

  test('should persist history after navigation', async ({ page }) => {
    // Get initial history count
    const historyRows = page.locator('tbody tr');
    const initialCount = await historyRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Navigate away
    await helpers.navigateToView('single');
    await page.waitForTimeout(500);

    // Navigate back to history
    await helpers.navigateToView('history');
    await page.waitForTimeout(500);

    // Verify history is still there
    const newCount = await historyRows.count();
    expect(newCount).toBe(initialCount);
  });

  test('should show batch compression entries', async ({ page }) => {
    // Create batch history
    await helpers.navigateToView('batch');

    const testImages = helpers.getTestImagePaths();
    const dropZone = page.locator('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag & drop")');
    await helpers.dragAndDropFiles(dropZone.first(), testImages.batch.slice(0, 2)); // Just 2 files for speed

    await page.waitForTimeout(1000);

    // Start batch
    const startButton = page.locator('button:has-text("Start Batch")');
    await startButton.click();

    // Wait for batch to complete
    await helpers.waitForBatchComplete(30000);

    // Go to history
    await helpers.navigateToView('history');

    // Look for batch entries
    const batchBadges = page.locator('.chakra-badge:has-text("Batch"), td:has-text("batch")');
    const batchCount = await batchBadges.count();
    expect(batchCount).toBeGreaterThan(0);

    await helpers.screenshot('history-batch-entries');
  });

  test('should filter or search history', async ({ page }) => {
    // Skip if no search functionality visible
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Filter"]');
    if (!(await searchInput.isVisible({ timeout: 2000 }))) {
      test.skip();
      return;
    }

    // Get filename from first entry
    const firstRow = page.locator('tbody tr').first();
    const filename = await firstRow.locator('td').first().textContent();
    const searchTerm = filename?.split('.')[0] || 'test';

    // Search for it
    await searchInput.fill(searchTerm);
    await page.waitForTimeout(500);

    // Verify filtered results
    const visibleRows = page.locator('tbody tr:visible');
    const visibleCount = await visibleRows.count();

    // Should show at least one result
    expect(visibleCount).toBeGreaterThan(0);

    // All visible rows should contain search term
    for (let i = 0; i < visibleCount; i++) {
      const rowText = await visibleRows.nth(i).textContent();
      expect(rowText?.toLowerCase()).toContain(searchTerm.toLowerCase());
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
