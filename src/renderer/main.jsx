import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { theme } from './theme/chakraTheme';
import App from './App';
import './styles/global.css';

// Initialize settings on app start
const initializeApp = async () => {
  try {
    // Load settings from backend
    const settingsStore = await import('./stores/settingsStore');
    await settingsStore.useSettingsStore.getState().loadSettings();

    // Load history
    const historyStore = await import('./stores/historyStore');
    await historyStore.useHistoryStore.getState().loadHistory();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Initialize app
initializeApp();

// Render React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// Remove loading screen after app mounts
setTimeout(() => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}, 100);

// Handle app updates - commented out for now as 'on' method is not exposed
// if (window.api) {
//   window.api.on('update-available', () => {
//     console.log('Update available');
//   });

//   window.api.on('update-downloaded', () => {
//     console.log('Update downloaded');
//   });
// }

// Clean up on app close
window.addEventListener('beforeunload', () => {
  // Save any pending changes
  const settingsStore = require('./stores/settingsStore').useSettingsStore.getState();
  settingsStore.saveSettings();
});
