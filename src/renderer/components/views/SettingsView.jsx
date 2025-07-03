import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  useToast,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  Switch,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Tooltip,
  useColorMode,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import {
  FiSave,
  FiRefreshCw,
  FiMoon,
  FiSun,
  FiCpu,
  FiHardDrive,
  FiInfo,
  FiFolder,
  FiFolderPlus,
} from 'react-icons/fi';
import { useSettingsStore } from '../../stores/settingsStore';

const SettingsView = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [tempPath, setTempPath] = useState('');
  const [outputPath, setOutputPath] = useState('');

  const {
    appSettings,
    compressionSettings,
    updateAppSettings,
    updateCompressionSettings,
    resetSettings,
  } = useSettingsStore();

  const handleSaveSettings = () => {
    // Save settings to persistent storage
    window.api.settings.save({
      app: appSettings,
      compression: compressionSettings,
    });

    toast({
      title: 'Settings saved',
      status: 'success',
      duration: 2000,
    });
  };

  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: 'Settings reset to defaults',
      status: 'info',
      duration: 2000,
    });
  };

  const handleBrowseTempPath = async () => {
    const result = await window.api.dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Temporary Files Directory',
    });

    if (!result.canceled && result.filePaths.length > 0) {
      setTempPath(result.filePaths[0]);
      updateAppSettings({ tempDirectory: result.filePaths[0] });
    }
  };

  const handleBrowseOutputPath = async () => {
    const result = await window.api.dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Default Output Directory',
    });

    if (!result.canceled && result.filePaths.length > 0) {
      setOutputPath(result.filePaths[0]);
      updateAppSettings({ defaultOutputDirectory: result.filePaths[0] });
    }
  };

  return (
    <VStack spacing={6} h="full" p={6}>
      {/* Header */}
      <HStack w="full" justify="space-between">
        <Heading size="lg">Settings</Heading>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            variant="ghost"
            onClick={handleResetSettings}
          >
            Reset
          </Button>
          <Button
            leftIcon={<Icon as={FiSave} />}
            colorScheme="brand"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </HStack>
      </HStack>

      {/* Settings Sections */}
      <Box
        w="full"
        flex={1}
        overflowY="auto"
        pr={2}
      >
        <Accordion allowMultiple defaultIndex={[0, 1]}>
          {/* General Settings */}
          <AccordionItem border="none" mb={4}>
            <AccordionButton
              bg="whiteAlpha.50"
              backdropFilter="blur(10px)"
              borderRadius="xl"
              p={4}
              _hover={{ bg: 'whiteAlpha.100' }}
              _expanded={{ bg: 'whiteAlpha.100' }}
            >
              <Box flex="1" textAlign="left">
                <Text fontSize="lg" fontWeight="semibold">
                  General Settings
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch" mt={4}>
                {/* Theme Toggle */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="theme-toggle" mb="0">
                    Dark Mode
                  </FormLabel>
                  <Spacer />
                  <HStack>
                    <Icon
                      as={colorMode === 'light' ? FiSun : FiMoon}
                      color="brand.400"
                    />
                    <Switch
                      id="theme-toggle"
                      isChecked={colorMode === 'dark'}
                      onChange={toggleColorMode}
                      colorScheme="brand"
                    />
                  </HStack>
                </FormControl>

                {/* Auto-start */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="auto-start" mb="0">
                    Start with Windows
                  </FormLabel>
                  <Switch
                    id="auto-start"
                    isChecked={appSettings.autoStart}
                    onChange={(e) =>
                      updateAppSettings({ autoStart: e.target.checked })
                    }
                    colorScheme="brand"
                  />
                </FormControl>

                {/* Minimize to tray */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="minimize-tray" mb="0">
                    Minimize to System Tray
                  </FormLabel>
                  <Switch
                    id="minimize-tray"
                    isChecked={appSettings.minimizeToTray}
                    onChange={(e) =>
                      updateAppSettings({ minimizeToTray: e.target.checked })
                    }
                    colorScheme="brand"
                  />
                </FormControl>

                {/* Show notifications */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="notifications" mb="0">
                    Show Notifications
                  </FormLabel>
                  <Switch
                    id="notifications"
                    isChecked={appSettings.showNotifications}
                    onChange={(e) =>
                      updateAppSettings({ showNotifications: e.target.checked })
                    }
                    colorScheme="brand"
                  />
                </FormControl>

                {/* Language */}
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={appSettings.language}
                    onChange={(e) =>
                      updateAppSettings({ language: e.target.value })
                    }
                    bg="whiteAlpha.100"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </Select>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Performance Settings */}
          <AccordionItem border="none" mb={4}>
            <AccordionButton
              bg="whiteAlpha.50"
              backdropFilter="blur(10px)"
              borderRadius="xl"
              p={4}
              _hover={{ bg: 'whiteAlpha.100' }}
              _expanded={{ bg: 'whiteAlpha.100' }}
            >
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FiCpu} color="brand.400" />
                  <Text fontSize="lg" fontWeight="semibold">
                    Performance
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch" mt={4}>
                {/* Worker Threads */}
                <FormControl>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <FormLabel mb={0}>Worker Threads</FormLabel>
                      <Tooltip
                        label="Number of parallel compression workers. Higher values speed up batch processing but use more CPU."
                        placement="top"
                      >
                        <Box>
                          <Icon as={FiInfo} color="whiteAlpha.500" />
                        </Box>
                      </Tooltip>
                    </HStack>
                    <Badge colorScheme="brand">{appSettings.workerThreads}</Badge>
                  </HStack>
                  <Slider
                    value={appSettings.workerThreads}
                    onChange={(value) =>
                      updateAppSettings({ workerThreads: value })
                    }
                    min={1}
                    max={navigator.hardwareConcurrency || 8}
                    step={1}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack bg="brand.500" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      1 (Slower)
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      {navigator.hardwareConcurrency || 8} (Faster)
                    </Text>
                  </HStack>
                </FormControl>

                {/* Memory Limit */}
                <FormControl>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <FormLabel mb={0}>Memory Limit per Worker</FormLabel>
                      <Tooltip
                        label="Maximum memory each worker can use. Higher values allow processing larger images."
                        placement="top"
                      >
                        <Box>
                          <Icon as={FiInfo} color="whiteAlpha.500" />
                        </Box>
                      </Tooltip>
                    </HStack>
                    <Badge colorScheme="brand">{appSettings.memoryLimit} MB</Badge>
                  </HStack>
                  <NumberInput
                    value={appSettings.memoryLimit}
                    onChange={(_, value) =>
                      updateAppSettings({ memoryLimit: value })
                    }
                    min={256}
                    max={4096}
                    step={256}
                  >
                    <NumberInputField bg="whiteAlpha.100" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* Hardware Acceleration */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="hw-accel" mb="0">
                    Hardware Acceleration
                  </FormLabel>
                  <Tooltip
                    label="Use GPU acceleration when available for faster processing"
                    placement="top"
                  >
                    <Box>
                      <Icon as={FiInfo} color="whiteAlpha.500" ml={2} />
                    </Box>
                  </Tooltip>
                  <Switch
                    id="hw-accel"
                    isChecked={appSettings.hardwareAcceleration}
                    onChange={(e) =>
                      updateAppSettings({ hardwareAcceleration: e.target.checked })
                    }
                    colorScheme="brand"
                    ml="auto"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Storage Settings */}
          <AccordionItem border="none" mb={4}>
            <AccordionButton
              bg="whiteAlpha.50"
              backdropFilter="blur(10px)"
              borderRadius="xl"
              p={4}
              _hover={{ bg: 'whiteAlpha.100' }}
              _expanded={{ bg: 'whiteAlpha.100' }}
            >
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FiHardDrive} color="brand.400" />
                  <Text fontSize="lg" fontWeight="semibold">
                    Storage
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch" mt={4}>
                {/* Temporary Directory */}
                <FormControl>
                  <FormLabel>Temporary Files Directory</FormLabel>
                  <InputGroup>
                    <Input
                      value={tempPath || appSettings.tempDirectory}
                      onChange={(e) => setTempPath(e.target.value)}
                      placeholder="Default: System temp directory"
                      bg="whiteAlpha.100"
                    />
                    <InputRightElement>
                      <IconButton
                        icon={<Icon as={FiFolder} />}
                        size="sm"
                        variant="ghost"
                        onClick={handleBrowseTempPath}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Default Output Directory */}
                <FormControl>
                  <FormLabel>Default Output Directory</FormLabel>
                  <InputGroup>
                    <Input
                      value={outputPath || appSettings.defaultOutputDirectory}
                      onChange={(e) => setOutputPath(e.target.value)}
                      placeholder="Default: Same as source"
                      bg="whiteAlpha.100"
                    />
                    <InputRightElement>
                      <IconButton
                        icon={<Icon as={FiFolder} />}
                        size="sm"
                        variant="ghost"
                        onClick={handleBrowseOutputPath}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Keep Original Files */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="keep-originals" mb="0">
                    Keep Original Files
                  </FormLabel>
                  <Switch
                    id="keep-originals"
                    isChecked={appSettings.keepOriginals}
                    onChange={(e) =>
                      updateAppSettings({ keepOriginals: e.target.checked })
                    }
                    colorScheme="brand"
                  />
                </FormControl>

                {/* History Limit */}
                <FormControl>
                  <FormLabel>History Limit (days)</FormLabel>
                  <NumberInput
                    value={appSettings.historyLimit}
                    onChange={(_, value) =>
                      updateAppSettings({ historyLimit: value })
                    }
                    min={0}
                    max={365}
                  >
                    <NumberInputField bg="whiteAlpha.100" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                    Set to 0 to keep history forever
                  </Text>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Default Compression Settings */}
          <AccordionItem border="none">
            <AccordionButton
              bg="whiteAlpha.50"
              backdropFilter="blur(10px)"
              borderRadius="xl"
              p={4}
              _hover={{ bg: 'whiteAlpha.100' }}
              _expanded={{ bg: 'whiteAlpha.100' }}
            >
              <Box flex="1" textAlign="left">
                <Text fontSize="lg" fontWeight="semibold">
                  Default Compression Settings
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch" mt={4}>
                <Text fontSize="sm" color="whiteAlpha.600">
                  These settings will be used as defaults for new compressions
                </Text>
                <Divider />
                {/* Reuse the CompressionSettings component content here */}
                <FormControl>
                  <FormLabel>Default Format</FormLabel>
                  <Select
                    value={compressionSettings.format}
                    onChange={(e) =>
                      updateCompressionSettings({ format: e.target.value })
                    }
                    bg="whiteAlpha.100"
                  >
                    <option value="same">Same as Original</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="gif">GIF</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" mb={2}>
                    <FormLabel mb={0}>Default Quality</FormLabel>
                    <Badge colorScheme="brand">{compressionSettings.quality}%</Badge>
                  </HStack>
                  <Slider
                    value={compressionSettings.quality}
                    onChange={(value) =>
                      updateCompressionSettings({ quality: value })
                    }
                    min={1}
                    max={100}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack bg="brand.500" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </VStack>
  );
};

export default SettingsView;
