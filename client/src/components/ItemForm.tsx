import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles, Wand2, DollarSign, Tag, Package, Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { motion } from "framer-motion";
import { insertItemSchema } from "@shared/schema";
import { categories, sizes, conditions, colors } from "@shared/schema";
import { z } from "zod";

const formSchema = insertItemSchema.extend({
  images: z.array(z.string()).min(1, "At least one image is required"),
  purchaseDate: z.string().optional(),
  purchaseLocation: z.string().optional(),
  defectsOrWear: z.string().optional(),
  reasonForSelling: z.string().optional(),
  measurements: z.string().optional(),
}).omit({
  approvalStatus: true,
  adminNotes: true,
  submittedAt: true,
  approvedAt: true,
  approvedBy: true,
});

type FormData = z.infer<typeof formSchema>;

interface ItemFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isSubmitting?: boolean;
}

export const ItemForm = ({ onSubmit, initialData, isSubmitting = false }: ItemFormProps) => {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      brand: initialData?.brand || "",
      category: initialData?.category || "",
      size: initialData?.size || "",
      condition: initialData?.condition || "",
      price: initialData?.price || "",
      originalPrice: initialData?.originalPrice || "",
      color: initialData?.color || "",
      material: initialData?.material || "",
      style: initialData?.style || "",
      location: initialData?.location || "",
      tags: initialData?.tags || [],
      images: initialData?.images || [],
      purchaseDate: "",
      purchaseLocation: "",
      defectsOrWear: "",
      reasonForSelling: "",
      measurements: "",
    },
  });

  const watchedFields = watch();

  const generateAIDescription = async () => {
    if (!watchedFields.title || !watchedFields.brand || !watchedFields.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, brand, and category first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/ai/generate-item-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalDescription: watchedFields.description || watchedFields.title,
          brand: watchedFields.brand,
          category: watchedFields.category,
          condition: watchedFields.condition || "good",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await response.json();
      setValue("description", data.generatedDescription);
      
      toast({
        title: "Description Generated",
        description: "AI has enhanced your item description",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI description",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateSEOContent = async () => {
    if (!watchedFields.title || !watchedFields.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSEO(true);
    try {
      const response = await fetch("/api/ai/generate-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: watchedFields.title,
          content: watchedFields.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate SEO content");
      }

      const data = await response.json();
      
      // Extract keywords and set as tags
      const keywords = data.metaKeywords.split(',').map((tag: string) => tag.trim());
      setValue("tags", keywords);
      
      // Update title if the AI version is better
      if (data.optimizedTitle.length <= 60) {
        setValue("title", data.optimizedTitle);
      }

      toast({
        title: "SEO Optimized",
        description: "Title and tags have been optimized for better visibility",
      });
    } catch (error) {
      toast({
        title: "SEO Generation Failed",
        description: "Failed to generate SEO content",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const suggestPrice = async () => {
    if (!watchedFields.brand || !watchedFields.category || !watchedFields.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in brand, category, and condition first",
        variant: "destructive",
      });
      return;
    }

    // Mock AI price suggestion based on brand, category, and condition
    const basePrices: Record<string, number> = {
      "Dresses": 45,
      "Tops": 25,
      "Bottoms": 35,
      "Shoes": 60,
      "Accessories": 20,
      "Outerwear": 80,
    };

    const conditionMultipliers: Record<string, number> = {
      "new-with-tags": 0.8,
      "like-new": 0.7,
      "excellent": 0.6,
      "good": 0.5,
      "fair": 0.3,
    };

    const basePrice = basePrices[watchedFields.category] || 30;
    const conditionMultiplier = conditionMultipliers[watchedFields.condition] || 0.5;
    const suggestedPrice = Math.round(basePrice * conditionMultiplier);

    setValue("price", suggestedPrice.toString());
    
    toast({
      title: "Price Suggested",
      description: `Based on similar items: $${suggestedPrice}`,
    });
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-orange-800">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <p className="text-sm font-medium">
              Items require admin approval before appearing in the store. You'll be notified once your item is reviewed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Vintage Chanel Blazer"
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                {...register("brand")}
                placeholder="e.g., Chanel"
                className="mt-1"
              />
              {errors.brand && (
                <p className="text-sm text-red-600 mt-1">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watchedFields.category}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="size">Size *</Label>
              <Select
                value={watchedFields.size}
                onValueChange={(value) => setValue("size", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.size && (
                <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={watchedFields.condition}
                onValueChange={(value) => setValue("condition", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-sm text-red-600 mt-1">{errors.condition.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={watchedFields.color || ""}
                onValueChange={(value) => setValue("color", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                {...register("material")}
                placeholder="e.g., Cotton, Wool, Silk"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                {...register("style")}
                placeholder="e.g., Casual, Formal, Vintage"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIDescription}
                disabled={isGeneratingDescription}
                className="flex items-center gap-2"
              >
                {isGeneratingDescription ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    AI Enhance
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your item in detail..."
              rows={4}
              className="mt-1"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="price">Price *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={suggestPrice}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Suggest Price
                </Button>
              </div>
              <Input
                id="price"
                {...register("price")}
                placeholder="29.99"
                type="number"
                step="0.01"
                className="mt-1"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="originalPrice">Original Price (optional)</Label>
              <Input
                id="originalPrice"
                {...register("originalPrice")}
                placeholder="89.99"
                type="number"
                step="0.01"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                {...register("purchaseDate")}
                type="date"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="purchaseLocation">Purchase Location</Label>
              <Input
                id="purchaseLocation"
                {...register("purchaseLocation")}
                placeholder="e.g., Nordstrom, Online"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="measurements">Measurements</Label>
            <Textarea
              id="measurements"
              {...register("measurements")}
              placeholder="e.g., Chest: 36in, Length: 24in, Waist: 28in"
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="defectsOrWear">Defects or Wear</Label>
            <Textarea
              id="defectsOrWear"
              {...register("defectsOrWear")}
              placeholder="Please describe any defects, stains, or signs of wear..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reasonForSelling">Reason for Selling</Label>
            <Textarea
              id="reasonForSelling"
              {...register("reasonForSelling")}
              placeholder="e.g., Doesn't fit, style change, decluttering..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="e.g., New York, NY"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            SEO & Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tags</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSEOContent}
                disabled={isGeneratingSEO}
                className="flex items-center gap-2"
              >
                {isGeneratingSEO ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    SEO Optimize
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(watchedFields.tags || []).map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImagesUploaded={setImages}
            existingImages={images}
            maxImages={5}
          />
          {errors.images && (
            <p className="text-sm text-red-600 mt-2">{errors.images.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || images.length === 0}
          className="min-w-[150px]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            "Submit for Review"
          )}
        </Button>
      </div>
    </form>
  );
};