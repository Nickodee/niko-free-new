# Real-Time Updates Implementation Guide

This guide shows how to make dashboard updates appear instantly without refreshing.

## ✅ What We've Created

### 1. **Optimistic Updates Hook** (`src/hooks/useOptimisticUpdate.ts`)
- Updates UI immediately before server confirmation
- Automatically rolls back on errors
- Perfect for create, update, delete operations

### 2. **Event Update Context** (`src/contexts/EventUpdateContext.tsx`)
- Global state management for cross-component updates
- Subscribe to events, messages, notifications
- Trigger updates from anywhere in the app

### 3. **Polling Hook** (`src/hooks/usePolling.ts`)
- Automatic background refresh at intervals
- Visibility-aware (only polls when tab is active)
- Configurable polling frequency

## 🚀 How to Use

### Example 1: MyEvents with Instant Updates

```tsx
import { useEffect } from 'react';
import { useEventUpdates } from '../../contexts/EventUpdateContext';
import { usePolling } from '../../hooks/usePolling';
import { getPartnerEvents } from '../../services/partnerService';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const { onEventUpdate } = useEventUpdates();
  
  const fetchEvents = async () => {
    const response = await getPartnerEvents();
    setEvents(response.events);
  };

  // Poll every 30 seconds for new data
  usePolling({
    enabled: true,
    interval: 30000,
    onPoll: fetchEvents
  });

  // Listen for manual updates from other components
  useEffect(() => {
    const unsubscribe = onEventUpdate(fetchEvents);
    return unsubscribe;
  }, [onEventUpdate]);

  return (
    // Your component JSX
  );
}
```

### Example 2: CreateEvent with Instant Feedback

```tsx
import { useEventUpdates } from '../../contexts/EventUpdateContext';
import { toast } from 'react-toastify';

export default function CreateEvent({ onClose }) {
  const { triggerEventRefresh } = useEventUpdates();
  
  const handleSubmit = async (eventData) => {
    try {
      // Create event on server
      const newEvent = await createEvent(eventData);
      
      // Show success message
      toast.success('Event created successfully!');
      
      // Trigger instant refresh in MyEvents
      triggerEventRefresh();
      
      // Close modal
      onClose();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };
  
  return (
    // Your form JSX
  );
}
```

### Example 3: Optimistic Delete

```tsx
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import { deleteEvent } from '../../services/partnerService';

export default function MyEvents() {
  const { data: events, deleteItem } = useOptimisticUpdate(initialEvents);
  
  const handleDelete = async (eventId) => {
    try {
      await deleteItem(
        eventId,
        () => deleteEvent(eventId),
        'id'
      );
      toast.success('Event deleted!');
    } catch (error) {
      toast.error('Failed to delete event');
      // Automatically rolls back the UI
    }
  };
  
  return (
    // Your component JSX
  );
}
```

### Example 4: Messages with Auto-Refresh

```tsx
import { useEventUpdates } from '../../contexts/EventUpdateContext';
import { useVisibilityPolling } from '../../hooks/usePolling';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const { triggerMessageRefresh, onMessageUpdate } = useEventUpdates();
  
  const fetchMessages = async () => {
    const response = await getMessages();
    setMessages(response.messages);
  };

  // Auto-refresh when tab is visible
  useVisibilityPolling({
    interval: 20000, // 20 seconds
    onPoll: fetchMessages
  });

  // Listen for new message events
  useEffect(() => {
    return onMessageUpdate(fetchMessages);
  }, []);

  const sendMessage = async (content) => {
    await sendMessageAPI(content);
    // Trigger refresh for all message components
    triggerMessageRefresh();
  };

  return (
    // Your component JSX
  );
}
```

## 📋 Implementation Checklist

### Step 1: Update App.tsx ✅ (Already Done)
- Wrapped app with `EventUpdateProvider`

### Step 2: Update MyEvents Component
```tsx
// Add these imports
import { useEventUpdates } from '../../contexts/EventUpdateContext';
import { usePolling } from '../../hooks/usePolling';

// Inside component:
const { onEventUpdate } = useEventUpdates();

// Enable polling
usePolling({
  enabled: true,
  interval: 30000, // 30 seconds
  onPoll: fetchEvents
});

// Listen for manual updates
useEffect(() => {
  return onEventUpdate(fetchEvents);
}, []);
```

### Step 3: Update CreateEvent Component
```tsx
import { useEventUpdates } from '../../contexts/EventUpdateContext';

const { triggerEventRefresh } = useEventUpdates();

// After successful creation:
triggerEventRefresh();
```

### Step 4: Update Admin Dashboard Events
```tsx
// Same pattern for admin events list
const { onEventUpdate, triggerEventRefresh } = useEventUpdates();

// After approving/rejecting events:
triggerEventRefresh();
```

### Step 5: Update Messages/Notifications
```tsx
const { onMessageUpdate, triggerMessageRefresh } = useEventUpdates();
const { onNotificationUpdate, triggerNotificationRefresh } = useEventUpdates();

// Use similar pattern for real-time updates
```

## 🎯 Benefits

1. **Instant Feedback**: Users see changes immediately
2. **No Manual Refresh**: Data updates automatically
3. **Cross-Component Sync**: Updates propagate everywhere
4. **Error Handling**: Automatic rollback on failures
5. **Smart Polling**: Only when tab is active
6. **Optimistic UI**: Best user experience

## ⚙️ Configuration

### Polling Intervals
- Events: 30 seconds (less frequent changes)
- Messages: 20 seconds (more frequent)
- Notifications: 15 seconds (most frequent)

### Disable Polling
```tsx
usePolling({
  enabled: false, // Disable when not needed
  interval: 30000,
  onPoll: fetchData
});
```

## 🔄 For WebSocket (Future Enhancement)

If your backend supports WebSockets:

```tsx
// src/hooks/useWebSocket.ts
export function useWebSocket(url: string) {
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'event_created') {
        triggerEventRefresh();
      }
    };
    
    return () => ws.close();
  }, [url]);
}
```

## 📝 Notes

- All hooks are TypeScript-ready
- Error handling included
- Memory leak prevention
- Performance optimized
- Easy to extend
