import React from 'react';
import {
  Box,
  VStack,
  Text,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  IconButton,
  Divider,
  useColorModeValue,
  HStack,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiFolder, FiInfo } from 'react-icons/fi';
import { useBatchStore } from '../../stores/batchStore';

export function BatchSettings () {
  const bgColor = useColorModeValue('white', 'surface.700');
  const borderColor = useColorModeValue('surface.200', 'surface.600');

  const { batchSettings, updateBatchSettings } = useBatchStore();

  const handleBrowseOutput = async () => {
    const result = await window.electron.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      updateBatchSettings({ outputDirectory: result.filePaths[0] });
    }
  };

  return (
    <VStack h="full" spacing={0} bg={bgColor}>
      {/* Header */}
      <Box w="full" p={4} borderBottomWidth="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold">
          Batch Settings
        </Text>
      </Box>

      {/* Settings */}
      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          {/* Output Format */}
          <FormControl>
            <HStack justify="space-between" mb={2}>
              <FormLabel mb={0}>Output Format</FormLabel>
              <Tooltip label="Format for all processed images" hasArrow>
                <Icon as={FiInfo} color="surface.400" boxSize={4} />
              </Tooltip>
            </HStack>
            <Select
              value={batchSettings.outputFormat}
              onChange={(e) => updateBatchSettings({ outputFormat: e.target.value })}
              size="sm"
            >
              <option value="original">Keep Original Format</option>
              <option value="jpeg">Convert to JPEG</option>
              <option value="png">Convert to PNG</option>
              <option value="webp">Convert to WebP</option>
            </Select>
          </FormControl>

          {/* Quality */}
          <FormControl>
            <HStack justify="space-between" mb={2}>
              <FormLabel mb={0}>Quality: {batchSettings.quality}%</FormLabel>
              <Tooltip label="Compression quality for all images" hasArrow>
                <Icon as={FiInfo} color="surface.400" boxSize={4} />
              </Tooltip>
            </HStack>
            <Slider
              value={batchSettings.quality}
              onChange={(value) => updateBatchSettings({ quality: value })}
              min={0}
              max={100}
              step={1}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>

          <Divider />

          {/* Resize Options */}
          <FormControl>
            <HStack justify="space-between" mb={2}>
              <FormLabel mb={0}>Resize Images</FormLabel>
              <Switch
                isChecked={!!batchSettings.resize}
                onChange={(e) =>
                  updateBatchSettings({
                    resize: e.target.checked ? { maxWidth: 1920, maxHeight: 1080 } : null
                  })
                }
              />
            </HStack>
            <FormHelperText>Resize all images to maximum dimensions</FormHelperText>
          </FormControl>

          {batchSettings.resize && (
            <>
              <FormControl>
                <FormLabel>Max Width (px)</FormLabel>
                <NumberInput
                  value={batchSettings.resize.maxWidth || ''}
                  onChange={(_, value) =>
                    updateBatchSettings({
                      resize: { ...batchSettings.resize, maxWidth: value || undefined }
                    })
                  }
                  min={1}
                  max={10000}
                  size="sm"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Max Height (px)</FormLabel>
                <NumberInput
                  value={batchSettings.resize.maxHeight || ''}
                  onChange={(_, value) =>
                    updateBatchSettings({
                      resize: { ...batchSettings.resize, maxHeight: value || undefined }
                    })
                  }
                  min={1}
                  max={10000}
                  size="sm"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </>
          )}

          <Divider />

          {/* Output Options */}
          <FormControl>
            <FormLabel>Output Directory</FormLabel>
            <HStack>
              <Input
                value={batchSettings.outputDirectory}
                onChange={(e) => updateBatchSettings({ outputDirectory: e.target.value })}
                size="sm"
                pr={10}
              />
              <IconButton
                icon={<FiFolder />}
                size="sm"
                variant="outline"
                onClick={handleBrowseOutput}
                position="absolute"
                right={1}
              />
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel>File Naming Pattern</FormLabel>
            <Input
              value={batchSettings.namingPattern}
              onChange={(e) => updateBatchSettings({ namingPattern: e.target.value })}
              size="sm"
            />
            <FormHelperText fontSize="xs">
              Use {'{name}'} for original name, {'{date}'} for date, {'{timestamp}'} for timestamp
            </FormHelperText>
          </FormControl>

          <FormControl>
            <HStack justify="space-between">
              <FormLabel mb={0}>Create Timestamp Folder</FormLabel>
              <Switch
                isChecked={batchSettings.createTimestampFolder}
                onChange={(e) =>
                  updateBatchSettings({ createTimestampFolder: e.target.checked })
                }
              />
            </HStack>
            <FormHelperText fontSize="xs">
              Create a subfolder with current timestamp
            </FormHelperText>
          </FormControl>

          <FormControl>
            <HStack justify="space-between">
              <FormLabel mb={0}>Overwrite Existing Files</FormLabel>
              <Switch
                isChecked={batchSettings.overwriteExisting}
                onChange={(e) =>
                  updateBatchSettings({ overwriteExisting: e.target.checked })
                }
              />
            </HStack>
          </FormControl>

          <Divider />

          {/* Processing Options */}
          <FormControl>
            <FormLabel>Concurrent Workers</FormLabel>
            <NumberInput
              value={batchSettings.concurrency}
              onChange={(_, value) => updateBatchSettings({ concurrency: value || 1 })}
              min={1}
              max={8}
              size="sm"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText fontSize="xs">
              Number of images to process simultaneously
            </FormHelperText>
          </FormControl>
        </VStack>
      </Box>

      {/* Save as Preset */}
      <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
        <Button w="full" size="sm" variant="outline">
          Save as Preset
        </Button>
      </Box>
    </VStack>
  );
}
