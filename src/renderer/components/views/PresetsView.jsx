import React, { useState } from 'react';
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
} from 'react-icons/fi';
import { useSettingsStore } from '../../stores/settingsStore';
import { useImageStore } from '../../stores/imageStore';
import { useBatchStore } from '../../stores/batchStore';
import { useAppStore } from '../../stores/appStore';

const defaultPresets = [
  {
    id: 'web-optimized',
    name: 'Web Optimized',
    description: 'Best for website images with good quality',
    settings: {
      format: 'jpeg',
      quality: 85,
      resize: { maxWidth: 1920 },
      advanced: { progressive: true, stripMetadata: true },
    },
    icon: '🌐',
    isDefault: true,
    usageCount: 0,
  },
  {
    id: 'email-attachment',
    name: 'Email Attachment',
    description: 'Reduce file size for email compatibility',
    settings: {
      format: 'jpeg',
      quality: 70,
      resize: { maxWidth: 1024 },
      advanced: { stripMetadata: true },
    },
    icon: '📧',
    isDefault: true,
    usageCount: 0,
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Optimized for social media platforms',
    settings: {
      format: 'jpeg',
      quality: 90,
      resize: { maxWidth: 2048 },
      advanced: { progressive: true },
    },
    icon: '📱',
    isDefault: true,
    usageCount: 0,
  },
  {
    id: 'high-quality',
    name: 'High Quality',
    description: 'Minimal compression for best quality',
    settings: {
      format: 'original',
      quality: 95,
      advanced: { stripMetadata: false },
    },
    icon: '✨',
    isDefault: true,
    usageCount: 0,
  },
];

export function PresetsView () {
  const bgColor = useColorModeValue('white', 'surface.700');
  const cardBg = useColorModeValue('surface.50', 'surface.600');
  const borderColor = useColorModeValue('surface.200', 'surface.600');

  const [presets, setPresets] = useState(defaultPresets);
  const [editingPreset, setEditingPreset] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { updateSettings: updateImageSettings } = useImageStore();
  const { updateBatchSettings } = useBatchStore();
  const { addNotification, activeView } = useAppStore();

  const handleApplyPreset = (preset) => {
    if (activeView === 'drop') {
      updateImageSettings(preset.settings);
    } else if (activeView === 'batch') {
      updateBatchSettings({
        quality: preset.settings.quality,
        outputFormat: preset.settings.format,
        resize: preset.settings.resize,
      });
    }

    // Update usage count
    setPresets(presets.map(p =>
      p.id === preset.id
        ? { ...p, usageCount: p.usageCount + 1 }
        : p
    ));

    addNotification({
      type: 'success',
      title: `Applied "${preset.name}" preset`,
      duration: 3000,
    });
  };

  const handleCreatePreset = () => {
    setEditingPreset({
      id: Date.now().toString(),
      name: '',
      description: '',
      settings: {
        format: 'jpeg',
        quality: 85,
        advanced: {},
      },
      icon: '⚙️',
      isDefault: false,
      usageCount: 0,
    });
    onOpen();
  };

  const handleEditPreset = (preset) => {
    setEditingPreset(preset);
    onOpen();
  };

  const handleDeletePreset = (presetId) => {
    setPresets(presets.filter(p => p.id !== presetId));
    addNotification({
      type: 'info',
      title: 'Preset deleted',
      duration: 3000,
    });
  };

  const handleDuplicatePreset = (preset) => {
    const newPreset = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
      isDefault: false,
      usageCount: 0,
    };
    setPresets([...presets, newPreset]);
    addNotification({
      type: 'success',
      title: 'Preset duplicated',
      duration: 3000,
    });
  };

  const handleSavePreset = (presetData) => {
    if (presets.find(p => p.id === presetData.id)) {
      // Update existing
      setPresets(presets.map(p =>
        p.id === presetData.id ? presetData : p
      ));
    } else {
      // Create new
      setPresets([...presets, presetData]);
    }
    onClose();
    addNotification({
      type: 'success',
      title: 'Preset saved',
      duration: 3000,
    });
  };

  return (
    <Box h="full" p={6} overflow="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text fontSize="2xl" fontWeight="bold">Compression Presets</Text>
            <Text fontSize="sm" color="surface.500">
              Save and manage your favorite compression settings
            </Text>
          </VStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<FiUpload />}
              size="sm"
              variant="outline"
            >
              Import
            </Button>
            <Button
              leftIcon={<FiDownload />}
              size="sm"
              variant="outline"
            >
              Export
            </Button>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              colorScheme="brand"
              onClick={handleCreatePreset}
            >
              Create Preset
            </Button>
          </HStack>
        </HStack>

        {/* Presets Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          {presets.map((preset) => (
            <Card
              key={preset.id}
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <HStack>
                      <Text fontSize="2xl">{preset.icon}</Text>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{preset.name}</Text>
                        {preset.usageCount > 0 && (
                          <HStack spacing={1}>
                            <Icon as={FiStar} boxSize={3} color="yellow.400" />
                            <Text fontSize="xs" color="surface.500">
                              Used {preset.usageCount}x
                            </Text>
                          </HStack>
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
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>

                  <Text fontSize="sm" color="surface.500" noOfLines={2}>
                    {preset.description}
                  </Text>

                  <HStack spacing={2} flexWrap="wrap">
                    <Badge>{preset.settings.format.toUpperCase()}</Badge>
                    <Badge colorScheme="purple">{preset.settings.quality}%</Badge>
                    {preset.settings.resize && (
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
                  >
                    Apply Preset
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Edit/Create Preset Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingPreset?.isDefault === false && editingPreset?.name
              ? 'Edit Preset'
              : 'Create New Preset'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={editingPreset?.name || ''}
                  onChange={(e) => setEditingPreset({
                    ...editingPreset,
                    name: e.target.value,
                  })}
                  placeholder="e.g., Web Optimized"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editingPreset?.description || ''}
                  onChange={(e) => setEditingPreset({
                    ...editingPreset,
                    description: e.target.value,
                  })}
                  placeholder="Describe when to use this preset..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Icon</FormLabel>
                <Input
                  value={editingPreset?.icon || ''}
                  onChange={(e) => setEditingPreset({
                    ...editingPreset,
                    icon: e.target.value,
                  })}
                  placeholder="Enter an emoji"
                  maxLength={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={() => handleSavePreset(editingPreset)}
              isDisabled={!editingPreset?.name}
            >
              Save Preset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
