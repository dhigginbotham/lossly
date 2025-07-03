import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  useToast,
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Image,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Checkbox,
  Center,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiMoreVertical,
  FiEye,
  FiCalendar,
  FiImage,
  FiFolder,
  FiRefreshCw,
} from 'react-icons/fi';
import { format, subDays, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore } from '../../stores/historyStore';

const MotionBox = motion(Box);

const HistoryView = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());

  const { history, clearHistory, removeFromHistory, loadHistory } = useHistoryStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getFilteredHistory = () => {
    let filtered = history;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.originalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      let startDate;
      switch (filterPeriod) {
        case 'today':
          startDate = subDays(now, 1);
          break;
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subDays(now, 30);
          break;
        default:
          startDate = null;
      }
      if (startDate) {
        filtered = filtered.filter((item) =>
          isAfter(new Date(item.timestamp), startDate)
        );
      }
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    return filtered;
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  const handleSelectAll = () => {
    const filteredHistory = getFilteredHistory();
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map((item) => item.id)));
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

  const handleDeleteSelected = () => {
    selectedItems.forEach((id) => removeFromHistory(id));
    setSelectedItems(new Set());
    toast({
      title: 'Items deleted',
      status: 'success',
      duration: 2000,
    });
  };

  const handleRecompress = async (item) => {
    // This would trigger a new compression with the same settings
    toast({
      title: 'Recompression started',
      description: `Recompressing ${item.originalName}`,
      status: 'info',
      duration: 3000,
    });
  };

  const filteredHistory = getFilteredHistory();

  // Calculate stats
  const stats = {
    totalImages: filteredHistory.length,
    totalSaved: filteredHistory.reduce((acc, item) => acc + (item.savedBytes || 0), 0),
    avgReduction: filteredHistory.length > 0
      ? Math.round(
        filteredHistory.reduce((acc, item) => acc + (item.reductionPercentage || 0), 0) /
        filteredHistory.length
      )
      : 0,
  };

  return (
    <VStack spacing={6} h="full" p={6}>
      {/* Header */}
      <HStack w="full" justify="space-between">
        <Heading size="lg">Compression History</Heading>
        <Button
          leftIcon={<Icon as={FiTrash2} />}
          variant="ghost"
          colorScheme="red"
          onClick={clearHistory}
          isDisabled={history.length === 0}
        >
          Clear History
        </Button>
      </HStack>

      {/* Stats */}
      <SimpleGrid columns={3} spacing={4} w="full">
        <Stat>
          <StatLabel>Total Images</StatLabel>
          <StatNumber>{stats.totalImages}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Total Saved</StatLabel>
          <StatNumber color="green.400">{formatBytes(stats.totalSaved)}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Avg. Reduction</StatLabel>
          <StatNumber color="green.400">{stats.avgReduction}%</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Filters */}
      <HStack w="full" spacing={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="whiteAlpha.500" />
          </InputLeftElement>
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="whiteAlpha.100"
          />
        </InputGroup>
        <Select
          maxW="150px"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          bg="whiteAlpha.100"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </Select>
        <Select
          maxW="150px"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          bg="whiteAlpha.100"
        >
          <option value="all">All Types</option>
          <option value="compression">Compression</option>
          <option value="conversion">Conversion</option>
        </Select>
        <Spacer />
        {selectedItems.size > 0 && (
          <Button
            size="sm"
            leftIcon={<Icon as={FiTrash2} />}
            colorScheme="red"
            variant="ghost"
            onClick={handleDeleteSelected}
          >
            Delete Selected ({selectedItems.size})
          </Button>
        )}
      </HStack>

      {/* History Table */}
      <TableContainer
        w="full"
        flex={1}
        overflowY="auto"
        bg="whiteAlpha.50"
        backdropFilter="blur(10px)"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
        {filteredHistory.length === 0 ? (
          <Center h="full">
            <VStack spacing={4}>
              <Icon as={FiCalendar} boxSize={16} color="whiteAlpha.300" />
              <Text color="whiteAlpha.500">No history items found</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} bg="gray.900" zIndex={1}>
              <Tr>
                <Th width="40px">
                  <Checkbox
                    isChecked={selectedItems.size === filteredHistory.length}
                    isIndeterminate={
                      selectedItems.size > 0 && selectedItems.size < filteredHistory.length
                    }
                    onChange={handleSelectAll}
                  />
                </Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Original Size</Th>
                <Th>New Size</Th>
                <Th>Reduction</Th>
                <Th>Date</Th>
                <Th width="60px"></Th>
              </Tr>
            </Thead>
            <Tbody>
              <AnimatePresence>
                {filteredHistory.map((item) => (
                  <MotionBox
                    key={item.id}
                    as={Tr}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    _hover={{ bg: 'whiteAlpha.50' }}
                  >
                    <Td>
                      <Checkbox
                        isChecked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Icon as={FiImage} color="whiteAlpha.500" />
                        <Text noOfLines={1}>{item.originalName}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={item.type === 'compression' ? 'blue' : 'purple'}
                      >
                        {item.type}
                      </Badge>
                    </Td>
                    <Td>{formatBytes(item.originalSize)}</Td>
                    <Td>{formatBytes(item.compressedSize || item.outputSize)}</Td>
                    <Td>
                      {item.reductionPercentage ? (
                        <Badge colorScheme="green">{item.reductionPercentage}%</Badge>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      <Tooltip label={formatDate(item.timestamp)} placement="top">
                        <Text fontSize="xs">{format(new Date(item.timestamp), 'MMM dd')}</Text>
                      </Tooltip>
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
                            onClick={() => handleViewDetails(item)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={FiFolder} />}
                          >
                            Show in Folder
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={FiRefreshCw} />}
                            onClick={() => handleRecompress(item)}
                          >
                            Recompress
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={FiTrash2} />}
                            color="red.400"
                            onClick={() => removeFromHistory(item.id)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Image Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedItem && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Original Name
                    </Text>
                    <Text>{selectedItem.originalName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Type
                    </Text>
                    <Badge
                      colorScheme={selectedItem.type === 'compression' ? 'blue' : 'purple'}
                    >
                      {selectedItem.type}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Original Size
                    </Text>
                    <Text>{formatBytes(selectedItem.originalSize)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      New Size
                    </Text>
                    <Text>{formatBytes(selectedItem.compressedSize || selectedItem.outputSize)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Reduction
                    </Text>
                    <Text color="green.400">
                      {selectedItem.reductionPercentage
                        ? `${selectedItem.reductionPercentage}%`
                        : '-'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Date
                    </Text>
                    <Text>{formatDate(selectedItem.timestamp)}</Text>
                  </Box>
                </SimpleGrid>
                {selectedItem.settings && (
                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600" mb={2}>
                      Settings Used
                    </Text>
                    <Box
                      p={3}
                      bg="whiteAlpha.100"
                      borderRadius="md"
                      fontSize="sm"
                    >
                      <Text>Format: {selectedItem.settings.format || 'N/A'}</Text>
                      <Text>Quality: {selectedItem.settings.quality || 'N/A'}%</Text>
                      {selectedItem.settings.resize?.maxWidth && (
                        <Text>Max Width: {selectedItem.settings.resize.maxWidth}px</Text>
                      )}
                      {selectedItem.settings.resize?.maxHeight && (
                        <Text>Max Height: {selectedItem.settings.resize.maxHeight}px</Text>
                      )}
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="brand"
              leftIcon={<Icon as={FiFolder} />}
            >
              Show in Folder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default HistoryView;
