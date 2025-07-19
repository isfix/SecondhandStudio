import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Item routes
  app.get("/api/items", async (req, res) => {
    try {
      const { approvalStatus, includeAll, ...filters } = req.query;
      const items = await storage.getItems({ 
        ...filters, 
        approvalStatus: approvalStatus as string,
        includeAll: includeAll === 'true'
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const item = await storage.createItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid item data" });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.updateItem(parseInt(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid item data" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const success = await storage.deleteItem(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const wishlist = await storage.getWishlist(parseInt(req.params.userId));
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const wishlistItem = await storage.addToWishlist(req.body);
      res.status(201).json(wishlistItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid wishlist data" });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      const success = await storage.removeFromWishlist(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI routes
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { originalContent, contentType } = req.body;
      let generatedContent;

      switch (contentType) {
        case "enhancement":
          generatedContent = await aiService.generateItemDescription(originalContent, "Generic", "General", "Good");
          break;
        case "seo":
          generatedContent = await aiService.generateSEOContent("Sample Title", originalContent);
          break;
        case "page_content":
          generatedContent = await aiService.generateContentPage(originalContent);
          break;
        default:
          generatedContent = await aiService.generateItemDescription(originalContent, "Generic", "General", "Good");
      }

      res.json({ generatedContent });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  app.post("/api/ai/generate-item-description", async (req, res) => {
    try {
      const { originalDescription, brand, category, condition } = req.body;
      const generatedDescription = await aiService.generateItemDescription(originalDescription, brand, category, condition);
      res.json({ generatedDescription });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate item description" });
    }
  });

  app.post("/api/ai/generate-seo", async (req, res) => {
    try {
      const { title, content } = req.body;
      const seoContent = await aiService.generateSEOContent(title, content);
      res.json(seoContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate SEO content" });
    }
  });

  app.post("/api/ai/moderate-content", async (req, res) => {
    try {
      const { content, contentType } = req.body;
      const moderationResult = await aiService.moderateContent(content, contentType);
      res.json(moderationResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to moderate content" });
    }
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { userPreferences, recentlyViewed } = req.body;
      const recommendations = await aiService.generatePersonalizedRecommendations(userPreferences, recentlyViewed);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.get("/api/ai/trending-topics", async (req, res) => {
    try {
      const topics = await aiService.generateTrendingTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate trending topics" });
    }
  });

  // Admin routes
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      // Mock analytics data for now
      const analytics = {
        totalUsers: 1250,
        totalItems: 3450,
        totalViews: 15600,
        totalSales: 8750,
        recentActivity: [
          { id: "1", action: "item_view", timestamp: new Date(), metadata: { itemId: 1 } },
          { id: "2", action: "user_signup", timestamp: new Date(), metadata: { userId: 123 } },
          { id: "3", action: "item_purchase", timestamp: new Date(), metadata: { itemId: 45, amount: 89.99 } }
        ],
        itemStats: {
          labels: ["Dresses", "Tops", "Bottoms", "Shoes", "Accessories"],
          views: [2500, 1800, 1200, 900, 600],
          likes: [450, 320, 230, 180, 120]
        },
        userGrowth: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          users: [100, 150, 200, 280, 350, 420]
        }
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to load analytics" });
    }
  });

  app.get("/api/admin/content-pages", async (req, res) => {
    try {
      // Mock content pages data
      const pages = [
        {
          id: "1",
          slug: "about-us",
          title: "About ThreadSwap",
          content: "ThreadSwap is your premier destination for preloved fashion...",
          aiGeneratedContent: null,
          metaDescription: "Learn about ThreadSwap's mission to make fashion sustainable",
          metaKeywords: "sustainable fashion, preloved clothing, ThreadSwap",
          isPublished: true,
          authorId: "1",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          slug: "sustainability",
          title: "Our Commitment to Sustainability",
          content: "Discover how preloved fashion is changing the industry...",
          aiGeneratedContent: null,
          metaDescription: "ThreadSwap's commitment to sustainable fashion practices",
          metaKeywords: "sustainable fashion, eco-friendly, environment",
          isPublished: true,
          authorId: "1",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Failed to load content pages" });
    }
  });

  app.post("/api/admin/content-pages", async (req, res) => {
    try {
      // Mock page creation
      const newPage = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.status(201).json(newPage);
    } catch (error) {
      res.status(400).json({ message: "Failed to create page" });
    }
  });

  app.patch("/api/admin/content-pages/:id", async (req, res) => {
    try {
      // Mock page update
      const updatedPage = {
        id: req.params.id,
        ...req.body,
        updatedAt: new Date()
      };
      res.json(updatedPage);
    } catch (error) {
      res.status(400).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/admin/content-pages/:id", async (req, res) => {
    try {
      // Mock page deletion
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Admin item approval routes
  app.post("/api/admin/items/:id/approve", async (req, res) => {
    try {
      const { adminNotes } = req.body;
      const item = await storage.updateItem(parseInt(req.params.id), {
        approvalStatus: "approved",
        adminNotes: adminNotes || null,
        approvedAt: new Date(),
        approvedBy: 1, // In real app, get from auth middleware
      });
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item approved successfully", item });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve item" });
    }
  });

  app.post("/api/admin/items/:id/reject", async (req, res) => {
    try {
      const { adminNotes } = req.body;
      const item = await storage.updateItem(parseInt(req.params.id), {
        approvalStatus: "rejected",
        adminNotes: adminNotes || "Item rejected by admin",
        approvedAt: null,
        approvedBy: 1, // In real app, get from auth middleware
      });
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item rejected successfully", item });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject item" });
    }
  });

  // Review history endpoint
  app.get("/api/admin/review-history", async (req, res) => {
    try {
      // Mock review history data
      const reviewHistory = [
        {
          id: "1",
          itemId: 1,
          itemTitle: "Vintage Leather Jacket",
          brand: "Zara",
          category: "Outerwear",
          decision: "approved",
          reviewerName: "Admin User",
          reviewedAt: new Date(Date.now() - 86400000), // 1 day ago
          notes: "Great condition, well-described item."
        },
        {
          id: "2",
          itemId: 2,
          itemTitle: "Designer Handbag",
          brand: "Gucci",
          category: "Bags",
          decision: "rejected",
          reviewerName: "Admin User",
          reviewedAt: new Date(Date.now() - 172800000), // 2 days ago
          notes: "Images don't clearly show item condition. Please add more detailed photos."
        },
        {
          id: "3",
          itemId: 3,
          itemTitle: "Summer Dress",
          brand: "H&M",
          category: "Dresses",
          decision: "approved",
          reviewerName: "Admin User",
          reviewedAt: new Date(Date.now() - 259200000), // 3 days ago
          notes: "Perfect listing with clear photos and description."
        }
      ];
      
      res.json(reviewHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to load review history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
