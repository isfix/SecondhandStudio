import { supabase } from './supabase';

export const uploadToStorage = async (file: File, path: string) => {
  try {
    const bucket = path.startsWith('profile-pictures/') ? 'profile-pictures' : 'items';
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
};

export const deleteFromStorage = async (path: string) => {
  try {
    const { error } = await supabase.storage
      .from('items')
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting from storage:', error);
    throw error;
  }
};
