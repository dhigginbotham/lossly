import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  useColorModeValue,
  Flex,
  Center,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FiUploadCloud, FiImage, FiFolder, FiPlus } from 'react-icons/fi';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { ImageComparator } from '../compression/ImageComparator';
import { CompressionSettings } from '../compression/CompressionSettings';
import { useImageStore } from '../../stores/imageStore';
import { useAppStore } from '../../stores/appStore';

export function DragDropView () {
  const bgColor = useColorModeValue('white', 'surface.700');
  const borderColor = useColorModeValue('surface.200', 'surface.600');
  const dragActiveBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const { originalImage, compressedImage, loadImage } = useImageStore();
  const { addNotification } = useAppStore();

  const handleFileDrop = useCallback(async (files) => {
    if (files.length === 0) return;

    if (files.length > 1) {
      addNotification({
        type: 'info',
        title: 'Multiple files detected',
        message: 'Switch to Batch mode to process multiple files',
        duration: 5000,
      });
      // Load the first file only
    }

    try {
      await loadImage(files[0]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load image',
        message: error.message,
        duration: 5000,
      });
    }
  }, [loadImage, addNotification]);

  const { isDragging, dragHandlers } = useDragAndDrop(handleFileDrop);

  const handleBrowseClick = async () => {
    const result = await window.electron.showOpenDialog();
    if (!result.canceled && result.filePaths.length > 0) {
      const file = new File([result.filePaths[0]], result.filePaths[0]);
      handleFileDrop([file]);
    }
  };

  return (
    <Grid
      templateColumns={{ base: '1fr', lg: '1fr 300px' }}
      h="full"
      gap={0}
    >
      {/* Main Content Area */}
      <GridItem>
        <Box h="full" p={6} overflow="auto">
          {!originalImage ? (
            // Drop Zone
            <Center h="full">
              <Box
                w="full"
                maxW="600px"
                h="400px"
                bg={isDragging ? dragActiveBg : bgColor}
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={isDragging ? 'brand.400' : borderColor}
                borderRadius="xl"
                transition="all 0.2s"
                cursor="pointer"
                onClick={handleBrowseClick}
                {...dragHandlers}
                className={isDragging ? 'drag-active' : ''}
              >
                <Center h="full">
                  <VStack spacing={4}>
                    <Icon
                      as={FiUploadCloud}
                      boxSize={16}
                      color={isDragging ? 'brand.400' : 'surface.400'}
                      transition="all 0.2s"
                    />
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="medium">
                        Drop images here or click to browse
                      </Text>
                      <Text fontSize="sm" color="surface.500">
                        Supports: JPG, PNG, GIF, WEBP, SVG
                      </Text>
                    </VStack>
                    <HStack spacing={4} mt={4}>
                      <Button
                        leftIcon={<FiImage />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBrowseClick();
                        }}
                      >
                        Browse Files
                      </Button>
                      <Button
                        leftIcon={<FiFolder />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement folder selection
                        }}
                      >
                        Select Folder
                      </Button>
                    </HStack>
                  </VStack>
                </Center>
              </Box>
            </Center>
          ) : (
            // Image Comparison View
            <VStack h="full" spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xl" fontWeight="bold">
                  {originalImage.name}
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  size="sm"
                  variant="outline"
                  onClick={handleBrowseClick}
                >
                  New Image
                </Button>
              </HStack>

              <Box flex={1} minH={0}>
                <ImageComparator />
              </Box>
            </VStack>
          )}
        </Box>
      </GridItem>

      {/* Settings Panel */}
      <GridItem
        borderLeftWidth="1px"
        borderColor={borderColor}
        bg={bgColor}
      >
        <CompressionSettings />
      </GridItem>
    </Grid>
  );
}
