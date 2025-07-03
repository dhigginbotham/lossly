import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';

export type TestFixtures = {
  electronApp: ElectronApplication;
  page: Page;
};

export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({ }, use) => {
    // Launch Electron app
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_IS_DEV: '0',
      },
      cwd: path.join(__dirname, '../../../'),
    });

    // Wait for the first window
    const window = await electronApp.firstWindow();

    // Set viewport size
    await window.setViewportSize({ width: 1200, height: 800 });

    // Use the app in tests
    await use(electronApp);

    // Close the app
    await electronApp.close();
  },

  page: async ({ electronApp }, use) => {
    // Get the first window
    const page = await electronApp.firstWindow();

    // Wait for app to be ready
    await page.waitForLoadState('networkidle');

    // Enable console log capture
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    // Use the page in tests
    await use(page);
  },
});

export { expect } from '@playwright/test';

