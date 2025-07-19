import { useState } from "react";
import { X, Heart, MapPin, Clock, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import type { Item } from "@shared/schema";

interface ItemDetailModalProps {
  item: (Item & { id: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailModal = ({ item, isOpen, onClose }: ItemDetailModalProps) => {
  const { user } = useAuth();
  const { addItem, removeItem } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!item) return null;

  const handleWishlistToggle = async () => {
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

  const handleContactSeller = () => {
    // TODO: Implement chat functionality
    console.log("Contact seller clicked");
  };

  const handleWhatsAppContact = () => {
    // TODO: Implement WhatsApp redirect
    console.log("WhatsApp contact clicked");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl">
              <img
                src={item.images[currentImageIndex] || "/placeholder-image.jpg"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {item.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {item.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 ${
                      index === currentImageIndex ? 'border-olive' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
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
                size="sm"
                onClick={handleWishlistToggle}
                className="p-2 hover:bg-gray-100"
              >
                <Heart 
                  className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
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
                className="w-full bg-olive text-white hover:bg-olive/90"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
              <Button
                onClick={handleWhatsAppContact}
                variant="outline"
                className="w-full border-olive text-olive hover:bg-olive/5"
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
