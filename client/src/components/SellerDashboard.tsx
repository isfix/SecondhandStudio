import { useState, useEffect } from "react";
import { Upload, Eye, Heart, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { createItem } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { categories, sizes, conditions, colors } from "@shared/schema";

export const SellerDashboard = () => {
  const { user } = useAuth();
  const { items, loading } = useItems({ sellerId: user?.id });
  const { toast } = useToast();
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    category: "",
    size: "",
    condition: "",
    price: "",
    color: "",
    location: "",
    images: [] as string[],
  });
  
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO: Implement image upload to Firebase Storage
    console.log("Image upload:", files);
  };

  const loadSellerFeedback = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/items?sellerId=${user.id}&includeAll=true`);
      const allItems = await response.json();
      const itemsWithFeedback = allItems.filter((item: any) => 
        item.approvalStatus !== 'pending' && item.adminNotes
      );
      setFeedbackItems(itemsWithFeedback);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    }
  };

  useEffect(() => {
    loadSellerFeedback();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setUploading(true);
      
      await createItem({
        ...formData,
        price: formData.price,
        sellerId: user.id,
        images: formData.images.length > 0 ? formData.images : ["/placeholder-image.jpg"],
        isActive: true,
      });

      toast({
        title: "Success",
        description: "Item submitted for admin review! You'll be notified once it's reviewed.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        brand: "",
        category: "",
        size: "",
        condition: "",
        price: "",
        color: "",
        location: "",
        images: [],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const approvedItems = items.filter(item => item.approvalStatus === 'approved');
  const pendingItems = items.filter(item => item.approvalStatus === 'pending');
  const rejectedItems = items.filter(item => item.approvalStatus === 'rejected');
  const unreadFeedback = feedbackItems.filter(item => !item.feedbackRead);

  const stats = [
    { label: "Approved Items", value: approvedItems.length, icon: Plus },
    { label: "Pending Review", value: pendingItems.length, icon: Eye },
    { label: "Total Views", value: "156", icon: Heart },
    { label: "New Feedback", value: unreadFeedback.length, icon: Plus },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Manage your listings and sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="bg-olive/10 p-3 rounded-full">
                    <Icon className="w-5 h-5 text-olive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feedback Notifications */}
      {feedbackItems.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Admin Feedback
              <Badge variant="outline">{feedbackItems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={item.approvalStatus === 'approved' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {item.approvalStatus}
                      </Badge>
                      {item.adminNotes && (
                        <span className="text-xs text-gray-600 truncate max-w-48">
                          "{item.adminNotes}"
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedFeedbackItem(item);
                      setShowFeedbackModal(true);
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
              {feedbackItems.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowFeedbackModal(true)}
                >
                  View All Feedback ({feedbackItems.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload New Item */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag & drop images here</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="text-olive hover:underline cursor-pointer"
                >
                  or browse files
                </label>
              </div>

              <Input
                placeholder="Item title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />

              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  required
                />
                
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Price ($)"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
                
                <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Location (optional)"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-olive text-white hover:bg-olive/90"
              >
                {uploading ? "Uploading..." : "List Item"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Listings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading your listings...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No listings yet. Create your first listing to get started!
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={item.images[0] || "/placeholder-image.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.brand} • Size {item.size} • ${item.price}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={
                            item.approvalStatus === 'approved' ? 'default' : 
                            item.approvalStatus === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {item.approvalStatus}
                        </Badge>
                        {item.approvalStatus === 'rejected' && item.adminNotes && (
                          <span className="text-xs text-red-600">Has feedback</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          <Eye className="w-3 h-3 inline mr-1" />
                          24 views
                        </span>
                        <span className="text-sm text-gray-500">
                          <Heart className="w-3 h-3 inline mr-1" />
                          3 likes
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" className="bg-olive text-white hover:bg-olive/90">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFeedbackItem ? `Feedback for: ${selectedFeedbackItem.title}` : 'All Feedback'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFeedbackItem ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={selectedFeedbackItem.approvalStatus === 'approved' ? 'default' : 'destructive'}
                  >
                    {selectedFeedbackItem.approvalStatus}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Reviewed on {new Date(selectedFeedbackItem.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Admin Feedback:</h4>
                  <p className="text-gray-700">{selectedFeedbackItem.adminNotes}</p>
                </div>

                {selectedFeedbackItem.approvalStatus === 'rejected' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">Next Steps:</h4>
                    <p className="text-blue-700 text-sm">
                      You can edit your item based on the feedback and resubmit it for review. 
                      Please address the concerns mentioned above.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Navigate to edit item
                        setShowFeedbackModal(false);
                      }}
                    >
                      Edit Item
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {feedbackItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.brand} - {item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={item.approvalStatus === 'approved' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {item.approvalStatus}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.adminNotes && (
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            "{item.adminNotes}"
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFeedbackItem(item)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
