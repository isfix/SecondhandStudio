
"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { Bot, Sparkles, Wand2, DollarSign, Tag, Package, Shirt, Info, Edit, FileImage } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  "Dresses", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Bags",
] as [string, ...string[]];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as [string, ...string[]];
const conditions = ["Like New", "Gently Used", "Good", "Fair"] as [string, ...string[]];
const colors = [
  "Black", "White", "Grey", "Brown", "Beige", "Navy", "Blue", "Green", "Red", "Pink", "Yellow", "Purple", "Orange", "Multi"
] as [string, ...string[]];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  brand: z.string().min(1, "Brand is required"),
  category: z.enum(categories, { required_error: "Category is required." }),
  size: z.enum(sizes, { required_error: "Size is required." }),
  condition: z.enum(conditions, { required_error: "Condition is required." }),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: "Price must be a positive number" }),
  originalPrice: z.string().optional(),
  color: z.enum(colors).optional(),
  material: z.string().optional(),
  style: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  sellerId: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface ItemFormProps {
  initialData?: Partial<FormData>;
  onFormSubmit: () => void;
}

const defaultValues: Omit<FormData, 'sellerId'> = {
  title: "",
  description: "",
  brand: "",
  price: "",
  originalPrice: "",
  material: "",
  style: "",
  location: "",
  tags: [],
  images: [],
  category: 'Tops',
  size: 'M',
  condition: 'Gently Used',
};

export const ItemForm = ({ initialData, onFormSubmit }: ItemFormProps) => {
  const { user, firebaseUser } = useAuth();
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      ...defaultValues,
      ...initialData,
      sellerId: user?.id
    },
  });

  const watchedFields = watch();
  
  useEffect(() => {
    setValue("images", images, { shouldValidate: true });
  }, [images, setValue]);

  useEffect(() => {
    if (user?.id) {
        setValue("sellerId", user.id, { shouldValidate: true });
    }
  }, [user, setValue]);

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    if (images.length === 0) {
      toast({
        title: "Image Required",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.sellerId) {
        toast({ title: "Error", description: "You must be logged in to sell items.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      let token = null;
      if (firebaseUser) {
        token = await firebaseUser.getIdToken();
      }
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...data, images, price: parseFloat(data.price) }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Something went wrong');
      }

      toast({
        title: "Success!",
        description: "Your item has been submitted for review.",
      });
      
      reset();
      setImages([]);
      onFormSubmit();
    } catch (error) {
      console.error("Failed to submit item:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 text-primary">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Items require admin approval before appearing in the store. You'll be notified once your item is reviewed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Core Information
          </CardTitle>
          <CardDescription>
            This is the most important information for your listing. Be descriptive!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Vintage Silk Scarf"
                className="mt-1"
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                {...register("brand")}
                placeholder="e.g., Hermès"
                className="mt-1"
              />
              {errors.brand && <p className="text-sm text-red-600 mt-1">{errors.brand.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your item in detail. Mention its story, how it fits, and any unique features."
              rows={4}
              className="mt-1"
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Categorization
          </CardTitle>
          <CardDescription>
            Help shoppers find your item by selecting the correct details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <Label>Category *</Label>
            <Select value={watchedFields.category} onValueChange={(value) => setValue("category", value as any, { shouldValidate: true })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <Label>Size *</Label>
            <Select value={watchedFields.size} onValueChange={(value) => setValue("size", value as any, { shouldValidate: true })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>{sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {errors.size && <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>}
          </div>
          <div>
            <Label>Condition *</Label>
            <Select value={watchedFields.condition} onValueChange={(value) => setValue("condition", value as any, { shouldValidate: true })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select condition" /></SelectTrigger>
              <SelectContent>{conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.condition && <p className="text-sm text-red-600 mt-1">{errors.condition.message}</p>}
          </div>
          <div>
            <Label>Color</Label>
            <Select value={watchedFields.color} onValueChange={(value) => setValue("color", value as any)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select color" /></SelectTrigger>
              <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" {...register("material")} placeholder="e.g., Cotton, Wool" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="style">Style</Label>
            <Input id="style" {...register("style")} placeholder="e.g., Casual, Vintage" className="mt-1" />
          </div>
        </CardContent>
       </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pricing
          </CardTitle>
          <CardDescription>Set a competitive price for your item.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input id="price" {...register("price")} placeholder="29.99" type="number" step="0.01" className="mt-1" />
              {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (optional)</Label>
              <Input id="originalPrice" {...register("originalPrice")} placeholder="89.99" type="number" step="0.01" className="mt-1" />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-primary" />
            Images *
          </CardTitle>
          <CardDescription>Upload high-quality images. Good photos sell items faster. The first image will be the cover photo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImagesUploaded={setImages}
            existingImages={images}
            maxImages={5}
          />
          {errors.images && <p className="text-sm text-red-600 mt-2">{errors.images.message}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={() => { reset(); setImages([]); }} disabled={isSubmitting}>
          Reset Form
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
          {isSubmitting ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>Submitting...</>
          ) : "Submit for Review"}
        </Button>
      </div>
    </form>
  );
};
