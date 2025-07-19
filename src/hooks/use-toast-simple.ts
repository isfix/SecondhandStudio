"use client";

import toast from "react-hot-toast";

export const useToast = () => {
  return {
    toast: (message: string, type: "success" | "error" | "loading" = "success") => {
      switch (type) {
        case "success":
          return toast.success(message);
        case "error":
          return toast.error(message);
        case "loading":
          return toast.loading(message);
        default:
          return toast(message);
      }
    },
  };
};