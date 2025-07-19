
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, deleteDoc } from "firebase/firestore";
import { useItems } from "./useItems";

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const wishlistItemIds = useMemo(() => wishlist.map(w => String(w.itemId)), [wishlist]);

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
      const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', user.id));
      const snapshot = await getDocs(qWishlist);
      const userWishlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlist(userWishlist);
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
      const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', user.id), where('itemId', '==', itemId));
      const snapshot = await getDocs(qWishlist);
      if (!snapshot.empty) return;
      await addDoc(collection(db, 'wishlist'), { userId: user.id, itemId });
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
    }
  }, [user, fetchWishlist]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!user) return console.error("User not authenticated");
    try {
      const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', user.id), where('itemId', '==', itemId));
      const snapshot = await getDocs(qWishlist);
      await Promise.all(snapshot.docs.map(docSnap => deleteDoc(docSnap.ref)));
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
