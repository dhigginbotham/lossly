import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Tooltip,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Heading,
  useToast,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiMoreVertical,
  FiStar,
  FiDownload,
  FiUpload,
  FiSettings,
  FiCheck,
} from 'react-icons/fi';
import { useSettingsStore } from '../../stores/settingsStore';

const defaultPresets = [
  {
    id: 'web-optimized',
    name: 'Web Optimized',
    description: 'Best for website images with good quality and reasonable file size',
    settings: {
      format: 'jpeg',
      quality: 85,
      resize: { maxWidth: 1920, maxHeight: null, maintainAspectRatio: true },
      advanced: { progressive: true, stripMetadata: true, optimizationLevel: 3 },
    },
    icon: '🌐',
    isDefault: true,
  },
  {
    id: 'email-attachment',
    name: 'Email Attachment',
    description: 'Reduce file size for email compatibility (under 25MB)',
    settings: {
      format: 'jpeg',
      quality: 70,
      resize: { maxWidth: 1024, maxHeight: null, maintainAspectRatio: true },
      advanced: { progressive: false, stripMetadata: true, optimizationLevel: 6 },
    },
    icon: '📧',
    isDefault: true,
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Optimized for social media platforms with high quality',
    settings: {
      format: 'jpeg',
      quality: 90,
      resize: { maxWidth: 2048, maxHeight: null, maintainAspectRatio: true },
      advanced: { progressive: true, stripMetadata: true, optimizationLevel: 3 },
    },
    icon: '📱',
    isDefault: true,
  },
  {
    id: 'high-quality',
    name: 'High Quality',
    description: 'Minimal compression for maximum quality retention',
    settings: {
      format: 'same',
      quality: 95,
      resize: { maxWidth: null, maxHeight: null, maintainAspectRatio: true },
      advanced: { progressive: true, stripMetadata: false, optimizationLevel: 1 },
    },
    icon: '✨',
    isDefault: true,
  },
];

export default function PresetsView () {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [editingPreset, setEditingPreset] = useState(null);
  const [deletePresetId, setDeletePresetId] = useState(null);
  const cancelRef = React.useRef();

  const {
    presets,
    compressionSettings,
    addPreset,
    removePreset,
    updatePreset,
    updateCompressionSettings,
    loadSettings,
    saveSettings,
  } = useSettingsStore();

  // Combined presets (default + user created)
  const allPresets = [...defaultPresets, ...presets];

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleApplyPreset = async (preset) => {
    try {
      updateCompressionSettings(preset.settings);
      await saveSettings();

      toast({
        title: 'Preset Applied',
        description: `"${preset.name}" settings have been applied`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply preset',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCreatePreset = () => {
    setEditingPreset({
      id: '',
      name: '',
      description: '',
      settings: { ...compressionSettings },
      icon: '⚙️',
      isDefault: false,
    });
    onOpen();
  };

  const handleEditPreset = (preset) => {
    setEditingPreset({ ...preset });
    onOpen();
  };

  const handleDeletePreset = (presetId) => {
    setDeletePresetId(presetId);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      removePreset(deletePresetId);
      await saveSettings();

      toast({
        title: 'Preset Deleted',
        status: 'info',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete preset',
        status: 'error',
        duration: 3000,
      });
    }

    onDeleteClose();
    setDeletePresetId(null);
  };

  const handleDuplicatePreset = async (preset) => {
    try {
      const newPreset = {
        name: `${preset.name} (Copy)`,
        description: preset.description,
        settings: { ...preset.settings },
        icon: preset.icon,
      };

      addPreset(newPreset);
      await saveSettings();

      toast({
        title: 'Preset Duplicated',
        description: `Created "${newPreset.name}"`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate preset',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSavePreset = async () => {
    if (!editingPreset?.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a preset name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      if (editingPreset.id) {
        // Update existing
        updatePreset(editingPreset.id, editingPreset);
      } else {
        // Create new
        addPreset({
          name: editingPreset.name,
          description: editingPreset.description,
          settings: editingPreset.settings,
          icon: editingPreset.icon,
        });
      }

      await saveSettings();

      toast({
        title: 'Preset Saved',
        description: `"${editingPreset.name}" has been saved`,
        status: 'success',
        duration: 3000,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preset',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const updateEditingPreset = (field, value) => {
    setEditingPreset(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEditingSettings = (field, value) => {
    setEditingPreset(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const updateEditingAdvanced = (field, value) => {
    setEditingPreset(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        advanced: {
          ...prev.settings.advanced,
          [field]: value,
        },
      },
    }));
  };

  const updateEditingResize = (field, value) => {
    setEditingPreset(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        resize: {
          ...prev.settings.resize,
          [field]: value,
        },
      },
    }));
  };

  return (
    <Box h="full" p={6} overflow="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Compression Presets</Heading>
            <Text fontSize="sm" color="whiteAlpha.700">
              Save and manage your favorite compression settings
            </Text>
          </VStack>

          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={handleCreatePreset}
          >
            Create Preset
          </Button>
        </HStack>

        {/* Presets Grid */}
        {allPresets.length === 0 ? (
          <Center h="300px">
            <VStack spacing={4}>
              <Icon as={FiSettings} boxSize={16} color="whiteAlpha.300" />
              <Text color="whiteAlpha.500">No presets available</Text>
              <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreatePreset}>
                Create Your First Preset
              </Button>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
            {allPresets.map((preset) => (
              <Card
                key={preset.id}
                bg="whiteAlpha.50"
                backdropFilter="blur(10px)"
                borderWidth="1px"
                borderColor="whiteAlpha.200"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Text fontSize="2xl">{preset.icon}</Text>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">{preset.name}</Text>
                          {preset.isDefault && (
                            <Badge size="sm" colorScheme="blue">
                              Default
                            </Badge>
                          )}
                        </VStack>
                      </HStack>

                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          size="sm"
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEdit2 />}
                            onClick={() => handleEditPreset(preset)}
                            isDisabled={preset.isDefault}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<FiCopy />}
                            onClick={() => handleDuplicatePreset(preset)}
                          >
                            Duplicate
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => handleDeletePreset(preset.id)}
                            isDisabled={preset.isDefault}
                            color="red.400"
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>

                    <Text fontSize="sm" color="whiteAlpha.600" noOfLines={3}>
                      {preset.description}
                    </Text>

                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="purple">
                        {preset.settings.format === 'same' ? 'Original' : preset.settings.format.toUpperCase()}
                      </Badge>
                      <Badge colorScheme="green">{preset.settings.quality}%</Badge>
                      {preset.settings.resize?.maxWidth && (
                        <Badge colorScheme="blue">
                          ↔ {preset.settings.resize.maxWidth}px
                        </Badge>
                      )}
                    </HStack>

                    <Button
                      size="sm"
                      colorScheme="brand"
                      onClick={() => handleApplyPreset(preset)}
                      w="full"
                      leftIcon={<FiCheck />}
                    >
                      Apply Preset
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Edit/Create Preset Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.900" borderColor="whiteAlpha.200" borderWidth="1px">
          <ModalHeader>
            {editingPreset?.id ? 'Edit Preset' : 'Create New Preset'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              {/* Basic Info */}
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Preset Name</FormLabel>
                  <Input
                    value={editingPreset?.name || ''}
                    onChange={(e) => updateEditingPreset('name', e.target.value)}
                    placeholder="e.g., Web Optimized"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Icon</FormLabel>
                  <Input
                    value={editingPreset?.icon || ''}
                    onChange={(e) => updateEditingPreset('icon', e.target.value)}
                    placeholder="Enter an emoji"
                    maxLength={2}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editingPreset?.description || ''}
                  onChange={(e) => updateEditingPreset('description', e.target.value)}
                  placeholder="Describe when to use this preset..."
                  rows={2}
                />
              </FormControl>

              {/* Compression Settings */}
              <Box w="full">
                <Text fontWeight="bold" mb={4}>Compression Settings</Text>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Output Format</FormLabel>
                    <Select
                      value={editingPreset?.settings?.format || 'same'}
                      onChange={(e) => updateEditingSettings('format', e.target.value)}
                    >
                      <option value="same">Same as Original</option>
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                      <option value="gif">GIF</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Quality (%)</FormLabel>
                    <NumberInput
                      value={editingPreset?.settings?.quality || 85}
                      onChange={(value) => updateEditingSettings('quality', parseInt(value))}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Max Width (px)</FormLabel>
                    <NumberInput
                      value={editingPreset?.settings?.resize?.maxWidth || ''}
                      onChange={(value) => updateEditingResize('maxWidth', value ? parseInt(value) : null)}
                      min={1}
                    >
                      <NumberInputField placeholder="No limit" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Max Height (px)</FormLabel>
                    <NumberInput
                      value={editingPreset?.settings?.resize?.maxHeight || ''}
                      onChange={(value) => updateEditingResize('maxHeight', value ? parseInt(value) : null)}
                      min={1}
                    >
                      <NumberInputField placeholder="No limit" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Advanced Settings */}
                <Text fontWeight="bold" mt={6} mb={4}>Advanced Settings</Text>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text>Progressive Encoding</Text>
                    <Switch
                      isChecked={editingPreset?.settings?.advanced?.progressive || false}
                      onChange={(e) => updateEditingAdvanced('progressive', e.target.checked)}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <Text>Strip Metadata</Text>
                    <Switch
                      isChecked={editingPreset?.settings?.advanced?.stripMetadata || false}
                      onChange={(e) => updateEditingAdvanced('stripMetadata', e.target.checked)}
                    />
                  </HStack>

                  <HStack justify="space-between">
                    <Text>Maintain Aspect Ratio</Text>
                    <Switch
                      isChecked={editingPreset?.settings?.resize?.maintainAspectRatio !== false}
                      onChange={(e) => updateEditingResize('maintainAspectRatio', e.target.checked)}
                    />
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSavePreset}
              isDisabled={!editingPreset?.name?.trim()}
            >
              Save Preset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.900">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Preset
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this preset? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
