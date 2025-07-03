import React from 'react';
import {
  Box,
  VStack,
  IconButton,
  Tooltip,
  Text,
  Divider,
  useColorModeValue,
  useColorMode,
  Flex,
  Icon,
  Badge,
} from '@chakra-ui/react';
import {
  FiImage,
  FiLayers,
  FiClock,
  FiSettings,
  FiMenu,
  FiMoon,
  FiSun,
  FiPackage,
} from 'react-icons/fi';
import { useAppStore } from '../../stores/appStore';
import { useBatchStore } from '../../stores/batchStore';

export function Sidebar () {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar } = useAppStore();
  const { batchItems } = useBatchStore();
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue('white', 'surface.700');
  const borderColor = useColorModeValue('surface.200', 'surface.600');
  const hoverBg = useColorModeValue('surface.100', 'surface.600');
  const activeColor = 'brand.400';

  const pendingBatchCount = batchItems && batchItems.filter(item => item.status === 'pending').length || 0;

  const menuItems = [
    {
      id: 'drop',
      icon: FiImage,
      label: 'Compress',
      tooltip: 'Single image compression',
    },
    {
      id: 'batch',
      icon: FiLayers,
      label: 'Batch',
      tooltip: 'Batch processing',
      badge: pendingBatchCount > 0 ? pendingBatchCount : null,
    },
    {
      id: 'history',
      icon: FiClock,
      label: 'History',
      tooltip: 'Compression history',
    },
    {
      id: 'presets',
      icon: FiPackage,
      label: 'Presets',
      tooltip: 'Manage presets',
    },
  ];

  const SidebarItem = ({ item }) => {
    const isActive = activeView === item.id;

    return (
      <Tooltip
        label={item.tooltip}
        placement="right"
        isDisabled={!sidebarCollapsed}
        hasArrow
      >
        <Flex
          align="center"
          gap={3}
          p={3}
          cursor="pointer"
          borderRadius="lg"
          bg={isActive ? activeColor : 'transparent'}
          color={isActive ? 'white' : 'inherit'}
          _hover={{
            bg: isActive ? activeColor : hoverBg,
          }}
          onClick={() => setActiveView(item.id)}
          position="relative"
          transition="all 0.2s"
          w="full"
        >
          <Icon
            as={item.icon}
            boxSize={5}
            flexShrink={0}
          />
          {!sidebarCollapsed && (
            <>
              <Text fontSize="sm" fontWeight="medium">
                {item.label}
              </Text>
              {item.badge && (
                <Badge
                  colorScheme="accent"
                  ml="auto"
                  borderRadius="full"
                  px={2}
                  fontSize="xs"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Flex>
      </Tooltip>
    );
  };

  return (
    <Box
      as="nav"
      h="full"
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      className="no-select"
      transition="all 0.2s"
    >
      <VStack h="full" spacing={0}>
        {/* Header */}
        <Flex
          w="full"
          p={3}
          align="center"
          justify={sidebarCollapsed ? 'center' : 'space-between'}
        >
          {!sidebarCollapsed && (
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.400, accent.400)"
              bgClip="text"
            >
              Lossly
            </Text>
          )}
          <IconButton
            icon={<FiMenu />}
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          />
        </Flex>

        <Divider />

        {/* Navigation Items */}
        <VStack
          flex={1}
          w="full"
          p={3}
          spacing={2}
          align="stretch"
        >
          {menuItems.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </VStack>

        <Divider />

        {/* Bottom Actions */}
        <VStack w="full" p={3} spacing={2}>
          <Tooltip
            label="Settings"
            placement="right"
            isDisabled={!sidebarCollapsed}
            hasArrow
          >
            <Flex
              align="center"
              gap={3}
              p={3}
              cursor="pointer"
              borderRadius="lg"
              _hover={{ bg: hoverBg }}
              onClick={() => setActiveView('settings')}
              w="full"
            >
              <Icon as={FiSettings} boxSize={5} />
              {!sidebarCollapsed && (
                <Text fontSize="sm" fontWeight="medium">
                  Settings
                </Text>
              )}
            </Flex>
          </Tooltip>

          <Tooltip
            label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            placement="right"
            isDisabled={!sidebarCollapsed}
            hasArrow
          >
            <IconButton
              icon={colorMode === 'dark' ? <FiSun /> : <FiMoon />}
              variant="ghost"
              onClick={toggleColorMode}
              aria-label="Toggle color mode"
              w={sidebarCollapsed ? 'auto' : 'full'}
              justifyContent={sidebarCollapsed ? 'center' : 'flex-start'}
            />
          </Tooltip>
        </VStack>
      </VStack>
    </Box>
  );
}
