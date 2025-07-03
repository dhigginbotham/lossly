import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  useToast,
  Center,
  Select,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Image,
  Badge,
  Heading,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FiUpload, FiDownload, FiImage, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useImageStore } from '../../stores/imageStore';
import { useHistoryStore } from '../../stores/historyStore';

const MotionBox = motion(Box);

const formatSupport = {
  jpeg: {
    from: ['png', 'webp', 'gif', 'bmp', 'tiff'],
    features: ['Lossy compression', 'Wide support', 'Small file sizes'],
  },
  png: {
    from: ['jpeg', 'webp', 'gif', 'bmp', 'tiff'],
    features: ['Lossless compression', 'Transparency support', 'High quality'],
  },
  webp: {
    from: ['jpeg', 'png', 'gif', 'bmp', 'tiff'],
    features: ['Modern format', 'Excellent compression', 'Animation support'],
  },
  gif: {
    from: ['jpeg', 'png', 'webp', 'bmp'],
    features: ['Animation support', '256 colors', 'Wide support'],
  },
  svg: {
    from: ['png'],
    features: ['Vector format', 'Scalable', 'Small file size for graphics'],
  },
};

const ConversionView = () => {
  const toast = useToast();
  const [selectedFormat, setSelectedFormat] = useState('jpeg');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImage, setConvertedImage] = useState(null);

  const { currentImage, setCurrentImage } = useImageStore();
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
      const format = file.type.split('/')[1].toLowerCase();

      setCurrentImage({
        id: Date.now().toString(),
        originalName: file.name,
        originalPath: file.path || file.name,
        originalSize: file.size,
        originalFormat: format,
        previewUrl: imageUrl,
      });

      // Clear previous conversion
      setConvertedImage(null);

      // Set initial target format (first available option)
      const availableFormats = Object.keys(formatSupport).filter((fmt) =>
        formatSupport[fmt].from.includes(format)
      );
      if (availableFormats.length > 0) {
        setSelectedFormat(availableFormats[0]);
      }
    },
    [setCurrentImage, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'],
    },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!currentImage || !selectedFormat) return;

    setIsConverting(true);
    try {
      const response = await window.api.conversion.convert({
        imagePath: currentImage.originalPath,
        targetFormat: selectedFormat,
      });

      if (response.success) {
        const convertedUrl = `file://${response.data.outputPath}`;
        setConvertedImage({
          ...response.data,
          previewUrl: convertedUrl,
        });

        // Add to history
        addToHistory({
          ...currentImage,
          ...response.data,
          type: 'conversion',
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Conversion successful',
          description: `Converted to ${selectedFormat.toUpperCase()}`,
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Conversion failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = async () => {
    if (!convertedImage) return;

    try {
      await window.api.conversion.saveAs({
        sourcePath: convertedImage.outputPath,
        defaultName: convertedImage.outputName,
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

  const getAvailableFormats = () => {
    if (!currentImage) return [];
    return Object.keys(formatSupport).filter((format) =>
      formatSupport[format].from.includes(currentImage.originalFormat)
    );
  };

  return (
    <VStack spacing={6} h="full" p={6}>
      {/* Header */}
      <HStack w="full" justify="space-between">
        <Heading size="lg">Format Conversion</Heading>
        {currentImage && (
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentImage(null);
              setConvertedImage(null);
            }}
          >
            New Image
          </Button>
        )}
      </HStack>

      {/* Drop zone or conversion interface */}
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
                : 'Drag & drop an image to convert'}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.500">
              Convert between JPEG, PNG, WebP, GIF, and more
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
        <VStack spacing={6} w="full" flex={1}>
          {/* Format Selection */}
          <Box
            w="full"
            bg="whiteAlpha.50"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            p={6}
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <FormControl>
              <FormLabel>Convert to Format</FormLabel>
              <Select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                bg="whiteAlpha.100"
                size="lg"
                isDisabled={getAvailableFormats().length === 0}
              >
                {getAvailableFormats().map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedFormat && formatSupport[selectedFormat] && (
              <Box mt={4}>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  {selectedFormat.toUpperCase()} Features:
                </Text>
                <List spacing={1}>
                  {formatSupport[selectedFormat].features.map((feature) => (
                    <ListItem key={feature} fontSize="sm" color="whiteAlpha.700">
                      <ListIcon as={FiCheck} color="green.400" />
                      {feature}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* Image Preview */}
          <Grid templateColumns="1fr auto 1fr" gap={6} w="full" flex={1}>
            {/* Original Image */}
            <GridItem>
              <VStack
                h="full"
                bg="blackAlpha.300"
                borderRadius="xl"
                p={4}
                spacing={4}
              >
                <Badge colorScheme="gray" fontSize="sm">
                  Original ({currentImage.originalFormat.toUpperCase()})
                </Badge>
                <Box flex={1} w="full" position="relative">
                  <Image
                    src={currentImage.previewUrl}
                    alt="Original"
                    objectFit="contain"
                    w="full"
                    h="full"
                    maxH="300px"
                  />
                </Box>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {formatBytes(currentImage.originalSize)}
                </Text>
              </VStack>
            </GridItem>

            {/* Arrow */}
            <GridItem display="flex" alignItems="center">
              <Icon as={FiArrowRight} boxSize={8} color="brand.400" />
            </GridItem>

            {/* Converted Image */}
            <GridItem>
              <VStack
                h="full"
                bg="blackAlpha.300"
                borderRadius="xl"
                p={4}
                spacing={4}
                position="relative"
              >
                <Badge colorScheme="green" fontSize="sm">
                  {selectedFormat.toUpperCase()}
                </Badge>
                <Box flex={1} w="full" position="relative">
                  {convertedImage ? (
                    <Image
                      src={convertedImage.previewUrl}
                      alt="Converted"
                      objectFit="contain"
                      w="full"
                      h="full"
                      maxH="300px"
                    />
                  ) : (
                    <Center h="full">
                      <Text color="whiteAlpha.500">
                        {isConverting ? 'Converting...' : 'No conversion yet'}
                      </Text>
                    </Center>
                  )}
                </Box>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {convertedImage
                    ? formatBytes(convertedImage.outputSize)
                    : '-'}
                </Text>
              </VStack>
            </GridItem>
          </Grid>

          {/* Actions */}
          <HStack spacing={4}>
            <Button
              leftIcon={<Icon as={FiImage} />}
              colorScheme="brand"
              size="lg"
              onClick={handleConvert}
              isLoading={isConverting}
              isDisabled={!currentImage || isConverting || getAvailableFormats().length === 0}
            >
              Convert Image
            </Button>
            {convertedImage && (
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

          {getAvailableFormats().length === 0 && (
            <Text color="orange.400" fontSize="sm">
              No conversion options available for {currentImage.originalFormat.toUpperCase()} format
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default ConversionView;
