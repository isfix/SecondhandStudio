
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
      let query = supabase.from('items').select('*');
      if (fetchOptions.category && fetchOptions.category !== 'all') {
        query = query.eq('category', fetchOptions.category);
      }
      if (fetchOptions.size && fetchOptions.size !== 'all') {
        query = query.eq('size', fetchOptions.size);
      }
      if (fetchOptions.condition && fetchOptions.condition !== 'all') {
        query = query.eq('condition', fetchOptions.condition);
      }
      if (fetchOptions.sellerId) {
        query = query.eq('seller_id', fetchOptions.sellerId);
      }
      if (fetchOptions.approvalStatus) {
        query = query.eq('approval_status', fetchOptions.approvalStatus);
      } else {
        query = query.eq('approval_status', 'approved');
      }
      if (fetchOptions.itemIds && fetchOptions.itemIds.length > 0) {
        query = query.in('id', fetchOptions.itemIds);
      }
      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
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
