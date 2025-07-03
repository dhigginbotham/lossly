# How to Actually Test the Batch Processing Issues

## Current Issues to Verify

1. **File sizes showing as "0 Bytes"**
2. **Batch processing only completing 4/5 files**
3. **History showing "NaN undefined"**

## Manual Testing Steps (Do This Now)

### Step 1: Test File Sizes
1. Make sure `npm run dev` is running
2. Open the app in your browser/Electron window
3. Go to the Batch tab
4. Drag 5 images from your Desktop to the batch area
5. **CHECK**: Do the file sizes show actual values (e.g., "2.5 MB") or "0 Bytes"?
   - ✅ PASS: Shows "2.5 MB", "156 KB", etc.
   - ❌ FAIL: Shows "0 Bytes"

### Step 2: Test Batch Completion
1. Click "Start Batch" button
2. Wait for processing to complete
3. **CHECK**: Look at the stats at the top
   - ✅ PASS: Shows "Total Images: 5" and "Completed: 5"
   - ❌ FAIL: Shows "Total Images: 5" and "Completed: 4"

### Step 3: Test History Display
1. Go to the History tab
2. Look at the file entries
3. **CHECK**: Do file sizes display correctly?
   - ✅ PASS: Shows "Original: 2.5 MB" and "Compressed: 1.8 MB"
   - ❌ FAIL: Shows "NaN undefined" or similar

## Quick Console Tests

Open DevTools (F12) and run these in the Console while on the Batch page:

```javascript
// Check if file sizes are correct
Array.from(document.querySelectorAll('td')).forEach(td => {
  if (td.textContent.includes('0 Bytes')) {
    console.error('❌ Found "0 Bytes":', td);
  }
});

// Check batch stats after processing
const total = document.querySelector('[data-testid="total-images"]')?.textContent;
const completed = document.querySelector('[data-testid="completed-images"]')?.textContent;
console.log('Total:', total, 'Completed:', completed);
if (total === completed) {
  console.log('✅ All files completed');
} else {
  console.error('❌ Not all files completed');
}

// Check for NaN/undefined
if (document.body.textContent.includes('NaN') || document.body.textContent.includes('undefined')) {
  console.error('❌ Found NaN or undefined on page');
} else {
  console.log('✅ No NaN/undefined found');
}
```

## Run the Manual Test Helper

```bash
# This opens a test instance with helpers
npx electron tests/manual-batch-test.js

# Or on Windows, double-click:
test-batch-issues.bat
```

This will:
- Open the app with DevTools
- Navigate to batch view automatically
- Add helper functions you can run in console

## What to Report Back

Tell me:
1. **File Sizes**: Do they show correctly or as "0 Bytes"?
2. **Batch Completion**: Does it complete 5/5 or stop at 4/5?
3. **History**: Does it show proper sizes or "NaN undefined"?

Based on your results, I can fix the ACTUAL issues instead of guessing.
