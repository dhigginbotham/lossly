import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  HStack,
  VStack,
  Tooltip,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiDownload,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi';
import { useImageStore } from '../../stores/imageStore';
import { formatBytes, formatCompressionSaving } from '../../utils/formatters';

export function ImageComparator () {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const bgColor = useColorModeValue('surface.50', 'surface.800');
  const borderColor = useColorModeValue('surface.200', 'surface.600');

  const {
    originalImage,
    compressedImage,
    dividerPosition,
    zoomLevel,
    panPosition,
    setDividerPosition,
    setZoomLevel,
    setPanPosition,
    resetZoomAndPan,
    saveCompressedImage,
  } = useImageStore();

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle divider drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setDividerPosition(percentage);
  }, [isDragging, setDividerPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel * 1.2, 5));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel / 1.2, 0.1));

  if (!originalImage) return null;

  const dividerX = (containerWidth * dividerPosition) / 100;

  return (
    <VStack h="full" spacing={4} align="stretch">
      {/* Toolbar */}
      <HStack justify="space-between" px={4}>
        <HStack spacing={4}>
          <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
            Original: {formatBytes(originalImage.size)}
          </Badge>
          {compressedImage && (
            <>
              <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                Compressed: {formatBytes(compressedImage.size)}
              </Badge>
              <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                Saved: {formatCompressionSaving(originalImage.size, compressedImage.size)}
              </Badge>
            </>
          )}
        </HStack>

        <HStack spacing={2}>
          <Tooltip label="Zoom In" hasArrow>
            <IconButton
              icon={<FiZoomIn />}
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              isDisabled={zoomLevel >= 5}
            />
          </Tooltip>
          <Tooltip label="Zoom Out" hasArrow>
            <IconButton
              icon={<FiZoomOut />}
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              isDisabled={zoomLevel <= 0.1}
            />
          </Tooltip>
          <Tooltip label="Reset View" hasArrow>
            <IconButton
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={resetZoomAndPan}
            />
          </Tooltip>
          {compressedImage && (
            <Tooltip label="Save Compressed" hasArrow>
              <IconButton
                icon={<FiDownload />}
                size="sm"
                variant="ghost"
                colorScheme="brand"
                onClick={saveCompressedImage}
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      {/* Comparison View */}
      <Box
        ref={containerRef}
        flex={1}
        position="relative"
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        cursor={isDragging ? 'col-resize' : 'default'}
        className="comparison-slider"
      >
        {/* Original Image */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`}
            transition={isDragging ? 'none' : 'transform 0.2s'}
          >
            <img
              src={originalImage.dataUrl}
              alt="Original"
              style={{
                display: 'block',
                maxWidth: 'none',
              }}
            />
          </Box>

          {/* Label */}
          <Box
            position="absolute"
            top={4}
            left={4}
            bg="blackAlpha.700"
            px={3}
            py={1}
            borderRadius="md"
          >
            <Text color="white" fontSize="sm" fontWeight="medium">
              Original
            </Text>
          </Box>
        </Box>

        {/* Compressed Image */}
        {compressedImage && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            overflow="hidden"
            style={{
              clipPath: `inset(0 ${100 - dividerPosition}% 0 0)`,
            }}
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform={`translate(-50%, -50%) scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`}
              transition={isDragging ? 'none' : 'transform 0.2s'}
            >
              <img
                src={compressedImage.dataUrl}
                alt="Compressed"
                style={{
                  display: 'block',
                  maxWidth: 'none',
                }}
              />
            </Box>

            {/* Label */}
            <Box
              position="absolute"
              top={4}
              right={4}
              bg="blackAlpha.700"
              px={3}
              py={1}
              borderRadius="md"
            >
              <Text color="white" fontSize="sm" fontWeight="medium">
                Compressed
              </Text>
            </Box>
          </Box>
        )}

        {/* Divider */}
        {compressedImage && (
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={`${dividerPosition}%`}
            transform="translateX(-50%)"
            className="comparison-slider-handle"
            onMouseDown={handleMouseDown}
            cursor="col-resize"
            userSelect="none"
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="accent.500"
              color="white"
              w={10}
              h={10}
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
              borderWidth="3px"
              borderColor="white"
            >
              <Text fontSize="xs" fontWeight="bold">
                ↔
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </VStack>
  );
}
