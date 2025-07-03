import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Running global test teardown...');

  // Clean up any test artifacts if needed
  // For now, we keep test results for inspection

  console.log('Global test teardown completed.');
}

export default globalTeardown;
