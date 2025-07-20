
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
      let filters = [];
      if (fetchOptions.category && fetchOptions.category !== 'all') {
        filters.push(['category', 'eq', fetchOptions.category]);
      }
      if (fetchOptions.size && fetchOptions.size !== 'all') {
        filters.push(['size', 'eq', fetchOptions.size]);
      }
      if (fetchOptions.condition && fetchOptions.condition !== 'all') {
        filters.push(['condition', 'eq', fetchOptions.condition]);
      }
      if (fetchOptions.sellerId) {
        filters.push(['sellerId', 'eq', fetchOptions.sellerId]);
      }
      if (fetchOptions.approvalStatus) {
        filters.push(['approvalStatus', 'eq', fetchOptions.approvalStatus]);
      } else {
        filters.push(['approvalStatus', 'eq', 'approved']);
      }
      if (fetchOptions.itemIds && fetchOptions.itemIds.length > 0) {
        query = query.in('id', fetchOptions.itemIds);
      }
      // Apply filters
      filters.forEach(([col, op, val]) => {
        query = query.eq(col, val);
      });
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
