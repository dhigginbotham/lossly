import { useCallback } from 'react';
import { useImageStore } from '../stores/imageStore';
import { useAppStore } from '../stores/appStore';
import { useHistoryStore } from '../stores/historyStore';
import { v4 as uuidv4 } from 'uuid';

export function useCompression () {
  const {
    originalImage,
    currentSettings,
    isCompressing,
    startCompression,
    cancelCompression
  } = useImageStore();

  const { addNotification } = useAppStore();
  const { addHistoryItem } = useHistoryStore();

  const compress = useCallback(async () => {
    if (!originalImage) {
      addNotification({
        id: uuidv4(),
        type: 'error',
        title: 'No image loaded',
        message: 'Please select an image to compress',
        duration: 3000,
      });
      return;
    }

    try {
      const result = await startCompression();

      // Add to history
      if (result) {
        addHistoryItem({
          id: uuidv4(),
          filename: originalImage.name,
          originalSize: originalImage.size,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          settings: currentSettings,
          timestamp: Date.now(),
        });

        const savedPercentage = ((1 - result.compressionRatio) * 100).toFixed(1);

        addNotification({
          id: uuidv4(),
          type: 'success',
          title: 'Compression complete',
          message: `Reduced size by ${savedPercentage}% (${result.processingTime}ms)`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Compression error:', error);
      addNotification({
        id: uuidv4(),
        type: 'error',
        title: 'Compression failed',
        message: error.message || 'An unknown error occurred',
        duration: 5000,
      });
    }
  }, [originalImage, currentSettings, startCompression, addHistoryItem, addNotification]);

  return {
    compress,
    cancel: cancelCompression,
    isCompressing,
    canCompress: !!originalImage && !isCompressing,
  };
}
