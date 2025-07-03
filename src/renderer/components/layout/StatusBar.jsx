import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  HStack,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { FiCpu, FiHardDrive, FiActivity, FiLayers } from 'react-icons/fi';
import { useAppStore } from '../../stores/appStore';
import { useBatchStore } from '../../stores/batchStore';
import { formatBytes } from '../../utils/formatters';

export function StatusBar () {
  const bgColor = useColorModeValue('surface.100', 'surface.700');
  const borderColor = useColorModeValue('surface.200', 'surface.600');
  const textColor = useColorModeValue('surface.600', 'surface.300');

  const { isProcessing, currentOperation, cpuUsage, memoryUsage, activeWorkers } = useAppStore();
  const { batchItems, isProcessing: isBatchProcessing } = useBatchStore();

  const pendingCount = batchItems ? batchItems.filter(item => item.status === 'pending').length : 0;
  const processedCount = batchItems ? batchItems.filter(item => item.status === 'completed' || item.status === 'error').length : 0;
  const totalCount = batchItems ? batchItems.length : 0;
  const batchProgress = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  return (
    <Box
      as="footer"
      h="30px"
      bg={bgColor}
      borderTopWidth="1px"
      borderColor={borderColor}
      px={4}
      className="no-select"
    >
      <Flex h="full" align="center" justify="space-between">
        {/* Left side - Status */}
        <HStack spacing={4} fontSize="xs" color={textColor}>
          {isProcessing || isBatchProcessing ? (
            <HStack spacing={2}>
              <Icon as={FiActivity} boxSize={3} color="accent.400" />
              <Text fontWeight="medium">
                {currentOperation || 'Processing...'}
              </Text>
              {isBatchProcessing && (
                <Progress
                  value={batchProgress}
                  size="xs"
                  w="100px"
                  colorScheme="brand"
                  borderRadius="full"
                />
              )}
            </HStack>
          ) : (
            <Text>Ready</Text>
          )}
        </HStack>

        {/* Right side - System stats */}
        <HStack spacing={4} fontSize="xs" color={textColor}>
          {/* CPU Usage */}
          <Tooltip label="CPU Usage" hasArrow placement="top">
            <HStack spacing={1}>
              <Icon as={FiCpu} boxSize={3} />
              <Text>{cpuUsage.toFixed(0)}%</Text>
            </HStack>
          </Tooltip>

          {/* Memory Usage */}
          <Tooltip label="Memory Usage" hasArrow placement="top">
            <HStack spacing={1}>
              <Icon as={FiHardDrive} boxSize={3} />
              <Text>{formatBytes(memoryUsage)}</Text>
            </HStack>
          </Tooltip>

          {/* Active Workers */}
          <Tooltip label="Active Workers" hasArrow placement="top">
            <HStack spacing={1}>
              <Icon as={FiActivity} boxSize={3} />
              <Text>{activeWorkers}</Text>
            </HStack>
          </Tooltip>

          {/* Queue Status */}
          {pendingCount > 0 && (
            <Tooltip label="Pending in queue" hasArrow placement="top">
              <HStack spacing={1}>
                <Icon as={FiLayers} boxSize={3} />
                <Text>{pendingCount}</Text>
              </HStack>
            </Tooltip>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
