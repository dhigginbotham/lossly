import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Tooltip,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiPlay,
  FiPause,
  FiTrash2,
  FiDownload,
  FiMoreVertical,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiFolderPlus,
  FiEye,
} from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useBatchStore } from '../../stores/batchStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useHistoryStore } from '../../stores/historyStore';
import CompressionSettings from '../common/CompressionSettings';

const MotionBox = motion(Box);

const BatchView = () => {
  const toast = useToast();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const eventSourceRef = useRef(null);

  const {
    batchItems,
    batchStats,
    currentProcessingId,
    addToBatch,
    removeFromBatch,
    clearBatch,
    updateBatchItem,
    updateBatchStats,
  } = useBatchStore();

  const { compressionSettings } = useSettingsStore();
  const { addToHistory } = useHistoryStore();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      console.log('Files dropped:', acceptedFiles);

      const imageFiles = acceptedFiles.filter((file) => {
        // Check if it's an image by type or extension
        const isImageType = file.type && file.type.startsWith('image/');
        const hasImageExt = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
        return isImageType || hasImageExt;
      });

      if (imageFiles.length === 0) {
        toast({
          title: 'No images found',
          description: 'Please drop image files only',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      // Process files and get actual file sizes
      const newItems = await Promise.all(
        imageFiles.map(async (file) => {
          // For Electron, we need the actual file path
          const filePath = file.path;

          if (!filePath) {
            console.error('No file path found for:', file);
            toast({
              title: 'File path error',
              description: `Could not get path for ${file.name}`,
              status: 'error',
              duration: 3000,
            });
            return null;
          }

          const fileExt = file.name.split('.').pop().toLowerCase();

          // Get actual file size from the file system
          let fileSize = file.size || 0;
          if (fileSize === 0 && window.api?.compression?.getFileStats) {
            try {
              const stats = await window.api.compression.getFileStats(filePath);
              fileSize = stats.size;
            } catch (error) {
              console.error('Failed to get file stats:', error);
            }
          }

          return {
            id: Date.now() + Math.random(),
            originalName: file.name,
            originalPath: filePath,
            originalSize: fileSize,
            originalFormat: file.type ? file.type.split('/')[1] : fileExt,
            status: 'pending',
            progress: 0,
            // Create preview URL for images
            previewUrl: filePath.startsWith('file://') ? filePath : `file://${filePath}`,
          };
        })
      );

      const validItems = newItems.filter(item => item !== null);

      if (validItems.length === 0) {
        return;
      }

      validItems.forEach((item) => addToBatch(item));

      toast({
        title: 'Images added to batch',
        description: `Added ${validItems.length} images`,
        status: 'success',
        duration: 2000,
      });
    },
    [addToBatch, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
    },
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const handleSelectAll = () => {
    if (selectedItems.size === batchItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(batchItems.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach((id) => removeFromBatch(id));
    setSelectedItems(new Set());
  };

  const handleStartBatch = async () => {
    if (batchItems.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);

    try {
      const response = await window.api.batch.startBatch({
        items: batchItems.map((item) => ({
          id: item.id,
          path: item.originalPath,
          settings: compressionSettings,
        })),
      });

      if (response.success) {
        const { batchId } = response.data;
        setCurrentBatchId(batchId);

        // Connect to progress updates
        connectToProgressUpdates(batchId);

        toast({
          title: 'Batch processing started',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to start batch',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setIsProcessing(false);
    }
  };

  const handlePauseBatch = async () => {
    try {
      await window.api.batch.pauseBatch();
      setIsPaused(true);
    } catch (error) {
      toast({
        title: 'Failed to pause batch',
        description: error.message,
        status: 'error',
      });
    }
  };

  const handleResumeBatch = async () => {
    try {
      await window.api.batch.resumeBatch();
      setIsPaused(false);
    } catch (error) {
      toast({
        title: 'Failed to resume batch',
        description: error.message,
        status: 'error',
      });
    }
  };

  const handleDownloadAll = async () => {
    const completedItems = batchItems.filter(
      (item) => item.status === 'completed'
    );

    if (completedItems.length === 0) {
      toast({
        title: 'No completed items',
        description: 'Complete some compressions first',
        status: 'warning',
      });
      return;
    }

    try {
      await window.api.batch.downloadAll({
        items: completedItems.map((item) => ({
          path: item.outputPath,
          name: item.outputName,
        })),
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error.message,
        status: 'error',
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Icon as={FiCheck} color="green.400" />;
      case 'failed':
        return <Icon as={FiAlertCircle} color="red.400" />;
      case 'processing':
        return <Icon as={FiClock} color="blue.400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'processing':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const connectToProgressUpdates = async (batchId) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Get backend URL dynamically
    const backendUrl = await window.api.app.getBackendUrl();

    // Create new SSE connection
    const eventSource = new EventSource(`${backendUrl}/api/batch/progress/${batchId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'progress') {
        // Update batch stats
        updateBatchStats({
          completed: data.completed,
          failed: data.failed,
          totalSaved: data.totalSaved,
        });

        // Mark current item as processing
        if (data.currentItem) {
          // First, mark any previous processing items as completed if they're still processing
          batchItems.forEach(item => {
            if (item.status === 'processing' && item.id !== data.currentItem) {
              updateBatchItem(item.id, {
                status: 'completed',
                progress: 100,
              });
            }
          });

          // Then mark the current item as processing
          updateBatchItem(data.currentItem, {
            status: 'processing',
            progress: 50,
          });
        }
      } else if (data.type === 'complete') {
        // Mark all remaining processing items as completed
        batchItems.forEach(item => {
          if (item.status === 'processing' || item.status === 'pending') {
            updateBatchItem(item.id, {
              status: 'completed',
              progress: 100,
            });
          }
        });

        setIsProcessing(false);
        eventSource.close();
        toast({
          title: 'Batch processing completed',
          description: `Processed ${data.completed} images successfully`,
          status: 'success',
          duration: 5000,
        });
      } else if (data.type === 'error') {
        setIsProcessing(false);
        eventSource.close();
        toast({
          title: 'Batch processing failed',
          description: data.error,
          status: 'error',
          duration: 5000,
        });
      }
    };

    eventSource.onerror = () => {
      setIsProcessing(false);
      eventSource.close();
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <VStack spacing={6} h="full" p={6}>
      {/* Header */}
      <HStack w="full" justify="space-between">
        <Heading size="lg">Batch Processing</Heading>
        <HStack spacing={4}>
          {isProcessing && (
            <>
              {isPaused ? (
                <Button
                  leftIcon={<Icon as={FiPlay} />}
                  colorScheme="green"
                  onClick={handleResumeBatch}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  leftIcon={<Icon as={FiPause} />}
                  variant="outline"
                  onClick={handlePauseBatch}
                >
                  Pause
                </Button>
              )}
            </>
          )}
          {batchItems.length > 0 && !isProcessing && (
            <Button
              leftIcon={<Icon as={FiPlay} />}
              colorScheme="brand"
              onClick={handleStartBatch}
            >
              Start Batch
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Stats */}
      {batchItems.length > 0 && (
        <SimpleGrid columns={4} spacing={4} w="full" data-testid="batch-stats">
          <Stat>
            <StatLabel>Total Images</StatLabel>
            <StatNumber data-testid="total-images">{batchStats.total}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Completed</StatLabel>
            <StatNumber color="green.400" data-testid="completed-images">{batchStats.completed}</StatNumber>
            <StatHelpText>
              {batchStats.total > 0
                ? `${Math.round((batchStats.completed / batchStats.total) * 100)}%`
                : '0%'}
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Failed</StatLabel>
            <StatNumber color="red.400">{batchStats.failed}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Saved</StatLabel>
            <StatNumber color="green.400">
              {formatBytes(batchStats.totalSaved)}
            </StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {/* Overall Progress */}
      {isProcessing && (
        <Box w="full">
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm">Overall Progress</Text>
            <Text fontSize="sm" fontWeight="bold">
              {Math.round(
                ((batchStats.completed + batchStats.failed) / batchStats.total) * 100
              )}
              %
            </Text>
          </HStack>
          <Progress
            value={(batchStats.completed + batchStats.failed) / batchStats.total * 100}
            colorScheme="brand"
            borderRadius="full"
            size="sm"
          />
        </Box>
      )}

      {/* Drop zone or batch list */}
      {batchItems.length === 0 ? (
        <Center
          {...getRootProps()}
          data-testid="batch-dropzone"
          w="full"
          h="50vh"
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
            <Icon as={FiFolderPlus} boxSize={16} color="whiteAlpha.500" />
            <Text fontSize="lg" color="whiteAlpha.700">
              {isDragActive
                ? 'Drop the images here'
                : 'Drag & drop multiple images, or click to select'}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.500">
              Process multiple images at once
            </Text>
            <Button
              leftIcon={<Icon as={FiUpload} />}
              colorScheme="brand"
              size="lg"
              onClick={async (e) => {
                e.stopPropagation(); // Prevent dropzone from handling the click
                try {
                  const result = await window.api.dialog.showOpenDialog({
                    properties: ['openFile', 'multiSelections'],
                    filters: [
                      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] }
                    ]
                  });

                  if (!result.canceled && result.filePaths.length > 0) {
                    // Create File-like objects from the selected paths
                    const files = await Promise.all(
                      result.filePaths.map(async filePath => {
                        const name = filePath.split(/[\\/]/).pop();
                        const ext = name.split('.').pop().toLowerCase();

                        // Get file size from file system
                        let size = 0;
                        if (window.api?.compression?.getFileStats) {
                          try {
                            const stats = await window.api.compression.getFileStats(filePath);
                            size = stats.size;
                          } catch (error) {
                            console.error('Failed to get file stats:', error);
                          }
                        }

                        return {
                          path: filePath,
                          name: name,
                          type: `image/${ext}`,
                          size: size
                        };
                      })
                    );

                    // Process files through onDrop
                    onDrop(files);
                  }
                } catch (error) {
                  toast({
                    title: 'Failed to open file dialog',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                  });
                }
              }}
            >
              Choose Images
            </Button>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={4} w="full" flex={1}>
          {/* Batch Actions */}
          <HStack w="full" justify="space-between">
            <HStack>
              <Checkbox
                isChecked={selectedItems.size === batchItems.length}
                isIndeterminate={
                  selectedItems.size > 0 && selectedItems.size < batchItems.length
                }
                onChange={handleSelectAll}
              >
                Select All
              </Checkbox>
              {selectedItems.size > 0 && (
                <Button
                  size="sm"
                  leftIcon={<Icon as={FiTrash2} />}
                  variant="ghost"
                  colorScheme="red"
                  onClick={handleRemoveSelected}
                >
                  Remove Selected ({selectedItems.size})
                </Button>
              )}
            </HStack>
            <HStack>
              <Button
                size="sm"
                leftIcon={<Icon as={FiDownload} />}
                variant="outline"
                onClick={handleDownloadAll}
                isDisabled={batchStats.completed === 0}
              >
                Download All
              </Button>
              <Button
                size="sm"
                leftIcon={<Icon as={FiTrash2} />}
                variant="ghost"
                colorScheme="red"
                onClick={clearBatch}
              >
                Clear All
              </Button>
              <Box
                {...getRootProps()}
                cursor="pointer"
              >
                <input {...getInputProps()} />
                <Button
                  size="sm"
                  leftIcon={<Icon as={FiUpload} />}
                  variant="outline"
                >
                  Add More
                </Button>
              </Box>
            </HStack>
          </HStack>

          {/* Batch Items Table */}
          <TableContainer
            w="full"
            maxH="40vh"
            overflowY="auto"
            bg="whiteAlpha.50"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Table variant="simple" size="sm">
              <Thead position="sticky" top={0} bg="gray.900" zIndex={1}>
                <Tr>
                  <Th width="40px"></Th>
                  <Th>Name</Th>
                  <Th>Original Size</Th>
                  <Th>Compressed Size</Th>
                  <Th>Reduction</Th>
                  <Th>Status</Th>
                  <Th>Progress</Th>
                  <Th width="60px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                <AnimatePresence>
                  {batchItems.map((item) => (
                    <MotionBox
                      key={item.id}
                      as={Tr}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      _hover={{ bg: 'whiteAlpha.50' }}
                      bg={currentProcessingId === item.id ? 'whiteAlpha.100' : 'transparent'}
                    >
                      <Td>
                        <Checkbox
                          isChecked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {/* Image preview thumbnail */}
                          {item.previewUrl && (
                            <Box
                              w="40px"
                              h="40px"
                              borderRadius="md"
                              overflow="hidden"
                              bg="whiteAlpha.100"
                              border="1px solid"
                              borderColor="whiteAlpha.200"
                            >
                              <img
                                src={item.previewUrl}
                                alt={item.originalName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </Box>
                          )}
                          <Text noOfLines={1}>{item.originalName}</Text>
                        </HStack>
                      </Td>
                      <Td>{formatBytes(item.originalSize)}</Td>
                      <Td>
                        {item.compressedSize
                          ? formatBytes(item.compressedSize)
                          : '-'}
                      </Td>
                      <Td>
                        {item.reductionPercentage ? (
                          <Badge colorScheme="green">
                            {item.reductionPercentage}%
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          {getStatusIcon(item.status)}
                          <Badge colorScheme={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        {item.status === 'processing' ? (
                          <Progress
                            value={item.progress}
                            size="xs"
                            colorScheme="brand"
                            borderRadius="full"
                          />
                        ) : (
                          <Text fontSize="xs">
                            {item.status === 'completed' ? '100%' : '-'}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<Icon as={FiMoreVertical} />}
                            variant="ghost"
                            size="xs"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<Icon as={FiEye} />}
                              onClick={() => setPreviewItem(item)}
                            >
                              Preview
                            </MenuItem>
                            {item.status === 'completed' && (
                              <MenuItem icon={<Icon as={FiDownload} />}>
                                Download
                              </MenuItem>
                            )}
                            <MenuItem
                              icon={<Icon as={FiTrash2} />}
                              color="red.400"
                              onClick={() => removeFromBatch(item.id)}
                            >
                              Remove
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>
      )}

      {/* Settings panel */}
      {batchItems.length > 0 && <CompressionSettings />}

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        size="xl"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="gray.900"
          borderColor="whiteAlpha.200"
          borderWidth="1px"
        >
          <ModalHeader>{previewItem?.originalName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              {previewItem?.previewUrl && (
                <Box
                  maxH="400px"
                  overflow="hidden"
                  borderRadius="lg"
                  bg="whiteAlpha.50"
                >
                  <Image
                    src={previewItem.previewUrl}
                    alt={previewItem.originalName}
                    maxH="400px"
                    objectFit="contain"
                  />
                </Box>
              )}
              <HStack spacing={4} fontSize="sm" color="whiteAlpha.700">
                <Text>
                  Original: {formatBytes(previewItem?.originalSize || 0)}
                </Text>
                {previewItem?.compressedSize && (
                  <>
                    <Text>•</Text>
                    <Text>
                      Compressed: {formatBytes(previewItem.compressedSize)}
                    </Text>
                    <Text>•</Text>
                    <Text color="green.400">
                      Saved: {previewItem.reductionPercentage}%
                    </Text>
                  </>
                )}
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default BatchView;
