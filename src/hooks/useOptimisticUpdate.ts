import { useState } from "react";

interface OptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any, rollbackData: T) => void;
}

export function useOptimisticUpdate<T extends { id: string }>() {
  const [optimisticItems, setOptimisticItems] = useState<T[]>([]);

  const applyOptimisticUpdate = (
    currentItems: T[],
    newItem: Partial<T> & { id: string },
    options?: OptimisticOptions<T>,
  ) => {
    const existingIndex = currentItems.findIndex(
      (item) => item.id === newItem.id,
    );

    let updatedItems: T[];

    if (existingIndex !== -1) {
      // Update existing item
      updatedItems = currentItems.map((item, index) =>
        index === existingIndex ? { ...item, ...newItem } : item,
      );
    } else {
      // Add new item
      updatedItems = [...currentItems, newItem as T];
    }

    setOptimisticItems(updatedItems);

    return {
      rollback: () => setOptimisticItems(currentItems),
      confirm: (finalData?: T) => {
        if (finalData) {
          setOptimisticItems((prev) =>
            prev.map((item) => (item.id === finalData.id ? finalData : item)),
          );
        }
        options?.onSuccess?.(finalData || (newItem as T));
      },
    };
  };

  return { optimisticItems, applyOptimisticUpdate };
}
