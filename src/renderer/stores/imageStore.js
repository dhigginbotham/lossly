import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useImageStore = create(
  devtools(
    (set) => ({
      // Current image being processed
      currentImage: null,
      compressedImage: null,
      compressionStats: null,

      // Actions
      setCurrentImage: (image) =>
        set(() => ({
          currentImage: image,
          compressedImage: null,
          compressionStats: null,
        })),

      setCompressedImage: (image) =>
        set(() => ({
          compressedImage: image,
        })),

      setCompressionStats: (stats) =>
        set(() => ({
          compressionStats: stats,
        })),

      clearImages: () =>
        set(() => ({
          currentImage: null,
          compressedImage: null,
          compressionStats: null,
        })),

      // Update current image metadata
      updateCurrentImage: (updates) =>
        set((state) => ({
          currentImage: state.currentImage
            ? { ...state.currentImage, ...updates }
            : null,
        })),

      // Update compressed image metadata
      updateCompressedImage: (updates) =>
        set((state) => ({
          compressedImage: state.compressedImage
            ? { ...state.compressedImage, ...updates }
            : null,
        })),
    }),
    {
      name: 'image-store',
    }
  )
);

export { useImageStore };
