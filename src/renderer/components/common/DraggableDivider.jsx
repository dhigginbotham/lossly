import React, { useState, useEffect, useCallback } from 'react';
import { Box, Icon } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DraggableDivider = ({ position, onPositionChange, containerRef }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const percentage = (relativeX / containerRect.width) * 100;
      const clampedPercentage = Math.max(0, Math.min(100, percentage));

      onPositionChange(clampedPercentage);
    },
    [isDragging, containerRef, onPositionChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'auto';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <MotionBox
      position="absolute"
      top={0}
      left={`${position}%`}
      h="full"
      w="4px"
      bg="brand.500"
      cursor="ew-resize"
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-8px',
        right: '-8px',
        bottom: 0,
        cursor: 'ew-resize',
      }}
      _hover={{
        bg: 'brand.400',
      }}
    >
      {/* Divider handle */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="brand.500"
        borderRadius="full"
        w={10}
        h={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="0 2px 8px rgba(0,0,0,0.3)"
        _hover={{
          bg: 'brand.400',
          transform: 'translate(-50%, -50%) scale(1.1)',
        }}
        transition="all 0.2s"
      >
        <Icon as={FiChevronLeft} color="white" boxSize={3} mr={-1} />
        <Icon as={FiChevronRight} color="white" boxSize={3} ml={-1} />
      </Box>

      {/* Position indicator */}
      {isDragging && (
        <Box
          position="absolute"
          bottom={-8}
          left="50%"
          transform="translateX(-50%)"
          bg="brand.500"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
          fontWeight="bold"
          whiteSpace="nowrap"
        >
          {Math.round(position)}%
        </Box>
      )}
    </MotionBox>
  );
};

export default DraggableDivider;
