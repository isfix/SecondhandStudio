import { useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import type { Item } from "@shared/schema";

interface ItemCardProps {
  item: Item & { id: string };
  onItemClick: (item: Item & { id: string }) => void;
}

export const ItemCard = ({ item, onItemClick }: ItemCardProps) => {
  const { user } = useAuth();
  const { addItem, removeItem } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    try {
      if (isInWishlist) {
        await removeItem(item.id);
        setIsInWishlist(false);
      } else {
        await addItem(item.id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Like New":
        return "bg-green-100 text-green-800";
      case "Gently Used":
        return "bg-blue-100 text-blue-800";
      case "Good":
        return "bg-yellow-100 text-yellow-800";
      case "Fair":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card 
      className="cursor-pointer group hover:shadow-lg transition-all duration-300"
      onClick={() => onItemClick(item)}
    >
      <div className="aspect-square overflow-hidden rounded-t-lg">
        <img
          src={item.images[0] || "/placeholder-image.jpg"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistToggle}
            className="p-1 hover:bg-gray-100"
          >
            <Heart 
              className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {item.brand} • Size {item.size}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">
              ${item.price}
            </span>
            <Badge className={`text-xs ${getConditionColor(item.condition)}`}>
              {item.condition}
            </Badge>
          </div>
        </div>
        
        {item.location && (
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{item.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
