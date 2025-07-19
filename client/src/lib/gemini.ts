import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateItemDescription(originalDescription: string, brand: string, category: string, condition: string): Promise<string> {
    const prompt = `
      Enhance the following product description for a preloved fashion marketplace. 
      Make it more appealing, detailed, and SEO-friendly while maintaining authenticity.
      
      Original description: "${originalDescription}"
      Brand: ${brand}
      Category: ${category}
      Condition: ${condition}
      
      Please provide an enhanced description that:
      1. Maintains the original intent and key details
      2. Adds compelling fashion-focused language
      3. Highlights the sustainability aspect of preloved fashion
      4. Includes relevant keywords for SEO
      5. Keeps the tone authentic and trustworthy
      6. Is between 100-200 words
      
      Return only the enhanced description, no additional text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating item description:", error);
      throw new Error("Failed to generate item description");
    }
  }

  async generateSEOContent(title: string, content: string): Promise<{
    metaDescription: string;
    metaKeywords: string;
    optimizedTitle: string;
  }> {
    const prompt = `
      Create SEO-optimized content for a preloved fashion marketplace page.
      
      Current title: "${title}"
      Current content: "${content}"
      
      Please provide:
      1. An optimized title (under 60 characters) that includes relevant keywords
      2. A meta description (under 160 characters) that's compelling and includes keywords
      3. Meta keywords (comma-separated, 5-8 keywords) relevant to preloved fashion
      
      Focus on keywords related to: sustainable fashion, preloved clothing, second-hand fashion, vintage, designer resale, eco-friendly fashion.
      
      Return the response in this exact JSON format:
      {
        "optimizedTitle": "...",
        "metaDescription": "...",
        "metaKeywords": "..."
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonResponse = JSON.parse(response.text());
      return jsonResponse;
    } catch (error) {
      console.error("Error generating SEO content:", error);
      throw new Error("Failed to generate SEO content");
    }
  }

  async generateContentPage(topic: string, targetAudience: string = "fashion-conscious consumers"): Promise<string> {
    const prompt = `
      Create engaging content for a preloved fashion marketplace page about "${topic}".
      
      Target audience: ${targetAudience}
      
      Please create content that:
      1. Is informative and engaging
      2. Promotes sustainable fashion practices
      3. Builds trust in the preloved fashion marketplace
      4. Is SEO-friendly with natural keyword integration
      5. Is between 300-500 words
      6. Uses a friendly, professional tone
      
      Include relevant information about:
      - Benefits of preloved fashion
      - Quality and authenticity
      - Environmental impact
      - Style and affordability
      
      Return only the content, no additional formatting or explanations.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating content page:", error);
      throw new Error("Failed to generate content page");
    }
  }

  async generatePersonalizedRecommendations(
    userPreferences: {
      style?: string;
      size?: string;
      favoriteCategories?: string[];
      priceRange?: string;
      brands?: string[];
    },
    recentlyViewed: string[]
  ): Promise<{
    recommendations: string[];
    reasoning: string;
  }> {
    const prompt = `
      Generate personalized fashion recommendations for a user based on their preferences and browsing history.
      
      User preferences:
      - Style: ${userPreferences.style || "Not specified"}
      - Size: ${userPreferences.size || "Not specified"}
      - Favorite categories: ${userPreferences.favoriteCategories?.join(", ") || "Not specified"}
      - Price range: ${userPreferences.priceRange || "Not specified"}
      - Favorite brands: ${userPreferences.brands?.join(", ") || "Not specified"}
      
      Recently viewed items: ${recentlyViewed.join(", ")}
      
      Please provide:
      1. 5 specific recommendations for items they might like
      2. A brief explanation of why these recommendations match their preferences
      
      Return the response in this exact JSON format:
      {
        "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"],
        "reasoning": "explanation of why these recommendations were chosen"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonResponse = JSON.parse(response.text());
      return jsonResponse;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw new Error("Failed to generate recommendations");
    }
  }

  async moderateContent(content: string, contentType: "item_description" | "message" | "review"): Promise<{
    isAppropriate: boolean;
    concerns: string[];
    suggestedChanges?: string;
  }> {
    const prompt = `
      Moderate the following content for a preloved fashion marketplace.
      
      Content type: ${contentType}
      Content: "${content}"
      
      Please evaluate for:
      1. Inappropriate language or content
      2. Spam or promotional content
      3. Misleading information
      4. Potentially harmful content
      
      Return the response in this exact JSON format:
      {
        "isAppropriate": true/false,
        "concerns": ["concern1", "concern2"],
        "suggestedChanges": "optional suggestions for improvement"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonResponse = JSON.parse(response.text());
      return jsonResponse;
    } catch (error) {
      console.error("Error moderating content:", error);
      throw new Error("Failed to moderate content");
    }
  }

  async generateTrendingTopics(): Promise<string[]> {
    const prompt = `
      Generate 10 trending fashion topics for a preloved fashion marketplace blog or content section.
      
      Focus on topics that would interest people who buy and sell preloved fashion items.
      Include topics about:
      - Sustainable fashion trends
      - Vintage styling tips
      - Designer item authentication
      - Seasonal fashion advice
      - Care and maintenance of preloved items
      
      Return only a JSON array of topic titles:
      ["topic1", "topic2", "topic3", ...]
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const topics = JSON.parse(response.text());
      return topics;
    } catch (error) {
      console.error("Error generating trending topics:", error);
      throw new Error("Failed to generate trending topics");
    }
  }
}

export const geminiService = new GeminiService();