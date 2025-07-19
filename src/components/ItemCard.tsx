
"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";

interface ItemCardProps {
  item: any;
  onItemClick: (item: any) => void;
}

export const ItemCard = ({ item, onItemClick }: ItemCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem, removeItem, wishlist } = useWishlist();
  
  const isInWishlist = useMemo(() => {
    return wishlist.some(w => w.itemId === item.id);
  }, [wishlist, item.id]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWishlist) {
        await removeItem(item.id);
        toast({ title: "Removed from wishlist" });
      } else {
        await addItem(item.id);
        toast({ title: "Added to wishlist" });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast({
        title: "Error",
        description: "Could not update wishlist.",
        variant: "destructive",
      });
    }
  };
  
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Like New": return "bg-green-100 text-green-800";
      case "Gently Used": return "bg-blue-100 text-blue-800";
      case "Good": return "bg-yellow-100 text-yellow-800";
      case "Fair": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div 
        className="cursor-pointer group overflow-hidden flex flex-col h-full bg-card p-4 rounded-lg border"
        onClick={() => onItemClick(item)}
      >
        <div className="aspect-square overflow-hidden relative bg-secondary rounded-md mb-4">
          <Image
            src={item.images?.[0] || 'https://placehold.co/400x400.png'}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint="fashion clothing"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full h-8 w-8 hover:bg-background"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>
        
        <div className="flex flex-col flex-grow">
          <div className="flex-grow">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand}</p>
              <h3 className="font-semibold text-base text-foreground truncate mt-1">{item.title}</h3>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">Size {item.size}</p>
            <Badge variant="outline" className={`font-normal ${getConditionColor(item.condition)}`}>
              {item.condition}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold text-foreground">
              ${Number(item.price).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
