
"use client";

import { useState } from "react";
import { Heart, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { AuthModal } from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { wishlistItems, loading, removeItem } = useWishlist();
  const [selectedItem, setSelectedItem] = useState<(any & { id: string }) | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleRemoveFromWishlist = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      await removeItem(itemId);
      toast({ title: "Success", description: "Item removed from wishlist." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove item.", variant: "destructive" });
    }
  };

  const handleItemClick = (item: any & { id: string }) => {
    setSelectedItem(item);
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

  if (!user) {
    return (
      <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-4">Save items you love to see them here</p>
          <Button variant="default" onClick={() => setShowAuthModal(true)}>Sign In</Button>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-2 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">Items you've saved for later</p>
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
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start browsing to save items you love</p>
            <Button asChild variant="default">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  <Image
                    src={item.images[0] || "https://placehold.co/400x400.png"}
                    alt={item.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleItemClick(item)}
                    data-ai-hint="fashion clothing"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveFromWishlist(e, item.id)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full h-8 w-8"
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
                  <Button onClick={() => handleItemClick(item)} variant="default" className="w-full">View Item</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ItemDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
