import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onPoll: () => Promise<void>;
}

/**
 * Hook for automatic data polling
 * Polls data at regular intervals when enabled
 */
export function usePolling({ enabled = true, interval = 30000, onPoll }: UsePollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const poll = useCallback(async () => {
    if (isPollingRef.current) return; // Prevent overlapping polls
    
    isPollingRef.current = true;
    try {
      await onPoll();
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      isPollingRef.current = false;
    }
  }, [onPoll]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    intervalRef.current = setInterval(poll, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, poll]);

  return { poll };
}

/**
 * Hook for visibility-based polling
 * Only polls when tab is visible
 */
export function useVisibilityPolling({ interval = 30000, onPoll }: Omit<UsePollingOptions, 'enabled'>) {
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      // Poll immediately when tab becomes visible
      if (!document.hidden) {
        onPoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onPoll]);

  usePolling({ enabled: isVisibleRef.current, interval, onPoll });
}
