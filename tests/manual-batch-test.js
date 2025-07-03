// Manual test script to verify batch processing issues
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../src/preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/renderer/index.html'));
  }

  // Open DevTools
  mainWindow.webContents.openDevTools();

  // When page loads, run tests
  mainWindow.webContents.on('did-finish-load', async () => {
    console.log('App loaded, running batch tests...\n');

    // Test 1: Navigate to batch view
    await mainWindow.webContents.executeJavaScript(`
      window.location.hash = '/batch';
      console.log('✅ Navigated to batch view');
    `);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Check if dropzone exists
    const hasDropzone = await mainWindow.webContents.executeJavaScript(`
      const dropzone = document.querySelector('[data-testid="batch-dropzone"], .chakra-center:has-text("Drag")');
      const exists = !!dropzone;
      console.log(exists ? '✅ Dropzone found' : '❌ Dropzone NOT found');
      exists;
    `);

    // Test 3: Check file upload (you need to manually drag files)
    console.log('\n📋 MANUAL TEST REQUIRED:');
    console.log('1. Drag 5 image files to the batch area');
    console.log('2. Check if file sizes show correctly (NOT "0 Bytes")');
    console.log('3. Click "Start Batch"');
    console.log('4. Verify all 5 files complete (NOT 4/5)');
    console.log('5. Check history tab for "NaN undefined" issues\n');

    // Monitor console for errors
    mainWindow.webContents.on('console-message', (event, level, message) => {
      if (level === 3) { // Error level
        console.error('❌ Console Error:', message);
      }
    });

    // Add test helpers
    await mainWindow.webContents.executeJavaScript(`
      // Helper to check batch stats
      window.checkBatchStats = () => {
        const stats = document.querySelector('[data-testid="batch-stats"]');
        if (!stats) {
          console.log('❌ No batch stats found');
          return;
        }
        
        const total = document.querySelector('[data-testid="total-images"]')?.textContent;
        const completed = document.querySelector('[data-testid="completed-images"]')?.textContent;
        
        console.log('Batch Stats:');
        console.log('  Total:', total || 'NOT FOUND');
        console.log('  Completed:', completed || 'NOT FOUND');
        
        if (total === completed && total !== '0') {
          console.log('✅ All files completed!');
        } else {
          console.log('❌ Not all files completed');
        }
      };

      // Helper to check for invalid text
      window.checkForInvalidText = () => {
        const bodyText = document.body.textContent;
        const issues = [];
        
        if (bodyText.includes('0 Bytes')) issues.push('0 Bytes');
        if (bodyText.includes('NaN')) issues.push('NaN');
        if (bodyText.includes('undefined')) issues.push('undefined');
        
        if (issues.length > 0) {
          console.log('❌ Found invalid text:', issues.join(', '));
          return false;
        }
        
        console.log('✅ No invalid text found');
        return true;
      };

      console.log('Test helpers added:');
      console.log('- window.checkBatchStats()');
      console.log('- window.checkForInvalidText()');
    `);
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
