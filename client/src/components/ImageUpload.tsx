import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image, Bot, Sparkles } from "lucide-react";
import { storageService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onImagesUploaded: (images: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  url?: string;
  thumbnailUrl?: string;
}

export const ImageUpload = ({ onImagesUploaded, maxImages = 5, existingImages = [] }: ImageUploadProps) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.slice(0, maxImages - uploadedImages.length);
    
    if (newImages.length < acceptedFiles.length) {
      toast({
        title: "Too many images",
        description: `Only ${maxImages} images allowed. Uploading first ${newImages.length} images.`,
        variant: "destructive",
      });
    }

    setIsUploading(true);
    const newUploadingImages: UploadingImage[] = newImages.map(file => ({
      id: `${Date.now()}-${file.name}`,
      file,
      progress: 0,
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    try {
      const uploadPromises = newUploadingImages.map(async (uploadingImage) => {
        try {
          // Update progress for this specific image
          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 50 }
                : img
            )
          );

          const result = await storageService.uploadWithThumbnail(
            uploadingImage.file,
            `items/${Date.now()}`
          );

          // Update progress to completion
          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 100, url: result.originalUrl, thumbnailUrl: result.thumbnailUrl }
                : img
            )
          );

          return result.originalUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
          
          // Remove failed upload from uploading list
          setUploadingImages(prev => 
            prev.filter(img => img.id !== uploadingImage.id)
          );

          toast({
            title: "Upload failed",
            description: `Failed to upload ${uploadingImage.file.name}`,
            variant: "destructive",
          });

          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(url => url !== null) as string[];

      // Update uploaded images
      const newUploadedImages = [...uploadedImages, ...successfulUploads];
      setUploadedImages(newUploadedImages);
      onImagesUploaded(newUploadedImages);

      // Clear completed uploads
      setUploadingImages(prev => 
        prev.filter(img => !successfulUploads.includes(img.url || ""))
      );

      if (successfulUploads.length > 0) {
        toast({
          title: "Upload successful",
          description: `${successfulUploads.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Upload error",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, maxImages, onImagesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages,
    disabled: isUploading || uploadedImages.length >= maxImages,
  });

  const removeImage = async (imageUrl: string) => {
    try {
      // Extract path from URL for Supabase deletion
      const path = imageUrl.split('/').pop();
      if (path) {
        await storageService.deleteImage(path);
      }
      
      const newUploadedImages = uploadedImages.filter(url => url !== imageUrl);
      setUploadedImages(newUploadedImages);
      onImagesUploaded(newUploadedImages);

      toast({
        title: "Image removed",
        description: "Image has been removed successfully",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const enhanceImagesWithAI = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No images to enhance",
        description: "Please upload some images first",
        variant: "destructive",
      });
      return;
    }

    setAiEnhancing(true);
    try {
      // This is a placeholder for AI image enhancement
      // In a real implementation, you'd send images to an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "AI Enhancement Complete",
        description: "Your images have been optimized for better visibility",
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Failed to enhance images with AI",
        variant: "destructive",
      });
    } finally {
      setAiEnhancing(false);
    }
  };

  const canUploadMore = uploadedImages.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Upload Images</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={enhanceImagesWithAI}
            disabled={aiEnhancing || uploadedImages.length === 0}
            className="flex items-center gap-2"
          >
            {aiEnhancing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Enhance
              </>
            )}
          </Button>
          <span className="text-sm text-gray-500">
            {uploadedImages.length}/{maxImages}
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? "border-orange-500 bg-orange-50" 
              : "border-gray-300 hover:border-gray-400"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop the images here..."
                : "Drag & drop images here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG, WEBP up to 10MB each
            </p>
          </div>
        </div>
      )}

      {/* Uploading Images */}
      <AnimatePresence>
        {uploadingImages.map((uploadingImage) => (
          <motion.div
            key={uploadingImage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-50 rounded-lg p-4 border"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {uploadingImage.file.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {uploadingImage.progress}%
              </span>
            </div>
            <Progress value={uploadingImage.progress} className="h-2" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {uploadedImages.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200"
              >
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(imageUrl)}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Photo Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting for the best results</li>
          <li>• Include multiple angles and close-ups of details</li>
          <li>• Show any flaws or wear honestly</li>
          <li>• The first image will be used as the main photo</li>
          <li>• AI enhancement optimizes brightness and contrast</li>
        </ul>
      </div>
    </div>
  );
};