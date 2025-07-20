import { supabase } from './supabase';


export const deleteFromStorage = async (path: string) => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {

      throw error;
    }
  } catch (error) {
    console.error('Error deleting from storage:', error);
    throw error;
  }
};
