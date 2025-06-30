import React, { useEffect } from 'react';
import { Box, Flex, useColorModeValue, useToast } from '@chakra-ui/react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { StatusBar } from './components/layout/StatusBar';
import { NotificationProvider } from './components/common/NotificationProvider';
import { useAppStore } from './stores/appStore';
import { setupStoreSync } from './services/realtimeSync';

function App () {
  const toast = useToast();
  const bgColor = useColorModeValue('surface.50', 'surface.800');
  const { sidebarCollapsed, notifications, removeNotification } = useAppStore();

  // Initialize store synchronization
  useEffect(() => {
    setupStoreSync();
  }, []);

  // Handle notifications
  useEffect(() => {
    notifications.forEach((notification) => {
      if (!toast.isActive(notification.id)) {
        toast({
          id: notification.id,
          title: notification.title,
          description: notification.message,
          status: notification.type,
          duration: notification.duration || 5000,
          isClosable: true,
          position: 'bottom-right',
          onCloseComplete: () => removeNotification(notification.id),
        });
      }
    });
  }, [notifications, toast, removeNotification]);

  // Add platform class to body
  useEffect(() => {
    document.body.classList.add(`platform-${window.electron.platform}`);
  }, []);

  return (
    <NotificationProvider>
      <Flex
        direction="column"
        h="100vh"
        bg={bgColor}
        color={useColorModeValue('surface.900', 'surface.50')}
        overflow="hidden"
      >
        {/* Main Layout */}
        <Flex flex={1} overflow="hidden">
          {/* Sidebar */}
          <Box
            w={sidebarCollapsed ? '60px' : '200px'}
            transition="width 0.2s ease"
            flexShrink={0}
          >
            <Sidebar />
          </Box>

          {/* Main Content Area */}
          <Box flex={1} overflow="hidden">
            <MainContent />
          </Box>
        </Flex>

        {/* Status Bar */}
        <StatusBar />
      </Flex>
    </NotificationProvider>
  );
}

export default App;
