import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";
import type { Item, User, Wishlist } from "@shared/schema";

// Users
export const createUser = async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
  const docRef = await addDoc(collection(db, "users"), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserByFirebaseUid = async (firebaseUid: string) => {
  const q = query(collection(db, "users"), where("firebaseUid", "==", firebaseUid));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User & { id: string };
  }
  return null;
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

// Items
export const createItem = async (itemData: Omit<Item, "id" | "createdAt" | "updatedAt">) => {
  const docRef = await addDoc(collection(db, "items"), {
    ...itemData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getItems = async (filters?: {
  category?: string;
  size?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  approvalStatus?: string;
}) => {
  // Build query params for API
  const params = new URLSearchParams();
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.size) params.append('size', filters.size);
  if (filters?.condition) params.append('condition', filters.condition);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sellerId) params.append('sellerId', filters.sellerId);
  if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);

  const response = await fetch(`/api/items?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  
  const items = await response.json();
  return items.map((item: any) => ({ ...item, id: item.id.toString() }));
};

export const getItem = async (itemId: string) => {
  const docRef = doc(db, "items", itemId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Item & { id: string };
  }
  return null;
};

export const updateItem = async (itemId: string, itemData: Partial<Item>) => {
  const docRef = doc(db, "items", itemId);
  await updateDoc(docRef, {
    ...itemData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteItem = async (itemId: string) => {
  const docRef = doc(db, "items", itemId);
  await updateDoc(docRef, { isActive: false });
};

// Wishlist
export const addToWishlist = async (userId: string, itemId: string) => {
  const docRef = await addDoc(collection(db, "wishlist"), {
    userId,
    itemId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const removeFromWishlist = async (userId: string, itemId: string) => {
  const q = query(
    collection(db, "wishlist"),
    where("userId", "==", userId),
    where("itemId", "==", itemId)
  );
  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};

export const getWishlist = async (userId: string) => {
  const q = query(
    collection(db, "wishlist"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wishlist & { id: string }));
};

export const isInWishlist = async (userId: string, itemId: string) => {
  const q = query(
    collection(db, "wishlist"),
    where("userId", "==", userId),
    where("itemId", "==", itemId)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Real-time listeners (using polling for API)
export const subscribeToItems = (callback: (items: (Item & { id: string })[]) => void, filters?: any) => {
  let intervalId: NodeJS.Timeout;
  
  const pollItems = async () => {
    try {
      const items = await getItems(filters);
      callback(items);
    } catch (error) {
      console.error('Error polling items:', error);
    }
  };

  // Initial fetch
  pollItems();

  // Poll every 10 seconds
  intervalId = setInterval(pollItems, 10000);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};
