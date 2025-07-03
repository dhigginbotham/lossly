import { Page, Locator } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

export class TestHelpers {
  constructor(private page: Page) { }

  /**
   * Navigate to a specific view in the app
   */
  async navigateToView(viewName: 'single' | 'batch' | 'history' | 'settings') {
    const viewMap = {
      single: '/',
      batch: '/batch',
      history: '/history',
      settings: '/settings'
    };

    await this.page.goto(viewMap[viewName]);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Upload files via drag and drop
   */
  async dragAndDropFiles(target: string | Locator, filePaths: string[]) {
    const dataTransfer = await this.page.evaluateHandle(() => new DataTransfer());

    for (const filePath of filePaths) {
      const file = await this.page.evaluateHandle(
        async ({ filePath }) => {
          const response = await fetch(`file://${filePath}`);
          const data = await response.blob();
          return new File([data], path.basename(filePath), { type: data.type });
        },
        { filePath }
      );

      await dataTransfer.evaluateHandle(
        (dt, file) => dt.items.add(file),
        file
      );
    }

    if (typeof target === 'string') {
      await this.page.dispatchEvent(target, 'drop', { dataTransfer });
    } else {
      await target.dispatchEvent('drop', { dataTransfer });
    }
  }

  /**
   * Get file stats for validation
   */
  async getFileStats(filePath: string) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        exists: true
      };
    } catch (error) {
      return {
        size: 0,
        exists: false
      };
    }
  }

  /**
   * Format bytes to human readable format (matching the app's format)
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Wait for batch processing to complete
   */
  async waitForBatchComplete(timeout = 30000) {
    await this.page.waitForFunction(
      () => {
        const stats = document.querySelector('[data-testid="batch-stats"]');
        if (!stats) return false;

        const totalText = stats.querySelector('[data-testid="total-images"]')?.textContent || '0';
        const completedText = stats.querySelector('[data-testid="completed-images"]')?.textContent || '0';

        const total = parseInt(totalText);
        const completed = parseInt(completedText);

        return total > 0 && total === completed;
      },
      { timeout }
    );
  }

  /**
   * Check for console errors
   */
  async checkForConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to catch any delayed errors
    await this.page.waitForTimeout(1000);

    return errors;
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `tests/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Get test image paths
   */
  getTestImagePaths() {
    const testImagesDir = path.join(__dirname, 'test-images');
    return {
      small: path.join(testImagesDir, 'small.jpg'),
      medium: path.join(testImagesDir, 'medium.png'),
      large: path.join(testImagesDir, 'large.jpg'),
      batch: Array.from({ length: 5 }, (_, i) =>
        path.join(testImagesDir, `batch-${i + 1}.jpg`)
      ),
      invalid: path.join(testImagesDir, 'invalid.txt')
    };
  }

  /**
   * Verify no "NaN" or "undefined" text appears
   */
  async verifyNoInvalidText() {
    const bodyText = await this.page.textContent('body');
    const invalidPatterns = ['NaN', 'undefined', '0 Bytes'];

    const found = invalidPatterns.filter(pattern =>
      bodyText?.includes(pattern)
    );

    return {
      hasInvalid: found.length > 0,
      found
    };
  }
}
