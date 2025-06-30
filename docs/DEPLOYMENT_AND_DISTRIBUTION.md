# 🚀 Deployment & Distribution Guide

## 📋 Overview

This guide covers the complete deployment pipeline for Lossly, from building production-ready binaries to distributing through various channels with auto-update capabilities.

## 🏗️ Build Configuration

### 1. Electron Builder Setup

```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.lossly.app',
  productName: 'Lossly',
  directories: {
    output: 'dist',
    buildResources: 'build'
  },
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  extraResources: [
    {
      from: 'resources',
      to: 'resources'
    }
  ],
  
  // Windows Configuration
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'build/icon.ico',
    certificateFile: process.env.WINDOWS_CERT_FILE,
    certificatePassword: process.env.WINDOWS_CERT_PASSWORD,
    publisherName: 'Lossly Inc.',
    verifyUpdateCodeSignature: true
  },
  
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    include: 'build/installer.nsh'
  },
  
  // macOS Configuration
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'build/icon.icns',
    category: 'public.app-category.photography',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    notarize: {
      teamId: process.env.APPLE_TEAM_ID
    }
  },
  
  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    },
    background: 'build/dmg-background.png'
  },
  
  // Linux Configuration
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64', 'arm64']
      },
      {
        target: 'deb',
        arch: ['x64', 'arm64']
      },
      {
        target: 'snap',
        arch: ['x64']
      }
    ],
    icon: 'build/icons',
    category: 'Graphics',
    description: 'Beautiful image compression with real-time preview',
    desktop: {
      StartupNotify: 'true',
      Encoding: 'UTF-8',
      MimeType: 'image/jpeg;image/png;image/gif;image/webp'
    }
  },
  
  // Auto Update Configuration
  publish: [
    {
      provider: 'github',
      owner: 'lossly',
      repo: 'lossly-app',
      releaseType: 'release'
    },
    {
      provider: 'generic',
      url: 'https://download.lossly.app',
      channel: 'latest'
    }
  ]
};
```

### 2. Package Scripts

```json
// package.json
{
  "scripts": {
    // Development
    "dev": "concurrently \"npm run dev:main\" \"npm run dev:renderer\"",
    "dev:main": "electron-vite dev --watch",
    "dev:renderer": "vite",
    
    // Building
    "build": "npm run build:main && npm run build:renderer && npm run build:preload",
    "build:main": "electron-vite build",
    "build:renderer": "vite build",
    "build:preload": "electron-vite build --preload",
    
    // Distribution
    "dist": "npm run build && electron-builder",
    "dist:win": "npm run build && electron-builder --win",
    "dist:mac": "npm run build && electron-builder --mac",
    "dist:linux": "npm run build && electron-builder --linux",
    "dist:all": "npm run build && electron-builder -mwl",
    
    // Publishing
    "publish": "npm run build && electron-builder --publish always",
    "publish:win": "npm run build && electron-builder --win --publish always",
    "publish:mac": "npm run build && electron-builder --mac --publish always",
    
    // Validation
    "validate": "npm run validate:security && npm run validate:deps",
    "validate:security": "electron-builder-security-check",
    "validate:deps": "npm audit --production"
  }
}
```

## 🔐 Code Signing

### Windows Code Signing

1. **Obtain Certificate**
   ```bash
   # Purchase from trusted CA:
   # - DigiCert
   # - Sectigo (formerly Comodo)
   # - GlobalSign
   ```

2. **Configure Environment**
   ```bash
   # .env.production
   WINDOWS_CERT_FILE=path/to/certificate.pfx
   WINDOWS_CERT_PASSWORD=your_password
   ```

3. **Sign During Build**
   ```javascript
   // build/sign.js
   exports.default = async function(configuration) {
     // Custom signing logic if needed
     console.log('Signing:', configuration.path);
   };
   ```

### macOS Code Signing & Notarization

1. **Apple Developer Account Setup**
   ```bash
   # Export certificates from Keychain
   security find-identity -v -p codesigning
   
   # Store credentials
   xcrun notarytool store-credentials "AC_PASSWORD" \
     --apple-id "your@email.com" \
     --team-id "TEAMID" \
     --password "app-specific-password"
   ```

2. **Entitlements Configuration**
   ```xml
   <!-- build/entitlements.mac.plist -->
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
     "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>com.apple.security.cs.allow-jit</key>
     <true/>
     <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
     <true/>
     <key>com.apple.security.cs.disable-library-validation</key>
     <true/>
     <key>com.apple.security.files.user-selected.read-write</key>
     <true/>
   </dict>
   </plist>
   ```

## 🔄 Auto-Update System

### 1. Update Server Setup

```javascript
// src/main/updater.js
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class AppUpdater {
  constructor() {
    // Configure logging
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    
    // Configure update channel
    autoUpdater.channel = process.env.UPDATE_CHANNEL || 'latest';
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for updates...');
      this.sendStatusToWindow('checking-for-update');
    });
    
    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.sendStatusToWindow('update-available', info);
    });
    
    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
      this.sendStatusToWindow('update-not-available', info);
    });
    
    autoUpdater.on('error', (err) => {
      log.error('Update error:', err);
      this.sendStatusToWindow('error', err.message);
    });
    
    autoUpdater.on('download-progress', (progress) => {
      const message = `Download speed: ${progress.bytesPerSecond} - 
        Downloaded ${progress.percent}% 
        (${progress.transferred}/${progress.total})`;
      log.info(message);
      this.sendStatusToWindow('download-progress', progress);
    });
    
    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.sendStatusToWindow('update-downloaded', info);
      
      // Show dialog to user
      this.promptUserToUpdate(info);
    });
  }
  
  checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify({
      title: 'Lossly Update Available',
      body: 'A new version of Lossly is available. Click to update.'
    });
  }
  
  promptUserToUpdate(info) {
    const { dialog } = require('electron');
    
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Would you like to update now?`,
      detail: 'The application will restart after updating.',
      buttons: ['Update Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
}
```

### 2. Update Feed Configuration

```yaml
# auto-update.yml
provider: github
owner: lossly
repo: lossly-app
private: false
releaseType: release
updaterCacheDirName: lossly-updater
```

## 📦 Distribution Channels

### 1. Direct Download

```nginx
# nginx.conf for download server
server {
  listen 443 ssl http2;
  server_name download.lossly.app;
  
  ssl_certificate /etc/ssl/certs/lossly.crt;
  ssl_certificate_key /etc/ssl/private/lossly.key;
  
  location /releases/ {
    alias /var/www/releases/;
    autoindex on;
    add_header X-Content-Type-Options nosniff;
    
    # Version-specific redirects
    location ~ ^/releases/latest/(.+)$ {
      return 302 /releases/v1.0.0/$1;
    }
  }
  
  # Update feed
  location /update/ {
    alias /var/www/update/;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

### 2. GitHub Releases

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build & publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          WINDOWS_CERT_FILE: ${{ secrets.WINDOWS_CERT_FILE }}
          WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
        run: npm run publish
```

### 3. Mac App Store

```javascript
// electron-builder-mas.config.js
module.exports = {
  ...require('./electron-builder.config.js'),
  
  mac: {
    ...require('./electron-builder.config.js').mac,
    target: ['mas'],
    bundleId: 'com.lossly.app',
    provisioningProfile: 'build/lossly.provisionprofile'
  },
  
  mas: {
    entitlements: 'build/entitlements.mas.plist',
    entitlementsInherit: 'build/entitlements.mas.inherit.plist',
    hardenedRuntime: false
  }
};
```

### 4. Microsoft Store

```xml
<!-- appx.manifest -->
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10">
  <Identity Name="Lossly.ImageCompressor"
            Version="1.0.0.0"
            Publisher="CN=LosslyInc, O=Lossly Inc., C=US" />
  
  <Properties>
    <DisplayName>Lossly</DisplayName>
    <PublisherDisplayName>Lossly Inc.</PublisherDisplayName>
    <Logo>assets\icon.png</Logo>
  </Properties>
  
  <Applications>
    <Application Id="App"
                 Executable="Lossly.exe"
                 EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="Lossly"
                          Description="Beautiful image compression"
                          Square150x150Logo="assets\icon.png"
                          Square44x44Logo="assets\icon-small.png"
                          BackgroundColor="#1A202C" />
    </Application>
  </Applications>
</Package>
```

## 🧪 Pre-Release Testing

### 1. Beta Channel Setup

```javascript
// src/main/config.js
export const UPDATE_CHANNELS = {
  stable: 'https://download.lossly.app/stable',
  beta: 'https://download.lossly.app/beta',
  nightly: 'https://download.lossly.app/nightly'
};

// Allow users to opt into beta
export function setUpdateChannel(channel) {
  autoUpdater.channel = channel;
  autoUpdater.allowPrerelease = channel !== 'stable';
}
```

### 2. Staged Rollout

```javascript
// Gradual rollout configuration
export function shouldUpdate(currentVersion, newVersion) {
  const rolloutPercentage = getRolloutPercentage(newVersion);
  const userHash = hashUserId(getUserId());
  const threshold = Math.floor(rolloutPercentage * 0xFFFFFFFF / 100);
  
  return userHash <= threshold;
}
```

## 📊 Analytics & Crash Reporting

### 1. Sentry Integration

```javascript
// src/main/sentry.js
import * as Sentry from '@sentry/electron';

export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: app.getVersion(),
    
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
    
    integrations: [
      new Sentry.Integrations.MainProcessSession(),
      new Sentry.Integrations.ChildProcess(),
      new Sentry.Integrations.Net({ breadcrumbs: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection()
    ]
  });
}
```

### 2. Update Analytics

```javascript
// Track update metrics
export function trackUpdateMetrics(event, data) {
  analytics.track({
    userId: getAnonymousUserId(),
    event: `update_${event}`,
    properties: {
      currentVersion: app.getVersion(),
      ...data
    }
  });
}
```

## 🚀 Launch Checklist

### Pre-Launch
- [ ] Code signing certificates ready
- [ ] Auto-update server configured
- [ ] Analytics/crash reporting setup
- [ ] EULA and privacy policy updated
- [ ] App icons for all platforms
- [ ] Screenshots for stores
- [ ] Marketing website ready

### Testing
- [ ] Install/uninstall on all platforms
- [ ] Auto-update from old version
- [ ] File associations working
- [ ] Deep linking functional
- [ ] Performance benchmarks met

### Release
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Git tag created
- [ ] CI/CD pipeline green
- [ ] Binaries uploaded
- [ ] Update feed live
- [ ] Store submissions complete

### Post-Launch
- [ ] Monitor crash reports
- [ ] Track adoption metrics
- [ ] Respond to user feedback
- [ ] Plan next release

## 🆘 Troubleshooting

### Common Issues

1. **Code Signing Failures**
   ```bash
   # Verify certificate
   codesign -dv --verbose=4 Lossly.app
   
   # Check notarization status
   xcrun notarytool history --apple-id YOUR_APPLE_ID
   ```

2. **Auto-Update Not Working**
   ```javascript
   // Enable debug logging
   autoUpdater.logger = require('electron-log');
   autoUpdater.logger.transports.file.level = 'debug';
   ```

3. **Build Failures**
   ```bash
   # Clean build
   rm -rf dist node_modules package-lock.json
   npm install
   npm run dist
   ```

---

This deployment guide ensures smooth distribution of Lossly across all major platforms with professional auto-update capabilities and monitoring.
