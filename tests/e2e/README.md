# Lossly E2E Testing Documentation

## Overview

This comprehensive E2E testing suite uses Playwright to validate all features of the Lossly application. The tests run against the actual Electron application, ensuring real-world functionality.

## Test Coverage

### 1. Single Image Upload & Compression (`01-single-upload.spec.ts`)
- ✅ Upload via drag & drop
- ✅ Upload via file dialog
- ✅ Display compression settings
- ✅ Compress image and show results
- ✅ Adjust compression settings
- ✅ Save compressed image
- ✅ Before/after comparison slider
- ✅ Handle invalid file types
- ✅ Reset functionality

### 2. Batch Processing (`02-batch-processing.spec.ts`)
- ✅ Upload multiple files via drag & drop
- ✅ Upload files via "Choose Images" button
- ✅ Display correct file sizes (NOT "0 Bytes")
- ✅ Show image thumbnails
- ✅ Process ALL files completely (5/5, not 4/5)
- ✅ Real-time progress updates
- ✅ Preview individual images
- ✅ Handle errors gracefully
- ✅ No "NaN" or "undefined" text anywhere

### 3. Presets (`03-presets.spec.ts`)
- ✅ Show preset options
- ✅ Create custom preset
- ✅ Load saved preset
- ✅ Apply preset to compression
- ✅ Delete custom preset
- ✅ Default presets available
- ✅ Persist presets across sessions
- ✅ Show preset details

### 4. History (`04-history.spec.ts`)
- ✅ Display compression history
- ✅ Show correct file sizes (NOT "NaN undefined")
- ✅ Show compression statistics
- ✅ View history item details
- ✅ Delete individual items
- ✅ Clear all history
- ✅ Persist history after navigation
- ✅ Show batch compression entries
- ✅ Search/filter history

## Running Tests

### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add test images**:
   Place test images in `tests/e2e/fixtures/test-images/`:
   - `small.jpg` (100KB)
   - `medium.png` (1MB)
   - `large.jpg` (5MB)
   - `batch-1.jpg` through `batch-5.jpg`
   - `invalid.txt` (for error testing)

3. **Ensure the app is built**:
   ```bash
   npm run build
   ```

### Running All Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# View test report after run
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run only batch processing tests
npx playwright test tests/e2e/specs/02-batch-processing.spec.ts

# Run a specific test
npx playwright test -g "should display correct file sizes"

# Run tests for a specific feature
npx playwright test --grep "batch|Batch"
```

## Test Results

### Success Criteria

Each test validates:
- ✅ **Functionality**: Feature works as designed
- ✅ **Data Accuracy**: No "0 Bytes", "NaN", or "undefined"
- ✅ **UI Correctness**: Elements display properly
- ✅ **Performance**: Operations complete in reasonable time
- ✅ **Error Handling**: Graceful failure recovery

### Output Locations

- **HTML Report**: `tests/test-results/html/index.html`
- **JSON Results**: `tests/test-results/results.json`
- **Screenshots**: `tests/screenshots/`
- **Videos**: `tests/videos/` (on failure)
- **Traces**: `tests/test-results/` (for debugging)

## Validation Process

Before claiming any feature is complete:

1. **Write the test first** (TDD approach)
2. **Run test** - verify it fails
3. **Implement the feature**
4. **Run test** - verify it passes
5. **Run full suite** - ensure no regressions
6. **Check console** - no errors allowed
7. **Review screenshots** - visual validation

## Common Issues & Solutions

### Issue: "0 Bytes" file sizes
**Test**: `should display correct file sizes (not 0 Bytes)`
**Solution**: Ensure `getFileStats` API is properly implemented

### Issue: Batch processing shows 4/5 completed
**Test**: `should process all files completely (5/5 not 4/5)`
**Solution**: Check progress event handling and item status updates

### Issue: "NaN undefined" in history
**Test**: `should display correct file sizes (not NaN undefined)`
**Solution**: Verify data flow from compression to history storage

## Adding New Tests

### 1. Create new test file:
```typescript
// tests/e2e/specs/05-new-feature.spec.ts
import { test, expect } from '../fixtures/electron-app';
import { TestHelpers } from '../fixtures/test-helpers';

test.describe('New Feature', () => {
  // Your tests here
});
```

### 2. Use helpers for common tasks:
```typescript
// Navigate to view
await helpers.navigateToView('single');

// Upload files
await helpers.dragAndDropFiles(dropZone, filePaths);

// Check for errors
const errors = await helpers.checkForConsoleErrors();

// Take screenshot
await helpers.screenshot('feature-working');
```

### 3. Always validate:
- No console errors
- No invalid text (NaN, undefined)
- Feature actually works
- Data persists correctly

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tests/test-results/
```

## Evidence of Quality

When tests pass, you have:
- ✅ **Screenshots** proving UI works
- ✅ **Console logs** showing no errors
- ✅ **Test report** with all tests green
- ✅ **Performance metrics** within limits
- ✅ **Data validation** passing all checks

This comprehensive testing ensures features work correctly before release.
