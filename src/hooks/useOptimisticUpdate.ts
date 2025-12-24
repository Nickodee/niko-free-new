import { useState, useCallback } from 'react';

/**
 * Custom hook for optimistic UI updates
 * Updates UI immediately, then syncs with server
 */
export function useOptimisticUpdate<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Add item optimistically
  const addItem = useCallback(
    async (
      newItem: T,
      serverAction: () => Promise<T>,
      idKey: keyof T = 'id' as keyof T
    ) => {
      // Immediately add to UI
      setData((prev) => [newItem, ...prev]);

      try {
        // Send to server
        const serverItem = await serverAction();
        
        // Replace temporary item with server response
        setData((prev) =>
          prev.map((item) =>
            item === newItem ? serverItem : item
          )
        );
        
        return serverItem;
      } catch (error) {
        // Rollback on error
        setData((prev) => prev.filter((item) => item !== newItem));
        throw error;
      }
    },
    []
  );

  // Update item optimistically
  const updateItem = useCallback(
    async (
      id: any,
      updates: Partial<T>,
      serverAction: () => Promise<T>,
      idKey: keyof T = 'id' as keyof T
    ) => {
      // Store old data for rollback
      const oldData = [...data];
      
      // Immediately update UI
      setData((prev) =>
        prev.map((item) =>
          (item as any)[idKey] === id ? { ...item, ...updates } : item
        )
      );

      try {
        // Send to server
        const serverItem = await serverAction();
        
        // Update with server response
        setData((prev) =>
          prev.map((item) =>
            (item as any)[idKey] === id ? serverItem : item
          )
        );
        
        return serverItem;
      } catch (error) {
        // Rollback on error
        setData(oldData);
        throw error;
      }
    },
    [data]
  );

  // Delete item optimistically
  const deleteItem = useCallback(
    async (
      id: any,
      serverAction: () => Promise<void>,
      idKey: keyof T = 'id' as keyof T
    ) => {
      // Store old data for rollback
      const oldData = [...data];
      
      // Immediately remove from UI
      setData((prev) => prev.filter((item) => (item as any)[idKey] !== id));

      try {
        // Send to server
        await serverAction();
      } catch (error) {
        // Rollback on error
        setData(oldData);
        throw error;
      }
    },
    [data]
  );

  // Refresh from server
  const refresh = useCallback(
    async (fetchAction: () => Promise<T[]>) => {
      setIsLoading(true);
      try {
        const newData = await fetchAction();
        setData(newData);
        return newData;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    data,
    setData,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  };
}
