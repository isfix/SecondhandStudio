import { useState, useEffect } from "react";
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/firestore";
import { useAuth } from "./useAuth";
import type { Wishlist } from "@shared/schema";

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<(Wishlist & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const wishlistItems = await getWishlist(user.id);
      setWishlist(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemId: string) => {
    if (!user) return;
    
    try {
      await addToWishlist(user.id, itemId);
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;
    
    try {
      await removeFromWishlist(user.id, itemId);
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const checkIsInWishlist = async (itemId: string) => {
    if (!user) return false;
    
    try {
      return await isInWishlist(user.id, itemId);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  };

  return {
    wishlist,
    loading,
    addItem,
    removeItem,
    checkIsInWishlist,
  };
};
