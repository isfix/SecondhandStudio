import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseStorageService {
  private bucketName = "fashion-items";

  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      return data.path;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  async uploadMultipleImages(files: File[], basePath: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}-${index}-${file.name}`;
      const filePath = `${basePath}/${fileName}`;
      return this.uploadImage(file, filePath);
    });

    try {
      const uploadedPaths = await Promise.all(uploadPromises);
      return uploadedPaths;
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw new Error("Failed to upload some images");
    }
  }

  async getImageUrl(path: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error("Error getting image URL:", error);
      throw new Error("Failed to get image URL");
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  async deleteMultipleImages(paths: string[]): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove(paths);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting multiple images:", error);
      throw new Error("Failed to delete some images");
    }
  }

  async optimizeAndUploadImage(file: File, path: string, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    try {
      // Create a canvas to resize and optimize the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          // Calculate new dimensions
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          const newWidth = img.width * ratio;
          const newHeight = img.height * ratio;

          // Set canvas dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and compress image
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              const optimizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              try {
                const uploadedPath = await this.uploadImage(optimizedFile, path);
                resolve(uploadedPath);
              } catch (error) {
                reject(error);
              }
            },
            "image/jpeg",
            quality
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error("Error optimizing and uploading image:", error);
      throw new Error("Failed to optimize and upload image");
    }
  }

  async createImageThumbnail(file: File, path: string, thumbnailSize: number = 200): Promise<string> {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          // Set canvas dimensions for square thumbnail
          canvas.width = thumbnailSize;
          canvas.height = thumbnailSize;

          // Calculate crop dimensions for square aspect ratio
          const minDim = Math.min(img.width, img.height);
          const cropX = (img.width - minDim) / 2;
          const cropY = (img.height - minDim) / 2;

          // Draw cropped and resized image
          ctx?.drawImage(
            img,
            cropX,
            cropY,
            minDim,
            minDim,
            0,
            0,
            thumbnailSize,
            thumbnailSize
          );

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error("Failed to create thumbnail"));
                return;
              }

              const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              try {
                const thumbnailPath = `thumbnails/${path}`;
                const uploadedPath = await this.uploadImage(thumbnailFile, thumbnailPath);
                resolve(uploadedPath);
              } catch (error) {
                reject(error);
              }
            },
            "image/jpeg",
            0.8
          );
        };

        img.onerror = () => reject(new Error("Failed to load image for thumbnail"));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error("Error creating thumbnail:", error);
      throw new Error("Failed to create thumbnail");
    }
  }

  async uploadWithThumbnail(file: File, basePath: string): Promise<{
    originalPath: string;
    thumbnailPath: string;
    originalUrl: string;
    thumbnailUrl: string;
  }> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const originalPath = `${basePath}/${fileName}`;
      
      // Upload original optimized image and create thumbnail
      const [uploadedOriginalPath, thumbnailPath] = await Promise.all([
        this.optimizeAndUploadImage(file, originalPath),
        this.createImageThumbnail(file, originalPath),
      ]);

      // Get public URLs
      const [originalUrl, thumbnailUrl] = await Promise.all([
        this.getImageUrl(uploadedOriginalPath),
        this.getImageUrl(thumbnailPath),
      ]);

      return {
        originalPath: uploadedOriginalPath,
        thumbnailPath,
        originalUrl,
        thumbnailUrl,
      };
    } catch (error) {
      console.error("Error uploading with thumbnail:", error);
      throw new Error("Failed to upload image with thumbnail");
    }
  }

  async getBucketInfo(): Promise<{
    size: number;
    fileCount: number;
    lastUpdated: Date;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list();

      if (error) {
        throw error;
      }

      const size = data.reduce((total, file) => total + (file.metadata?.size || 0), 0);
      const fileCount = data.length;
      const lastUpdated = new Date(
        Math.max(...data.map(file => new Date(file.updated_at || file.created_at).getTime()))
      );

      return {
        size,
        fileCount,
        lastUpdated,
      };
    } catch (error) {
      console.error("Error getting bucket info:", error);
      throw new Error("Failed to get bucket information");
    }
  }
}

export const storageService = new SupabaseStorageService();