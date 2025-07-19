import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(), // user, admin, moderator
  bio: text("bio"),
  location: text("location"),
  socialLinks: text("social_links").array(),
  preferences: text("preferences"), // JSON string for user preferences
  isVerified: boolean("is_verified").default(false).notNull(),
  totalSales: integer("total_sales").default(0).notNull(),
  totalPurchases: integer("total_purchases").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  aiGeneratedDescription: text("ai_generated_description"), // AI-enhanced description
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  size: text("size").notNull(),
  condition: text("condition").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  color: text("color"),
  material: text("material"),
  style: text("style"),
  images: text("images").array().notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  location: text("location"),
  tags: text("tags").array(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  isPromoted: boolean("is_promoted").default(false).notNull(),
  promotionExpiresAt: timestamp("promotion_expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  sellStatus: text("sell_status").default("available").notNull(), // available, sold, reserved
  approvalStatus: text("approval_status").default("pending").notNull(), // pending, approved, rejected
  adminNotes: text("admin_notes"), // Notes from admin review
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  messageType: text("message_type").default("text").notNull(), // text, image, offer
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  reviewedUserId: integer("reviewed_user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  itemId: integer("item_id").references(() => items.id),
  action: text("action").notNull(), // view, like, share, contact, purchase
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  aiGeneratedContent: text("ai_generated_content"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isPublished: boolean("is_published").default(false).notNull(),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiGeneratedContent = pgTable("ai_generated_content", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // item_description, page_content, seo_meta
  originalContent: text("original_content").notNull(),
  generatedContent: text("generated_content").notNull(),
  prompt: text("prompt").notNull(),
  model: text("model").default("gemini-pro").notNull(),
  entityId: integer("entity_id"), // ID of the related entity (item, page, etc.)
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlist).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertContentPageSchema = createInsertSchema(contentPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiGeneratedContentSchema = createInsertSchema(aiGeneratedContent).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlist.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;
export type ContentPage = typeof contentPages.$inferSelect;
export type InsertAiGeneratedContent = z.infer<typeof insertAiGeneratedContentSchema>;
export type AiGeneratedContent = typeof aiGeneratedContent.$inferSelect;

export const categories = [
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Bags",
] as const;

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const conditions = [
  "Like New",
  "Gently Used",
  "Good",
  "Fair",
] as const;

export const colors = [
  "Black",
  "White",
  "Grey",
  "Brown",
  "Beige",
  "Navy",
  "Blue",
  "Green",
  "Red",
  "Pink",
  "Yellow",
  "Purple",
  "Orange",
  "Multi",
] as const;
