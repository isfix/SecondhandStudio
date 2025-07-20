
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { deleteFromStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
}

export const ImageUpload = ({ onImagesUploaded, maxImages = 5, existingImages = [] }: ImageUploadProps) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.slice(0, maxImages - uploadedImages.length);
    
    if (newImages.length === 0) return;

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
          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 50 }
                : img
            )
          );

          const fileName = `items/${Date.now()}-${uploadingImage.file.name}`;
          const response = await fetch('/api/storage/sign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: fileName }),
          });
          const { signedUrl, path } = await response.json();

          await fetch(signedUrl, {
            method: 'PUT',
            body: uploadingImage.file,
            headers: {
              'Content-Type': uploadingImage.file.type,
            },
          });

          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
          console.log('Supabase publicUrl for uploaded image:', publicUrl, 'path:', path);
          let url = publicUrl;
          // Fallback: if publicUrl is empty, try constructing it manually
          if (!url) {
            url = `${supabase.storageUrl}/object/public/images/${path}`;
            console.warn('Fallback public URL used:', url);
          }

          // Optionally, test if the URL is accessible
          // (skip for now, but could add a fetch(url) check)

          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 100, url: url }
                : img
            )
          );

          return url;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Upload Failed",
            description: `The image "${uploadingImage.file.name}" failed to upload. Please try again.`,
            variant: "destructive",
          });
          setUploadingImages(prev => 
            prev.filter(img => img.id !== uploadingImage.id)
          );

          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(url => url !== null) as string[];

      const newUploadedImages = [...uploadedImages, ...successfulUploads];
      setUploadedImages(newUploadedImages);
      onImagesUploaded(newUploadedImages);

      setUploadingImages(prev => 
        prev.filter(img => !successfulUploads.includes(img.url || ""))
      );
    } catch (error) {
      console.error("Error in upload process:", error);
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, maxImages, onImagesUploaded]);

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
      const path = imageUrl.split('/').pop();
      if (path) {
        await deleteFromStorage(`items/${path}`);
      }
      
      const newUploadedImages = uploadedImages.filter(url => url !== imageUrl);
      setUploadedImages(newUploadedImages);
      onImagesUploaded(newUploadedImages);
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Delete Failed",
        description: "The image failed to delete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canUploadMore = uploadedImages.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Upload Images</h3>
        <span className="text-sm text-gray-500">
          {uploadedImages.length}/{maxImages}
        </span>
      </div>

      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive 
              ? "border-orange-500 bg-orange-50" 
              : "border-gray-300 hover:border-gray-400"
          } ${isUploading || !canUploadMore ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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

      {uploadingImages.map((uploadingImage) => (
        <div key={uploadingImage.id} className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {uploadingImage.file.name}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {uploadingImage.progress}%
            </span>
          </div>
          <Progress value={uploadingImage.progress} className="h-2" />
        </div>
      ))}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/icon.png'; }}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeImage(imageUrl)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
