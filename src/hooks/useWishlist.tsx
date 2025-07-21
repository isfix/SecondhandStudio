
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";
import { useItems } from "./useItems";

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const wishlistItemIds = useMemo(() => wishlist.map(w => String(w.item_id)), [wishlist]);

  const { items: wishlistItems, loading: itemsLoading } = useItems({
    itemIds: wishlistItemIds,
    enabled: wishlistItemIds.length > 0 && !!user,
  });

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addItem = useCallback(async (itemId: string) => {
    if (!user) return console.error("User not authenticated");
    try {
      // Check if already in wishlist
      const { data: existing, error: checkError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId);
      if (checkError) throw checkError;
      if (existing && existing.length > 0) return;
      const { error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, item_id: itemId }]);
      if (error) throw error;
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
    }
  }, [user, fetchWishlist]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!user) return console.error("User not authenticated");
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);
      if (error) throw error;
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  }, [user, fetchWishlist]);

  const isInWishlist = (itemId: string) => {
    return wishlistItemIds.includes(itemId);
  };

  return {
    wishlist,
    wishlistItems,
    loading: loading || itemsLoading,
    addItem,
    removeItem,
    isInWishlist
  };
};
