
"use client";

import toast from "react-hot-toast";

export const useToast = () => {
  return {
    toast: (options: { title: string, description?: string, variant?: 'default' | 'destructive' }) => {
      const { title, description, variant } = options;
      
      const message = `${title}${description ? `\n${description}` : ''}`;

      if (variant === "destructive") {
        return toast.error(message);
      }
      return toast.success(message);
    },
  };
};
