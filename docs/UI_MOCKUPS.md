# 🎨 Lossly UI Mockups & Component Specifications

## 🖼️ Main Application Window

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ Lossly - Image Compression Made Beautiful                              [─][□][×] │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬──────────────────────────────────────────────┬─────────────────────┐│
│ │             │                                              │                     ││
│ │  [📁 Files] │          🎯 Drop Zone / Image Viewer        │   ⚙️ Settings Panel ││
│ │  [📦 Batch] │                                              │                     ││
│ │  [📊 History]│  ┌────────────────────────────────────────┐ │ Format: [JPEG ▼]   ││
│ │  [🎨 Presets]│  │                                        │ │                     ││
│ │             │  │    Drop images here or click to browse  │ │ Quality: ████░░ 85% ││
│ │             │  │                                        │ │                     ││
│ │   Recent:   │  │         [📷]  [➕]  [📁]               │ │ [🔧 Advanced ▼]     ││
│ │             │  │                                        │ │                     ││
│ │  IMG_001.jpg│  │    Supports: JPG, PNG, GIF, WEBP, SVG │ │ □ Progressive       ││
│ │  photo_2.png│  │                                        │ │ □ Strip Metadata    ││
│ │  banner.webp│  └────────────────────────────────────────┘ │ □ Optimize          ││
│ │             │                                              │                     ││
│ │             │  Status: Ready                               │ [💾 Save Settings]  ││
│ └─────────────┴──────────────────────────────────────────────┴─────────────────────┘│
│ ┌───────────────────────────────────────────────────────────────────────────────────┐│
│ │ Status Bar: Ready to compress • CPU: 15% • Memory: 2.1GB • Queue: Empty           ││
│ └───────────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Specifications:

**1. Navigation Sidebar (Left)**
- Width: 200px
- Dark purple gradient background
- Icons with labels
- Hover effects with cyan accent
- Recent files list with thumbnails

**2. Main Content Area (Center)**
- Flexible width
- Drop zone with dashed border animation
- Drag hover state with glow effect
- File type badges

**3. Settings Panel (Right)**
- Width: 300px
- Collapsible sections
- Real-time value updates
- Tooltips on hover

---

## 🔍 Image Comparison View

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🖼️ Image Comparison - sunset_photo.jpg                                   [─][□][×] │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────────────────────┐│
│ │ [Original]  [Compressed]  [Difference]  [Side by Side]             🔍 Zoom: 100% ││
│ └───────────────────────────────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────┬|┬───────────────────────────────────────────┐│
│ │                                     │|│                                           ││
│ │                                     │|│                                           ││
│ │          ORIGINAL IMAGE             │|│         COMPRESSED IMAGE                ││
│ │                                     │|│                                           ││
│ │         (sunset_photo.jpg)          │|│      (sunset_photo_compressed.jpg)      ││
│ │                                     │◄►                                          ││
│ │           3840 x 2160               │|│            3840 x 2160                  ││
│ │             4.2 MB                  │|│              892 KB                     ││
│ │                                     │|│                                           ││
│ │                                     │|│                                           ││
│ │                                     │|│                                           ││
│ └─────────────────────────────────────┴─┴───────────────────────────────────────────┘│
│ ┌───────────────────────────────────────────────────────────────────────────────────┐│
│ │ Compression: 78.8% reduction • Quality: 85% • Format: JPEG • Time: 234ms          ││
│ │ [💾 Save] [📋 Copy Settings] [🔄 Try Different Settings] [❌ Discard]              ││
│ └───────────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements:

**Draggable Divider (|◄►|)**
- Vertical line with handle
- Smooth drag animation
- Snap to center option
- Preview percentage on drag

**View Modes:**
- Side by Side (default)
- Original only
- Compressed only
- Difference map (highlights changes)

**Zoom Controls:**
- Synchronized zoom/pan
- Fit to window
- 1:1 pixel view
- Custom zoom levels

---

## 📦 Batch Processing Interface

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 📦 Batch Processing - Vacation Photos (25 files)                         [─][□][×] │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┬─────────────────────────────────────────────────┐│
│ │ Queue Management                │ Batch Settings                                  ││
│ ├─────────────────────────────────┼─────────────────────────────────────────────────┤│
│ │ ┌─────────────────────────────┐ │ Preset: [Web Optimized ▼]    [➕ Save as New]  ││
│ │ │ [□] Select All   [🗑️] Clear │ │                                                 ││
│ │ └─────────────────────────────┘ │ Output Format: [Same as Original ▼]            ││
│ │                                 │                                                 ││
│ │ ┌─────────────────────────────┐ │ Quality: ██████░░░░ 85%                        ││
│ │ │ ☑ IMG_001.jpg   4.2MB  [🗑️] │ │                                                 ││
│ │ │ ☑ IMG_002.jpg   3.8MB  [🗑️] │ │ Resize:  □ Enable                              ││
│ │ │ ☑ IMG_003.jpg   5.1MB  [🗑️] │ │          Max Width:  [1920] px                 ││
│ │ │ ☑ IMG_004.jpg   2.9MB  [🗑️] │ │          Max Height: [1080] px                 ││
│ │ │ ☐ IMG_005.png   8.2MB  [🗑️] │ │                                                 ││
│ │ │ ☑ IMG_006.jpg   3.5MB  [🗑️] │ │ Output Options:                                ││
│ │ │ ↓ ... 19 more files      ↓ │ │ Pattern: [{name}_compressed]                   ││
│ │ └─────────────────────────────┘ │ │ Folder:  [./compressed/]        [Browse]       ││
│ │                                 │ │                                                 ││
│ │ Total: 94.3 MB (21 selected)   │ │ ☑ Create subfolder with timestamp              ││
│ └─────────────────────────────────┴─────────────────────────────────────────────────┘│
│ ┌───────────────────────────────────────────────────────────────────────────────────┐│
│ │                          Processing Progress                                       ││
│ ├───────────────────────────────────────────────────────────────────────────────────┤│
│ │ Overall: ████████████████░░░░░░░░░░░░░░░░░░░░ 45% (9/20 files)                   ││
│ │ Current: IMG_010.jpg ██████████░░░░░░░░░░░░░░ 65%                                ││
│ │                                                                                    ││
│ │ Speed: 2.3 files/sec • Time Elapsed: 00:03:52 • Time Remaining: ~00:04:30         ││
│ │                                                                                    ││
│ │ [▶️ Start] [⏸️ Pause] [⏹️ Stop] [📊 View Report]           Workers: [4 ▼] threads ││
│ └───────────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Batch Features:

**Queue List**
- Checkbox selection
- Drag to reorder
- Individual file removal
- File size indicators
- Format icons

**Progress Visualization**
- Overall progress bar
- Per-file progress
- Real-time statistics
- ETA calculation

**Smart Controls**
- Pause/Resume capability
- Dynamic worker adjustment
- Priority queue option

---

## ⚙️ Settings Panel (Expanded View)

```
┌─────────────────────────────────────┐
│ ⚙️ Compression Settings             │
├─────────────────────────────────────┤
│ Format                              │
│ ┌───────────────────────────────┐   │
│ │ ○ Keep Original                │   │
│ │ ● JPEG/JPG                     │   │
│ │ ○ PNG                          │   │
│ │ ○ WebP                         │   │
│ │ ○ GIF                          │   │
│ └───────────────────────────────┘   │
│                                     │
│ Quality                             │
│ Low ░░░░████████░░░░ High           │
│     0%    85%    100%               │
│ [ℹ️ Higher quality = larger files]   │
│                                     │
│ ▼ Resize Options                    │
│ ┌───────────────────────────────┐   │
│ │ ☑ Maintain aspect ratio        │   │
│ │ Max Width:  [1920] px          │   │
│ │ Max Height: [    ] px          │   │
│ │ ○ Exact dimensions             │   │
│ │ ○ Percentage: [100]%           │   │
│ └───────────────────────────────┘   │
│                                     │
│ ▼ Advanced Options                  │
│ ┌───────────────────────────────┐   │
│ │ JPEG Options:                  │   │
│ │ ☑ Progressive encoding [?]     │   │
│ │ ☑ Optimize Huffman tables      │   │
│ │ Chroma subsampling: [4:2:0 ▼]  │   │
│ │                                │   │
│ │ PNG Options:                   │   │
│ │ ☑ Interlaced (Adam7) [?]      │   │
│ │ Compression: ████░░░░ (9)      │   │
│ │ Filter: [Auto ▼]               │   │
│ │                                │   │
│ │ General:                       │   │
│ │ ☑ Strip metadata [?]           │   │
│ │ ☑ Strip color profile          │   │
│ │ ☐ Convert to sRGB             │   │
│ └───────────────────────────────┘   │
│                                     │
│ [💾 Save as Preset] [🔄 Reset]      │
└─────────────────────────────────────┘
```

### Interactive Elements:

**Tooltips [?]**
- Hover for detailed explanations
- Examples of use cases
- Performance impact warnings

**Dynamic Updates**
- Real-time preview updates
- Estimated file size display
- Format-specific options

---

## 🎨 Preset Manager Modal

```
┌─────────────────────────────────────────────────────────────┐
│ 🎨 Preset Manager                                    [×]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Your Presets                          [➕ Create New]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🌐 Web Optimized                              ⭐ 45x │   │
│ │ Quality: 85% • Format: JPEG • Max: 1920px            │   │
│ │ Perfect for website images with good quality         │   │
│ │ [Apply] [Edit] [Duplicate] [Delete]                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📧 Email Attachment                           ⭐ 23x │   │
│ │ Quality: 70% • Format: JPEG • Max: 1024px            │   │
│ │ Reduce file size for email compatibility             │   │
│ │ [Apply] [Edit] [Duplicate] [Delete]                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📱 Social Media Square                        ⭐ 18x │   │
│ │ Quality: 90% • Format: JPEG • Size: 1080x1080        │   │
│ │ Instagram-ready square format                        │   │
│ │ [Apply] [Edit] [Duplicate] [Delete]                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Import/Export: [📥 Import JSON] [📤 Export All]            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌈 Chakra UI Theme Elements

### Color Palette
```
Primary Gradient:   ████████ #6B46C1 → #9F7AEA
Accent:            ████████ #00BCD4 (Cyan)
Success:           ████████ #10B981 (Emerald)
Warning:           ████████ #F59E0B (Amber)
Error:             ████████ #EF4444 (Red)
Background:        ████████ #1A202C (Dark)
Surface:           ████████ #2D3748 (Elevated)
Text Primary:      ████████ #F7FAFC
Text Secondary:    ████████ #A0AEC0
```

### Visual Effects
- **Glassmorphism**: Semi-transparent surfaces with backdrop blur
- **Smooth Animations**: 200ms transitions on all interactive elements
- **Hover States**: Subtle scale and glow effects
- **Focus Indicators**: Cyan ring for accessibility
- **Loading States**: Skeleton screens and progress indicators

### Typography
- **Headings**: Inter or system-ui, bold
- **Body**: Inter or system-ui, regular
- **Monospace**: Fira Code for file names and technical info

### Component Styling
- **Buttons**: Rounded corners, gradient backgrounds, hover lift
- **Inputs**: Dark backgrounds, subtle borders, focus glow
- **Cards**: Elevated surfaces with soft shadows
- **Modals**: Centered with dark overlay, smooth entry animation
