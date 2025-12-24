import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface EventUpdateContextType {
  // Trigger event list refresh across all components
  triggerEventRefresh: () => void;
  triggerMessageRefresh: () => void;
  triggerNotificationRefresh: () => void;
  
  // Subscribe to updates
  onEventUpdate: (callback: () => void) => () => void;
  onMessageUpdate: (callback: () => void) => () => void;
  onNotificationUpdate: (callback: () => void) => () => void;
}

const EventUpdateContext = createContext<EventUpdateContextType | undefined>(undefined);

export function EventUpdateProvider({ children }: { children: ReactNode }) {
  const [eventListeners, setEventListeners] = useState<Set<() => void>>(new Set());
  const [messageListeners, setMessageListeners] = useState<Set<() => void>>(new Set());
  const [notificationListeners, setNotificationListeners] = useState<Set<() => void>>(new Set());

  // Event updates
  const triggerEventRefresh = useCallback(() => {
    eventListeners.forEach(callback => callback());
  }, [eventListeners]);

  const onEventUpdate = useCallback((callback: () => void) => {
    setEventListeners(prev => new Set(prev).add(callback));
    return () => {
      setEventListeners(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Message updates
  const triggerMessageRefresh = useCallback(() => {
    messageListeners.forEach(callback => callback());
  }, [messageListeners]);

  const onMessageUpdate = useCallback((callback: () => void) => {
    setMessageListeners(prev => new Set(prev).add(callback));
    return () => {
      setMessageListeners(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Notification updates
  const triggerNotificationRefresh = useCallback(() => {
    notificationListeners.forEach(callback => callback());
  }, [notificationListeners]);

  const onNotificationUpdate = useCallback((callback: () => void) => {
    setNotificationListeners(prev => new Set(prev).add(callback));
    return () => {
      setNotificationListeners(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  return (
    <EventUpdateContext.Provider
      value={{
        triggerEventRefresh,
        triggerMessageRefresh,
        triggerNotificationRefresh,
        onEventUpdate,
        onMessageUpdate,
        onNotificationUpdate,
      }}
    >
      {children}
    </EventUpdateContext.Provider>
  );
}

export function useEventUpdates() {
  const context = useContext(EventUpdateContext);
  if (!context) {
    throw new Error('useEventUpdates must be used within EventUpdateProvider');
  }
  return context;
}
