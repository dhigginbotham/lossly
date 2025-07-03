import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useAppStore } from '../../stores/appStore';
import CompressionView from '../views/CompressionView';
import BatchView from '../views/BatchView';
import ConversionView from '../views/ConversionView';
import HistoryView from '../views/HistoryView';
import SettingsView from '../views/SettingsView';

export function MainContent () {
  const { activeView } = useAppStore();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const renderView = () => {
    switch (activeView) {
      case 'compression':
        return <CompressionView />;
      case 'batch':
        return <BatchView />;
      case 'conversion':
        return <ConversionView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CompressionView />;
    }
  };

  return (
    <Box
      h="full"
      bg={bgColor}
      overflow="auto"
      position="relative"
    >
      {renderView()}
    </Box>
  );
}
