import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';

export const useAppStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        // UI State
        activeView: 'drop',
        sidebarCollapsed: false,
        theme: 'dark',

        // Application State
        isProcessing: false,
        currentOperation: null,
        notifications: [],

        // System State
        cpuUsage: 0,
        memoryUsage: 0,
        activeWorkers: 0,

        // Actions
        setActiveView: (view) =>
          set((state) => {
            state.activeView = view;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        setSidebarCollapsed: (collapsed) =>
          set((state) => {
            state.sidebarCollapsed = collapsed;
          }),

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
            window.electron.setTheme(theme);
          }),

        setProcessing: (isProcessing, operation = null) =>
          set((state) => {
            state.isProcessing = isProcessing;
            state.currentOperation = operation;
          }),

        addNotification: (notification) =>
          set((state) => {
            const newNotification = {
              id: notification.id || uuidv4(),
              type: notification.type || 'info',
              title: notification.title,
              message: notification.message,
              duration: notification.duration || 5000,
              timestamp: Date.now(),
            };

            state.notifications.push(newNotification);

            // Auto-remove after duration
            if (newNotification.duration && newNotification.duration > 0) {
              setTimeout(() => {
                useAppStore.getState().removeNotification(newNotification.id);
              }, newNotification.duration);
            }
          }),

        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(
              (n) => n.id !== id
            );
          }),

        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        updateSystemStats: (stats) =>
          set((state) => {
            state.cpuUsage = stats.cpu || state.cpuUsage;
            state.memoryUsage = stats.memory || state.memoryUsage;
            state.activeWorkers = stats.workers || state.activeWorkers;
          }),
      }))
    ),
    {
      name: 'app-store',
    }
  )
);

// Selectors
export const selectIsProcessing = (state) => state.isProcessing;
export const selectActiveNotifications = (state) =>
  state.notifications.filter((n) => Date.now() - n.timestamp < 30000);
export const selectSystemHealth = (state) => ({
  cpu: state.cpuUsage,
  memory: state.memoryUsage,
  workers: state.activeWorkers,
});
