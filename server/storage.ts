import { users, items, wishlist, type User, type Item, type Wishlist, type InsertUser, type InsertItem, type InsertWishlist } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Item operations
  getItems(filters?: {
    category?: string;
    size?: string;
    condition?: string;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    approvalStatus?: string;
  }): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;

  // Wishlist operations
  getWishlist(userId: number): Promise<Wishlist[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: number): Promise<boolean>;
  isInWishlist(userId: number, itemId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private items: Map<number, Item>;
  private wishlist: Map<number, Wishlist>;
  private userIdCounter: number;
  private itemIdCounter: number;
  private wishlistIdCounter: number;

  constructor() {
    this.users = new Map();
    this.items = new Map();
    this.wishlist = new Map();
    this.userIdCounter = 1;
    this.itemIdCounter = 1;
    this.wishlistIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      phoneNumber: insertUser.phoneNumber || null,
      role: insertUser.role || "user",
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      socialLinks: insertUser.socialLinks || null,
      preferences: insertUser.preferences || null,
      isVerified: insertUser.isVerified || false,
      totalSales: insertUser.totalSales || 0,
      totalPurchases: insertUser.totalPurchases || 0,
      rating: insertUser.rating || "0.00",
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Item operations
  async getItems(filters?: {
    category?: string;
    size?: string;
    condition?: string;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    approvalStatus?: string;
    includeAll?: boolean;
  }): Promise<Item[]> {
    let items = Array.from(this.items.values()).filter(item => item.isActive);

    // Only show approved items by default (for public store)
    // Unless includeAll is true (for seller dashboard) or approvalStatus is specified
    if (!filters?.approvalStatus && !filters?.includeAll) {
      items = items.filter(item => item.approvalStatus === "approved");
    }

    if (filters) {
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.size) {
        items = items.filter(item => item.size === filters.size);
      }
      if (filters.condition) {
        items = items.filter(item => item.condition === filters.condition);
      }
      if (filters.sellerId) {
        items = items.filter(item => item.sellerId === filters.sellerId);
      }
      if (filters.minPrice !== undefined) {
        items = items.filter(item => parseFloat(item.price) >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        items = items.filter(item => parseFloat(item.price) <= filters.maxPrice!);
      }
      if (filters.approvalStatus) {
        items = items.filter(item => item.approvalStatus === filters.approvalStatus);
      }
    }

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.itemIdCounter++;
    const now = new Date();
    const item: Item = {
      ...insertItem,
      aiGeneratedDescription: insertItem.aiGeneratedDescription || null,
      originalPrice: insertItem.originalPrice || null,
      color: insertItem.color || null,
      material: insertItem.material || null,
      style: insertItem.style || null,
      location: insertItem.location || null,
      tags: insertItem.tags || null,
      views: insertItem.views || 0,
      likes: insertItem.likes || 0,
      isPromoted: insertItem.isPromoted || false,
      promotionExpiresAt: insertItem.promotionExpiresAt || null,
      isActive: insertItem.isActive ?? true,
      isFeatured: insertItem.isFeatured || false,
      sellStatus: insertItem.sellStatus || "available",
      approvalStatus: insertItem.approvalStatus || "pending",
      adminNotes: insertItem.adminNotes || null,
      submittedAt: now,
      approvedAt: insertItem.approvedAt || null,
      approvedBy: insertItem.approvedBy || null,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: number, itemData: Partial<Item>): Promise<Item | undefined> {
    const existingItem = this.items.get(id);
    if (!existingItem) return undefined;

    const updatedItem: Item = {
      ...existingItem,
      ...itemData,
      updatedAt: new Date()
    };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    const item = this.items.get(id);
    if (!item) return false;

    item.isActive = false;
    item.updatedAt = new Date();
    this.items.set(id, item);
    return true;
  }

  // Wishlist operations
  async getWishlist(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlist.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = this.wishlistIdCounter++;
    const now = new Date();
    const wishlistItem: Wishlist = {
      ...insertWishlist,
      id,
      createdAt: now
    };
    this.wishlist.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlist.delete(id);
  }

  async isInWishlist(userId: number, itemId: number): Promise<boolean> {
    return Array.from(this.wishlist.values()).some(
      (item) => item.userId === userId && item.itemId === itemId
    );
  }
}

export const storage = new MemStorage();
