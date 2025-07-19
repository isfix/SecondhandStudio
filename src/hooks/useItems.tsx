
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface UseItemsOptions {
  category?: string;
  size?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string | number;
  approvalStatus?: string;
  search?: string;
  includeAll?: boolean;
  itemIds?: (string|number)[];
  enabled?: boolean;
}

export const useItems = (options: UseItemsOptions = {}) => {
  const { enabled = true, ...fetchOptions } = options;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const optionsKey = useMemo(() => JSON.stringify(fetchOptions), [fetchOptions]);

  const fetchItems = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let q = collection(db, 'items');
      let qFilters = [];
      if (fetchOptions.category && fetchOptions.category !== 'all') {
        qFilters.push(where('category', '==', fetchOptions.category));
      }
      if (fetchOptions.size && fetchOptions.size !== 'all') {
        qFilters.push(where('size', '==', fetchOptions.size));
      }
      if (fetchOptions.condition && fetchOptions.condition !== 'all') {
        qFilters.push(where('condition', '==', fetchOptions.condition));
      }
      if (fetchOptions.sellerId) {
        qFilters.push(where('sellerId', '==', fetchOptions.sellerId));
      }
      if (fetchOptions.approvalStatus) {
        qFilters.push(where('approvalStatus', '==', fetchOptions.approvalStatus));
      } else {
        qFilters.push(where('approvalStatus', '==', 'approved'));
      }
      // Add more filters as needed
      let itemsQuery = qFilters.length > 0 ? query(q, ...qFilters) : q;
      const snapshot = await getDocs(itemsQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [optionsKey, enabled]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
};
