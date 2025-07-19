
"use client";

import { useState, useMemo } from "react";
import { X, Heart, MapPin, Clock, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ItemDetailModalProps {
  item: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailModal = ({ item, isOpen, onClose }: ItemDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem, removeItem, wishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isInWishlist = useMemo(() => {
    if (!item) return false;
    return wishlist.some(w => w.itemId === item.id);
  }, [wishlist, item]);

  if (!item) return null;

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    };

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

  const handleContactSeller = () => {
    toast({ title: "Feature coming soon!", description: "Messaging will be enabled in a future update."});
  };

  const handleWhatsAppContact = () => {
    toast({ title: "Feature coming soon!", description: "WhatsApp integration will be enabled in a future update."});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setCurrentImageIndex(0);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={item.images[currentImageIndex] || "https://placehold.co/600x600.png"}
                alt={item.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                data-ai-hint="fashion clothing"
              />
            </div>
            
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 bg-gray-100 ${
                      index === currentImageIndex ? 'border-olive' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                      data-ai-hint="fashion clothing"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">{item.title}</h1>
                <p className="text-lg text-gray-600">{item.brand} • Size {item.size}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className="p-2 h-10 w-10 hover:bg-gray-100 rounded-full"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">${item.price}</span>
              <Badge className={`text-sm ${getConditionColor(item.condition)}`}>
                {item.condition}
              </Badge>
            </div>
            
            <div className="space-y-4">
              {item.location && (
                <div className="flex items-center space-x-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{item.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Listed recently</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900">{item.category}</span>
                </div>
                {item.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="text-gray-900">{item.color}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="text-gray-900">{item.condition}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleContactSeller}
                variant="default"
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
              <Button
                onClick={handleWhatsAppContact}
                variant="outline-olive"
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
