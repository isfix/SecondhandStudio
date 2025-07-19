import { useState } from "react";
import { Heart, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import type { Item } from "@shared/schema";

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlist, loading, removeItem } = useWishlist();
  const [selectedItem, setSelectedItem] = useState<(Item & { id: string }) | null>(null);

  // Get full item details for wishlist items
  const wishlistItemIds = wishlist.map(w => w.itemId);
  const { items: wishlistItems } = useItems({ realTime: true });
  const filteredWishlistItems = wishlistItems.filter(item => wishlistItemIds.includes(item.id));

  const handleRemoveFromWishlist = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleItemClick = (item: Item & { id: string }) => {
    setSelectedItem(item);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h1>
          <p className="text-gray-600">Save items you love to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start browsing to save items you love</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-olive text-white hover:bg-olive/90"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlistItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  <img
                    src={item.images[0] || "/placeholder-image.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.brand} • Size {item.size}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">${item.price}</span>
                    <Badge className={`text-xs ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleItemClick(item)}
                    className="w-full bg-olive text-white hover:bg-olive/90"
                  >
                    View Item
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
