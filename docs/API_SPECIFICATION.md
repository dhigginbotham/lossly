# 🔌 Lossly API Specification

## Base URL
```
http://localhost:3001/api
```

## Headers
All requests should include:
```
Content-Type: application/json (for JSON payloads)
Content-Type: multipart/form-data (for file uploads)
```

---

## 📸 Compression Endpoints

### POST /api/compress
Compress a single image with specified settings.

**Request:**
```
Content-Type: multipart/form-data

Body:
- image: File (required) - The image file to compress
- settings: JSON string (required) - Compression settings

Settings JSON structure:
{
  "quality": 85,              // 0-100
  "format": "jpeg",           // jpeg, jpg, png, svg, gif, webp
  "resize": {
    "width": 1920,           // optional
    "height": 1080,          // optional
    "maintainAspectRatio": true
  },
  "advanced": {
    "progressive": true,      // JPEG only
    "interlaced": false,      // PNG/GIF only
    "optimizationLevel": 3,   // PNG: 0-7
    "colors": 256,           // GIF/PNG color reduction
    "stripMetadata": true,
    "mozjpeg": true,         // Use mozjpeg encoder
    "compressionLevel": 9     // PNG: 0-9
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalSize": 2458624,
    "compressedSize": 458624,
    "compressionRatio": 0.813,
    "savingsPercentage": 81.3,
    "originalDimensions": {
      "width": 3840,
      "height": 2160
    },
    "compressedDimensions": {
      "width": 1920,
      "height": 1080
    },
    "format": "jpeg",
    "url": "/api/download/temp_12345.jpg",
    "previewUrl": "/api/preview/temp_12345.jpg",
    "processingTime": 234  // milliseconds
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "The uploaded file is not a valid image",
    "details": "Supported formats: JPEG, PNG, GIF, SVG, WEBP"
  }
}
```

---

### POST /api/convert
Convert an image from one format to another.

**Request:**
```
Content-Type: multipart/form-data

Body:
- image: File (required) - The image file to convert
- targetFormat: String (required) - Target format
- compressionSettings: JSON string (optional) - Same as compress endpoint
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalFormat": "webp",
    "targetFormat": "jpeg",
    "originalSize": 1458624,
    "convertedSize": 858624,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "url": "/api/download/converted_12345.jpg",
    "previewUrl": "/api/preview/converted_12345.jpg",
    "processingTime": 456
  }
}
```

---

## 📦 Batch Processing Endpoints

### POST /api/batch/create
Create a new batch operation.

**Request:**
```json
{
  "name": "Vacation Photos Optimization",
  "settings": {
    "quality": 85,
    "format": "jpeg",
    "resize": {
      "maxWidth": 1920,
      "maxHeight": 1920,
      "maintainAspectRatio": true
    }
  },
  "outputOptions": {
    "namingPattern": "{original}_compressed",
    "outputDirectory": "./output",
    "createSubfolders": true,
    "overwriteExisting": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_550e8400-e29b-41d4-a716-446655440000",
    "name": "Vacation Photos Optimization",
    "status": "created",
    "createdAt": "2025-06-30T14:00:00Z",
    "settings": { /* ... */ },
    "totalFiles": 0,
    "processedFiles": 0
  }
}
```

---

### POST /api/batch/:batchId/add-files
Add files to an existing batch.

**Request:**
```
Content-Type: multipart/form-data

Body:
- files: File[] (required) - Multiple image files
- customSettings: JSON string (optional) - Override batch settings for these files
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_550e8400-e29b-41d4-a716-446655440000",
    "filesAdded": 25,
    "totalFiles": 25,
    "rejectedFiles": [
      {
        "filename": "document.pdf",
        "reason": "Unsupported file format"
      }
    ]
  }
}
```

---

### POST /api/batch/:batchId/process
Start processing a batch operation.

**Request:**
```json
{
  "concurrency": 4,  // Number of parallel workers (optional, default: CPU cores - 1)
  "priority": "normal"  // "low", "normal", "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "startedAt": "2025-06-30T14:05:00Z",
    "estimatedCompletionTime": "2025-06-30T14:07:30Z",
    "websocketUrl": "ws://localhost:3001/batch/batch_550e8400/progress"
  }
}
```

---

### GET /api/batch/:batchId/status
Get the current status of a batch operation.

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_550e8400-e29b-41d4-a716-446655440000",
    "name": "Vacation Photos Optimization",
    "status": "processing",  // "created", "queued", "processing", "completed", "failed", "cancelled"
    "totalFiles": 25,
    "processedFiles": 18,
    "failedFiles": 1,
    "progress": 72,  // percentage
    "currentFile": "IMG_2847.jpg",
    "startedAt": "2025-06-30T14:05:00Z",
    "estimatedTimeRemaining": 45,  // seconds
    "results": {
      "totalOriginalSize": 125829120,  // bytes
      "totalCompressedSize": 31457280,
      "averageCompressionRatio": 0.75,
      "processingSpeed": 2.5  // files per second
    },
    "errors": [
      {
        "filename": "IMG_2833.jpg",
        "error": "Corrupted image file",
        "timestamp": "2025-06-30T14:06:15Z"
      }
    ]
  }
}
```

---

### DELETE /api/batch/:batchId
Cancel a batch operation.

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled",
    "processedFiles": 18,
    "cancelledAt": "2025-06-30T14:06:30Z"
  }
}
```

---

### GET /api/batch/:batchId/results
Get the results of a completed batch operation.

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "summary": {
      "totalFiles": 25,
      "successfulFiles": 24,
      "failedFiles": 1,
      "totalOriginalSize": 125829120,
      "totalCompressedSize": 31457280,
      "totalSavings": 94371840,
      "averageCompressionRatio": 0.75,
      "processingTime": 150000  // milliseconds
    },
    "files": [
      {
        "filename": "IMG_2831.jpg",
        "originalSize": 5242880,
        "compressedSize": 1310720,
        "compressionRatio": 0.75,
        "status": "success",
        "downloadUrl": "/api/download/batch_550e8400/IMG_2831_compressed.jpg"
      },
      // ... more files
    ]
  }
}
```

---

## 🎨 Preset Management Endpoints

### GET /api/presets
Get all saved presets.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Web Optimized",
      "description": "Best for web upload with good quality",
      "settings": {
        "quality": 85,
        "format": "jpeg",
        "resize": {
          "maxWidth": 1920
        },
        "advanced": {
          "progressive": true,
          "stripMetadata": true
        }
      },
      "createdAt": "2025-06-01T10:00:00Z",
      "updatedAt": "2025-06-15T14:30:00Z",
      "usageCount": 45
    },
    {
      "id": 2,
      "name": "Email Attachment",
      "description": "Reduce file size for email",
      "settings": {
        "quality": 70,
        "format": "jpeg",
        "resize": {
          "maxWidth": 1024
        }
      },
      "createdAt": "2025-06-05T09:00:00Z",
      "updatedAt": "2025-06-05T09:00:00Z",
      "usageCount": 23
    }
  ]
}
```

---

### POST /api/presets
Create a new preset.

**Request:**
```json
{
  "name": "Social Media Square",
  "description": "Perfect square for Instagram",
  "settings": {
    "quality": 90,
    "format": "jpeg",
    "resize": {
      "width": 1080,
      "height": 1080,
      "maintainAspectRatio": false
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Social Media Square",
    "description": "Perfect square for Instagram",
    "settings": { /* ... */ },
    "createdAt": "2025-06-30T14:10:00Z",
    "updatedAt": "2025-06-30T14:10:00Z"
  }
}
```

---

### PUT /api/presets/:id
Update an existing preset.

**Request:**
```json
{
  "name": "Social Media Square HD",
  "settings": {
    "quality": 95,
    "format": "jpeg",
    "resize": {
      "width": 2160,
      "height": 2160
    }
  }
}
```

---

### DELETE /api/presets/:id
Delete a preset.

**Response:**
```json
{
  "success": true,
  "message": "Preset deleted successfully"
}
```

---

## 📊 History Endpoints

### GET /api/history
Get compression history with pagination.

**Query Parameters:**
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- sortBy: string (default: "createdAt")
- order: "asc" | "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 145,
        "filename": "vacation_sunset.jpg",
        "originalSize": 4718592,
        "compressedSize": 943718,
        "compressionRatio": 0.8,
        "settings": {
          "quality": 85,
          "format": "jpeg"
        },
        "batchId": null,
        "createdAt": "2025-06-30T13:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    }
  }
}
```

---

## 🔄 WebSocket Events

### Batch Progress WebSocket
Connect to: `ws://localhost:3001/batch/{batchId}/progress`

**Events from server:**
```json
// Progress update
{
  "type": "progress",
  "data": {
    "processedFiles": 15,
    "totalFiles": 25,
    "currentFile": "IMG_2841.jpg",
    "percentage": 60,
    "estimatedTimeRemaining": 30
  }
}

// File completed
{
  "type": "fileCompleted",
  "data": {
    "filename": "IMG_2840.jpg",
    "originalSize": 5242880,
    "compressedSize": 1048576,
    "compressionRatio": 0.8,
    "processingTime": 1234
  }
}

// Error
{
  "type": "error",
  "data": {
    "filename": "IMG_2842.jpg",
    "error": "Failed to process: Invalid image data"
  }
}

// Batch completed
{
  "type": "completed",
  "data": {
    "totalProcessed": 24,
    "totalFailed": 1,
    "totalTime": 150000
  }
}
```

---

## 🚨 Error Codes

| Code                     | Description                            | HTTP Status |
| ------------------------ | -------------------------------------- | ----------- |
| INVALID_IMAGE            | Uploaded file is not a valid image     | 400         |
| UNSUPPORTED_FORMAT       | Image format not supported             | 400         |
| FILE_TOO_LARGE           | File exceeds maximum size limit (50MB) | 413         |
| BATCH_NOT_FOUND          | Batch ID does not exist                | 404         |
| BATCH_ALREADY_PROCESSING | Batch is already being processed       | 409         |
| PRESET_NAME_EXISTS       | Preset with this name already exists   | 409         |
| INSUFFICIENT_MEMORY      | Not enough memory to process image     | 507         |
| WORKER_TIMEOUT           | Worker thread timed out                | 504         |
| INTERNAL_ERROR           | Unexpected server error                | 500         |
