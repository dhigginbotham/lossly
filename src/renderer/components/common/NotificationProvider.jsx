import React from 'react';
import { Portal } from '@chakra-ui/react';

export function NotificationProvider ({ children }) {
  // This component serves as a placeholder for future notification enhancements
  // Currently, notifications are handled by Chakra UI's toast system in App.jsx

  return (
    <>
      {children}
      <Portal>
        {/* Portal for any custom notification overlays */}
      </Portal>
    </>
  );
}
