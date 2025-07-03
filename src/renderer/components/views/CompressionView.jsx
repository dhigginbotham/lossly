import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  Progress,
  useToast,
  Center,
  Image,
  Spinner,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Heading,
} from '@chakra-ui/react';
import { FiUpload, FiDownload, FiImage, FiRefreshCw } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageStore } from '../../stores/imageStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useHistoryStore } from '../../stores/historyStore';
import DraggableDivider from '../common/DraggableDivider';
import CompressionSettings from '../common/CompressionSettings';

const MotionBox = motion(Box);

const CompressionView = () => {
  const toast = useToast();
  const [isCompressing, setIsCompressing] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(50);
  const imageContainerRef = useRef(null);

  const {
    currentImage,
    compressedImage,
    compressionStats,
    setCurrentImage,
    setCompressedImage,
    setCompressionStats,
    clearImages,
  } = useImageStore();

  const { compressionSettings } = useSettingsStore();
  const { addToHistory } = useHistoryStore();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setCurrentImage({
        id: Date.now().toString(),
        originalName: file.name,
        originalPath: file.path || file.name,
        originalSize: file.size,
        originalFormat: file.type.split('/')[1],
        previewUrl: imageUrl,
      });

      // Clear previous compressed image
      setCompressedImage(null);
      setCompressionStats(null);
    },
    [setCurrentImage, setCompressedImage, setCompressionStats, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
    },
    multiple: false,
  });

  const handleCompress = async () => {
    if (!currentImage) return;

    setIsCompressing(true);
    try {
      const response = await window.api.compression.compress({
        imagePath: currentImage.originalPath,
        settings: compressionSettings,
      });

      if (response.success) {
        const compressedUrl = `file://${response.data.outputPath}`;
        setCompressedImage({
          ...response.data,
          previewUrl: compressedUrl,
        });
        setCompressionStats(response.data.stats);

        // Add to history
        addToHistory({
          ...currentImage,
          ...response.data,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Compression successful',
          description: `Reduced size by ${response.data.stats.reductionPercentage}%`,
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Compression failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = async () => {
    if (!compressedImage) return;

    try {
      await window.api.compression.saveAs({
        sourcePath: compressedImage.outputPath,
        defaultName: compressedImage.outputName,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <VStack spacing={6} h="full" p={6}>
      {/* Header */}
      <HStack w="full" justify="space-between">
        <Heading size="lg">Image Compression</Heading>
        {currentImage && (
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            variant="ghost"
            onClick={clearImages}
          >
            New Image
          </Button>
        )}
      </HStack>

      {/* Drop zone or image comparison */}
      {!currentImage ? (
        <Center
          {...getRootProps()}
          w="full"
          h="60vh"
          border="2px dashed"
          borderColor={isDragActive ? 'brand.500' : 'whiteAlpha.300'}
          borderRadius="xl"
          bg={isDragActive ? 'whiteAlpha.50' : 'transparent'}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: 'brand.400',
            bg: 'whiteAlpha.50',
          }}
        >
          <input {...getInputProps()} />
          <VStack spacing={4}>
            <Icon as={FiImage} boxSize={16} color="whiteAlpha.500" />
            <Text fontSize="lg" color="whiteAlpha.700">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image, or click to select'}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.500">
              Supports JPEG, PNG, WebP, GIF, and SVG
            </Text>
            <Button
              leftIcon={<Icon as={FiUpload} />}
              colorScheme="brand"
              size="lg"
            >
              Choose Image
            </Button>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={4} w="full" flex={1}>
          {/* Image comparison */}
          <Box
            ref={imageContainerRef}
            position="relative"
            w="full"
            h="50vh"
            borderRadius="xl"
            overflow="hidden"
            bg="blackAlpha.300"
          >
            {/* Original image */}
            <Box
              position="absolute"
              top={0}
              left={0}
              w="full"
              h="full"
              overflow="hidden"
            >
              <Image
                src={currentImage.previewUrl}
                alt="Original"
                objectFit="contain"
                w="full"
                h="full"
              />
              <Badge
                position="absolute"
                top={4}
                left={4}
                colorScheme="gray"
                fontSize="sm"
                px={3}
                py={1}
              >
                Original
              </Badge>
            </Box>

            {/* Compressed image with mask */}
            {compressedImage && (
              <>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="full"
                  h="full"
                  overflow="hidden"
                  style={{
                    clipPath: `inset(0 ${100 - dividerPosition}% 0 0)`,
                  }}
                >
                  <Image
                    src={compressedImage.previewUrl}
                    alt="Compressed"
                    objectFit="contain"
                    w="full"
                    h="full"
                  />
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme="green"
                    fontSize="sm"
                    px={3}
                    py={1}
                  >
                    Compressed
                  </Badge>
                </Box>

                <DraggableDivider
                  position={dividerPosition}
                  onPositionChange={setDividerPosition}
                  containerRef={imageContainerRef}
                />
              </>
            )}

            {/* Loading overlay */}
            {isCompressing && (
              <Center
                position="absolute"
                top={0}
                left={0}
                w="full"
                h="full"
                bg="blackAlpha.700"
              >
                <VStack>
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text color="white">Compressing image...</Text>
                </VStack>
              </Center>
            )}
          </Box>

          {/* Stats */}
          {compressionStats && (
            <SimpleGrid columns={4} spacing={4} w="full">
              <Stat>
                <StatLabel>Original Size</StatLabel>
                <StatNumber>{formatBytes(compressionStats.originalSize)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Compressed Size</StatLabel>
                <StatNumber color="green.400">
                  {formatBytes(compressionStats.compressedSize)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Reduction</StatLabel>
                <StatNumber color="green.400">
                  {compressionStats.reductionPercentage}%
                </StatNumber>
                <StatHelpText>
                  {formatBytes(compressionStats.savedBytes)} saved
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Time</StatLabel>
                <StatNumber>{compressionStats.processingTime}ms</StatNumber>
              </Stat>
            </SimpleGrid>
          )}

          {/* Actions */}
          <HStack spacing={4}>
            <Button
              leftIcon={<Icon as={FiImage} />}
              colorScheme="brand"
              size="lg"
              onClick={handleCompress}
              isLoading={isCompressing}
              isDisabled={!currentImage || isCompressing}
            >
              Compress Image
            </Button>
            {compressedImage && (
              <Button
                leftIcon={<Icon as={FiDownload} />}
                variant="outline"
                size="lg"
                onClick={handleDownload}
              >
                Download
              </Button>
            )}
          </HStack>
        </VStack>
      )}

      {/* Settings panel */}
      {currentImage && <CompressionSettings />}
    </VStack>
  );
};

export default CompressionView;
