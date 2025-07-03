import React from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Text,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Button,
  Divider,
} from '@chakra-ui/react';
import { FiInfo, FiSave, FiRefreshCw } from 'react-icons/fi';
import { useSettingsStore } from '../../stores/settingsStore';

const CompressionSettings = () => {
  const { compressionSettings, updateCompressionSettings, resetSettings } = useSettingsStore();

  const handleFormatChange = (format) => {
    updateCompressionSettings({ format });
  };

  const handleQualityChange = (quality) => {
    updateCompressionSettings({ quality });
  };

  const handleResizeChange = (field, value) => {
    updateCompressionSettings({
      resize: {
        ...compressionSettings.resize,
        [field]: value,
      },
    });
  };

  const handleAdvancedChange = (field, value) => {
    updateCompressionSettings({
      advanced: {
        ...compressionSettings.advanced,
        [field]: value,
      },
    });
  };

  return (
    <Box
      w="full"
      bg="whiteAlpha.50"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      p={6}
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">
            Compression Settings
          </Text>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            size="sm"
            variant="ghost"
            onClick={resetSettings}
          >
            Reset
          </Button>
        </HStack>

        <Divider />

        {/* Basic Settings */}
        <VStack spacing={4} align="stretch">
          {/* Format */}
          <FormControl>
            <FormLabel>Output Format</FormLabel>
            <Select
              value={compressionSettings.format}
              onChange={(e) => handleFormatChange(e.target.value)}
              bg="whiteAlpha.100"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="gif">GIF</option>
              <option value="same">Same as Original</option>
            </Select>
          </FormControl>

          {/* Quality */}
          <FormControl>
            <HStack justify="space-between" mb={2}>
              <FormLabel mb={0}>Quality</FormLabel>
              <Text fontSize="sm" fontWeight="bold" color="brand.400">
                {compressionSettings.quality}%
              </Text>
            </HStack>
            <Slider
              value={compressionSettings.quality}
              onChange={handleQualityChange}
              min={1}
              max={100}
              step={1}
            >
              <SliderTrack bg="whiteAlpha.200">
                <SliderFilledTrack bg="brand.500" />
              </SliderTrack>
              <SliderThumb boxSize={6}>
                <Box color="brand.500" as={FiInfo} boxSize={3} />
              </SliderThumb>
            </Slider>
            <HStack justify="space-between" mt={1}>
              <Text fontSize="xs" color="whiteAlpha.600">
                Lower (smaller file)
              </Text>
              <Text fontSize="xs" color="whiteAlpha.600">
                Higher (better quality)
              </Text>
            </HStack>
          </FormControl>
        </VStack>

        {/* Advanced Settings */}
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton
              px={0}
              _hover={{ bg: 'transparent' }}
              _expanded={{ color: 'brand.400' }}
            >
              <Box flex="1" textAlign="left" fontWeight="medium">
                Advanced Settings
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0} pt={4}>
              <VStack spacing={4} align="stretch">
                {/* Resize Options */}
                <Box
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontWeight="medium" mb={3}>
                    Resize Options
                  </Text>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Max Width</FormLabel>
                        <NumberInput
                          value={compressionSettings.resize.maxWidth || ''}
                          onChange={(_, value) => handleResizeChange('maxWidth', value)}
                          min={0}
                          max={10000}
                          size="sm"
                        >
                          <NumberInputField
                            bg="whiteAlpha.100"
                            placeholder="Auto"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Max Height</FormLabel>
                        <NumberInput
                          value={compressionSettings.resize.maxHeight || ''}
                          onChange={(_, value) => handleResizeChange('maxHeight', value)}
                          min={0}
                          max={10000}
                          size="sm"
                        >
                          <NumberInputField
                            bg="whiteAlpha.100"
                            placeholder="Auto"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </HStack>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="maintain-aspect" mb="0" fontSize="sm">
                        Maintain Aspect Ratio
                      </FormLabel>
                      <Switch
                        id="maintain-aspect"
                        isChecked={compressionSettings.resize.maintainAspectRatio}
                        onChange={(e) =>
                          handleResizeChange('maintainAspectRatio', e.target.checked)
                        }
                        colorScheme="brand"
                      />
                    </FormControl>
                  </VStack>
                </Box>

                {/* Format-specific Options */}
                <Box
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontWeight="medium" mb={3}>
                    Format Options
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {/* JPEG/WebP Progressive */}
                    {(compressionSettings.format === 'jpeg' ||
                      compressionSettings.format === 'webp') && (
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="progressive" mb="0" fontSize="sm">
                            Progressive Encoding
                          </FormLabel>
                          <Tooltip
                            label="Progressive images load in layers, showing a low-quality preview first"
                            placement="top"
                          >
                            <Box>
                              <Icon as={FiInfo} color="whiteAlpha.500" ml={2} />
                            </Box>
                          </Tooltip>
                          <Switch
                            id="progressive"
                            isChecked={compressionSettings.advanced.progressive}
                            onChange={(e) =>
                              handleAdvancedChange('progressive', e.target.checked)
                            }
                            colorScheme="brand"
                            ml="auto"
                          />
                        </FormControl>
                      )}

                    {/* PNG Optimization Level */}
                    {compressionSettings.format === 'png' && (
                      <FormControl>
                        <HStack justify="space-between" mb={2}>
                          <HStack>
                            <FormLabel mb={0} fontSize="sm">
                              Optimization Level
                            </FormLabel>
                            <Tooltip
                              label="Higher levels produce smaller files but take longer"
                              placement="top"
                            >
                              <Box>
                                <Icon as={FiInfo} color="whiteAlpha.500" />
                              </Box>
                            </Tooltip>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold" color="brand.400">
                            {compressionSettings.advanced.optimizationLevel}
                          </Text>
                        </HStack>
                        <Slider
                          value={compressionSettings.advanced.optimizationLevel}
                          onChange={(value) =>
                            handleAdvancedChange('optimizationLevel', value)
                          }
                          min={0}
                          max={7}
                          step={1}
                        >
                          <SliderTrack bg="whiteAlpha.200">
                            <SliderFilledTrack bg="brand.500" />
                          </SliderTrack>
                          <SliderThumb boxSize={5} />
                        </Slider>
                      </FormControl>
                    )}

                    {/* Metadata Options */}
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="strip-metadata" mb="0" fontSize="sm">
                        Strip Metadata
                      </FormLabel>
                      <Tooltip
                        label="Remove EXIF data, color profiles, and other metadata"
                        placement="top"
                      >
                        <Box>
                          <Icon as={FiInfo} color="whiteAlpha.500" ml={2} />
                        </Box>
                      </Tooltip>
                      <Switch
                        id="strip-metadata"
                        isChecked={compressionSettings.advanced.stripMetadata}
                        onChange={(e) =>
                          handleAdvancedChange('stripMetadata', e.target.checked)
                        }
                        colorScheme="brand"
                        ml="auto"
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  );
};

export default CompressionSettings;
