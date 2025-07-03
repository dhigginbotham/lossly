import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  Switch,
  Button,
  Tooltip,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormHelperText,
  useColorModeValue,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { FiInfo, FiSave, FiPlay, FiRefreshCw } from 'react-icons/fi';
import { useImageStore } from '../../stores/imageStore';
import { useCompression } from '../../hooks/useCompression';
import { formatBytes } from '../../utils/formatters';

export function CompressionSettings () {
  const bgColor = useColorModeValue('white', 'surface.700');
  const borderColor = useColorModeValue('surface.200', 'surface.600');

  const {
    currentSettings,
    updateSettings,
    estimatedSize,
    originalImage,
  } = useImageStore();

  const { compress, cancel, isCompressing, canCompress } = useCompression();

  const [expandedSections, setExpandedSections] = useState([0]); // Format section open by default

  const formatOptions = [
    { value: 'original', label: 'Keep Original' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'gif', label: 'GIF' },
  ];

  return (
    <VStack h="full" spacing={0} bg={bgColor}>
      {/* Header */}
      <Box w="full" p={4} borderBottomWidth="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold">
          Compression Settings
        </Text>
      </Box>

      {/* Settings */}
      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          {/* Quick Actions */}
          {originalImage && (
            <VStack spacing={3}>
              <Button
                leftIcon={<FiPlay />}
                colorScheme="brand"
                size="sm"
                w="full"
                onClick={compress}
                isLoading={isCompressing}
                isDisabled={!canCompress}
                loadingText="Compressing..."
              >
                Compress Image
              </Button>

              {estimatedSize && (
                <HStack w="full" justify="space-between" fontSize="sm">
                  <Text color="surface.500">Estimated size:</Text>
                  <Badge colorScheme="purple">{formatBytes(estimatedSize)}</Badge>
                </HStack>
              )}
            </VStack>
          )}

          <Divider />

          {/* Accordion Settings */}
          <Accordion allowMultiple index={expandedSections} onChange={setExpandedSections}>
            {/* Format & Quality */}
            <AccordionItem border="none">
              <AccordionButton px={0}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="medium">Format & Quality</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={0} pb={4}>
                <VStack spacing={4} align="stretch">
                  {/* Format Selection */}
                  <FormControl>
                    <HStack justify="space-between" mb={2}>
                      <FormLabel mb={0}>Output Format</FormLabel>
                      <Tooltip
                        label="Choose the output format. 'Keep Original' maintains the source format."
                        hasArrow
                      >
                        <Icon as={FiInfo} color="surface.400" boxSize={4} />
                      </Tooltip>
                    </HStack>
                    <Select
                      value={currentSettings.format}
                      onChange={(e) => updateSettings({ format: e.target.value })}
                      size="sm"
                    >
                      {formatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Quality Slider */}
                  <FormControl>
                    <HStack justify="space-between" mb={2}>
                      <FormLabel mb={0}>Quality: {currentSettings.quality}%</FormLabel>
                      <Tooltip
                        label="Higher quality means larger file size. 85% is usually a good balance."
                        hasArrow
                      >
                        <Icon as={FiInfo} color="surface.400" boxSize={4} />
                      </Tooltip>
                    </HStack>
                    <Slider
                      value={currentSettings.quality}
                      onChange={(value) => updateSettings({ quality: value })}
                      min={0}
                      max={100}
                      step={1}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <HStack justify="space-between" mt={1}>
                      <Text fontSize="xs" color="surface.500">Low</Text>
                      <Text fontSize="xs" color="surface.500">High</Text>
                    </HStack>
                  </FormControl>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Resize Options */}
            <AccordionItem border="none">
              <AccordionButton px={0}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="medium">Resize Options</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={0} pb={4}>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <HStack justify="space-between" mb={2}>
                      <FormLabel mb={0}>Enable Resizing</FormLabel>
                      <Switch
                        isChecked={!!currentSettings.resize}
                        onChange={(e) =>
                          updateSettings({
                            resize: e.target.checked ? { maintainAspectRatio: true } : null
                          })
                        }
                      />
                    </HStack>
                  </FormControl>

                  {currentSettings.resize && (
                    <>
                      <FormControl>
                        <FormLabel>Max Width (px)</FormLabel>
                        <NumberInput
                          value={currentSettings.resize.width || ''}
                          onChange={(_, value) =>
                            updateSettings({
                              resize: { ...currentSettings.resize, width: value || undefined }
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
                          value={currentSettings.resize.height || ''}
                          onChange={(_, value) =>
                            updateSettings({
                              resize: { ...currentSettings.resize, height: value || undefined }
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
                        <HStack justify="space-between">
                          <FormLabel mb={0}>Maintain Aspect Ratio</FormLabel>
                          <Switch
                            isChecked={currentSettings.resize.maintainAspectRatio}
                            onChange={(e) =>
                              updateSettings({
                                resize: {
                                  ...currentSettings.resize,
                                  maintainAspectRatio: e.target.checked
                                }
                              })
                            }
                          />
                        </HStack>
                      </FormControl>
                    </>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Advanced Options */}
            <AccordionItem border="none">
              <AccordionButton px={0}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="medium">Advanced Options</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={0} pb={4}>
                <VStack spacing={4} align="stretch">
                  {/* Format-specific options */}
                  {(currentSettings.format === 'jpeg' || currentSettings.format === 'jpg') && (
                    <FormControl>
                      <HStack justify="space-between">
                        <FormLabel mb={0}>Progressive Encoding</FormLabel>
                        <Tooltip
                          label="Progressive JPEGs load in stages, showing a low-quality preview first"
                          hasArrow
                        >
                          <Box>
                            <Switch
                              isChecked={currentSettings.advanced.progressive}
                              onChange={(e) =>
                                updateSettings({
                                  advanced: { progressive: e.target.checked }
                                })
                              }
                            />
                          </Box>
                        </Tooltip>
                      </HStack>
                    </FormControl>
                  )}

                  {currentSettings.format === 'png' && (
                    <>
                      <FormControl>
                        <HStack justify="space-between">
                          <FormLabel mb={0}>Interlaced (Adam7)</FormLabel>
                          <Tooltip
                            label="Interlaced PNGs load progressively, similar to progressive JPEGs"
                            hasArrow
                          >
                            <Box>
                              <Switch
                                isChecked={currentSettings.advanced.interlaced}
                                onChange={(e) =>
                                  updateSettings({
                                    advanced: { interlaced: e.target.checked }
                                  })
                                }
                              />
                            </Box>
                          </Tooltip>
                        </HStack>
                      </FormControl>

                      <FormControl>
                        <HStack justify="space-between" mb={2}>
                          <FormLabel mb={0}>Optimization Level</FormLabel>
                          <Tooltip
                            label="Higher levels = better compression but slower processing"
                            hasArrow
                          >
                            <Icon as={FiInfo} color="surface.400" boxSize={4} />
                          </Tooltip>
                        </HStack>
                        <Slider
                          value={currentSettings.advanced.optimizationLevel || 3}
                          onChange={(value) =>
                            updateSettings({
                              advanced: { optimizationLevel: value }
                            })
                          }
                          min={0}
                          max={7}
                          step={1}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="surface.500">Fast</Text>
                          <Text fontSize="xs" color="surface.500">Best</Text>
                        </HStack>
                      </FormControl>
                    </>
                  )}

                  {/* General advanced options */}
                  <FormControl>
                    <HStack justify="space-between">
                      <FormLabel mb={0}>Strip Metadata</FormLabel>
                      <Tooltip
                        label="Remove EXIF, IPTC, and other metadata to reduce file size"
                        hasArrow
                      >
                        <Box>
                          <Switch
                            isChecked={currentSettings.advanced.stripMetadata}
                            onChange={(e) =>
                              updateSettings({
                                advanced: { stripMetadata: e.target.checked }
                              })
                            }
                          />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </FormControl>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </Box>

      {/* Footer Actions */}
      <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
        <HStack spacing={2}>
          <Button
            leftIcon={<FiSave />}
            size="sm"
            variant="outline"
            flex={1}
          >
            Save Preset
          </Button>
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            variant="outline"
            flex={1}
            onClick={() => {
              updateSettings({
                format: 'jpeg',
                quality: 85,
                resize: null,
                advanced: {
                  progressive: true,
                  stripMetadata: true,
                  optimizationLevel: 3,
                },
              });
            }}
          >
            Reset
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}
