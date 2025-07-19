import { useState, useEffect } from "react";
import { getItems, subscribeToItems } from "@/lib/firestore";
import type { Item } from "@shared/schema";

interface UseItemsOptions {
  category?: string;
  size?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  approvalStatus?: string;
  realTime?: boolean;
}

export const useItems = (options: UseItemsOptions = {}) => {
  const [items, setItems] = useState<(Item & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (options.realTime) {
          unsubscribe = subscribeToItems((items) => {
            setItems(items);
            setLoading(false);
          }, options);
        } else {
          const fetchedItems = await getItems(options);
          setItems(fetchedItems);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchItems();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    options.category,
    options.size,
    options.condition,
    options.minPrice,
    options.maxPrice,
    options.sellerId,
    options.approvalStatus,
    options.realTime,
  ]);

  return { items, loading, error };
};
