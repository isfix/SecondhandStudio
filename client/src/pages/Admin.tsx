import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit2, Trash2, BarChart3, Users, ShoppingBag, MessageSquare, Bot, Settings, FileText, TrendingUp, Eye, Heart, Star, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  aiGeneratedContent?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalItems: number;
  totalSales: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    metadata: any;
  }>;
  itemStats: {
    labels: string[];
    views: number[];
    likes: number[];
  };
  userGrowth: {
    labels: string[];
    users: number[];
  };
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [isReviewHistoryModalOpen, setIsReviewHistoryModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);


  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadDashboardData();
    loadPendingItems();
    loadReviewHistory();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load analytics data
      const analyticsResponse = await fetch("/api/admin/analytics");
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Load content pages
      const pagesResponse = await fetch("/api/admin/content-pages");
      const pagesData = await pagesResponse.json();
      setPages(pagesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingItems = async () => {
    try {
      const response = await fetch("/api/items?approvalStatus=pending");
      const items = await response.json();
      setPendingItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending items",
        variant: "destructive",
      });
    }
  };

  const loadReviewHistory = async () => {
    try {
      // Replace with your API endpoint to fetch review history
      const response = await fetch("/api/admin/review-history");
      const data = await response.json();
      setReviewHistory(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load review history",
        variant: "destructive",
      });
    }
  };


  const handleApproveItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve item");
      }

      toast({
        title: "Success",
        description: "Item approved successfully",
      });

      loadPendingItems();
      setIsApprovalModalOpen(false);
      setAdminNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve item",
        variant: "destructive",
      });
    }
  };

  const handleRejectItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject item");
      }

      toast({
        title: "Success",
        description: "Item rejected successfully",
      });

      loadPendingItems();
      setIsApprovalModalOpen(false);
      setAdminNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject item",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      const response = await fetch(`/api/admin/items/bulk-${bulkAction}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemIds: selectedItems, adminNotes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk ${bulkAction} items`);
      }

      toast({
        title: "Success",
        description: `Items ${bulkAction}ed successfully`,
      });

      loadPendingItems();
      setIsBulkActionModalOpen(false);
      setAdminNotes("");
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to bulk ${bulkAction} items`,
        variant: "destructive",
      });
    }
  };


  const generateAIContent = async (originalContent: string, contentType: string) => {
    setIsAiGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalContent,
          contentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI content");
      }

      const data = await response.json();
      return data.generatedContent;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreatePage = async (pageData: Partial<ContentPage>) => {
    try {
      const response = await fetch("/api/admin/content-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error("Failed to create page");
      }

      await loadDashboardData();
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Page created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePage = async (pageId: string, pageData: Partial<ContentPage>) => {
    try {
      const response = await fetch(`/api/admin/content-pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error("Failed to update page");
      }

      await loadDashboardData();
      setIsEditModalOpen(false);
      setSelectedPage(null);
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive",
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/admin/content-pages/${pageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      await loadDashboardData();
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const dashboardCards = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Items",
      value: analytics?.totalItems || 0,
      icon: ShoppingBag,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Total Views",
      value: analytics?.totalViews || 0,
      icon: Eye,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Total Sales",
      value: `$${analytics?.totalSales || 0}`,
      icon: DollarSign,
      color: "bg-orange-500",
      change: "+23%",
    },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Analytics Overview',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your marketplace content and monitor analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Item Approvals
              {pendingItems.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {card.title}
                      </CardTitle>
                      <div className={`${card.color} p-2 rounded-full`}>
                        <card.icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                      <p className="text-xs text-green-600 mt-1">{card.change} from last month</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line
                      data={{
                        labels: analytics.userGrowth.labels,
                        datasets: [
                          {
                            label: 'Users',
                            data: analytics.userGrowth.users,
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          },
                        ],
                      }}
                      options={chartOptions}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Item Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Bar
                      data={{
                        labels: analytics.itemStats.labels,
                        datasets: [
                          {
                            label: 'Views',
                            data: analytics.itemStats.views,
                            backgroundColor: 'rgba(34, 197, 94, 0.8)',
                          },
                          {
                            label: 'Likes',
                            data: analytics.itemStats.likes,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                          },
                        ],
                      }}
                      options={chartOptions}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Item Approvals</h2>
              <Badge variant="outline" className="text-sm">
                {pendingItems.length} pending items
              </Badge>
            </div>

            {pendingItems.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending items</h3>
                    <p className="text-gray-500">All items have been reviewed and approved or rejected.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingItems.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.brand} - {item.category}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Price:</span>
                          <span className="text-sm">${item.price}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Condition:</span>
                          <span className="text-sm">{item.condition}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Size:</span>
                          <span className="text-sm">{item.size}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Color:</span>
                          <span className="text-sm">{item.color}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Material:</span>
                          <span className="text-sm">{item.material}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Original Price:</span>
                          <span className="text-sm">${item.originalPrice}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Purchase Date:</span>
                          <span className="text-sm">{item.purchaseDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Wear Frequency:</span>
                          <span className="text-sm">{item.wearFrequency}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Reason for Selling:</span>
                          <span className="text-sm">{item.reasonForSelling}</span>
                        </div>

                        {item.images && item.images.length > 0 && (
                          <div className="mt-4">
                            <span className="text-sm font-medium">Images:</span>
                            <div className="flex gap-2 mt-2">
                              {item.images.slice(0, 3).map((image: string, index: number) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`${item.title} - ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              ))}
                              {item.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                                  +{item.images.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <p className="text-sm font-medium">Description:</p>
                          <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsApprovalModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Approval Modal */}
            {selectedItem && (
              <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Review Item: {selectedItem.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input value={selectedItem.title} readOnly />
                      </div>
                      <div>
                        <Label>Brand</Label>
                        <Input value={selectedItem.brand} readOnly />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input value={selectedItem.category} readOnly />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input value={`$${selectedItem.price}`} readOnly />
                      </div>
                      <div>
                        <Label>Condition</Label>
                        <Input value={selectedItem.condition} readOnly />
                      </div>
                      <div>
                        <Label>Size</Label>
                        <Input value={selectedItem.size} readOnly />
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea value={selectedItem.description} readOnly rows={4} />
                    </div>

                    <div>
                      <Label>Admin Notes</Label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleApproveItem(selectedItem.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        Approve Item
                      </Button>
                      <Button
                        onClick={() => handleRejectItem(selectedItem.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        Reject Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Bulk Action Modal */}
            <Dialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {bulkAction === 'approve' ? 'Bulk Approve' : 'Bulk Reject'} Items
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    You are about to {bulkAction} {selectedItems.length} items. This action cannot be undone.
                  </p>

                  <div>
                    <Label>Admin Notes (optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleBulkAction}
                      className={`flex-1 ${bulkAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      {bulkAction === 'approve' ? 'Approve' : 'Reject'} {selectedItems.length} Items
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsBulkActionModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Review History Modal */}
            <Dialog open={isReviewHistoryModalOpen} onOpenChange={setIsReviewHistoryModalOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Review History</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {reviewHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No review history available</p>
                  ) : (
                    <div className="space-y-3">
                      {reviewHistory.map((review) => (
                        <Card key={review.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{review.itemTitle}</h4>
                              <p className="text-sm text-gray-600">{review.brand} - {review.category}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant={review.decision === 'approved' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {review.decision}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  by {review.reviewerName} on {new Date(review.reviewedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {review.notes && (
                                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                  "{review.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Content Pages</h2>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Page</DialogTitle>
                  </DialogHeader>
                  <PageForm onSubmit={handleCreatePage} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <Card key={page.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <Badge variant={page.isPublished ? "default" : "secondary"}>
                        {page.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">/{page.slug}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {page.content.substring(0, 100)}...
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPage(page);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPage && (
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Page</DialogTitle>
                  </DialogHeader>
                  <PageForm
                    initialData={selectedPage}
                    onSubmit={(data) => handleUpdatePage(selectedPage.id, data)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Tools</h2>
              <p className="text-gray-600 mb-8">
                Use Google Gemini AI to enhance your content and improve user experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Content Enhancement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate improved descriptions, SEO meta tags, and engaging content
                  </p>
                  <Button
                    onClick={() => generateAIContent("Sample content", "enhancement")}
                    disabled={isAiGenerating}
                    className="w-full"
                  >
                    {isAiGenerating ? "Generating..." : "Enhance Content"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    SEO Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically generate SEO-friendly titles, descriptions, and keywords
                  </p>
                  <Button
                    onClick={() => generateAIContent("Sample content", "seo")}
                    disabled={isAiGenerating}
                    className="w-full"
                  >
                    {isAiGenerating ? "Generating..." : "Optimize SEO"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable AI Content Generation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Automatic Content Moderation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Analytics Tracking</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PageForm({ 
  initialData, 
  onSubmit 
}: { 
  initialData?: ContentPage; 
  onSubmit: (data: Partial<ContentPage>) => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords || "",
    isPublished: initialData?.isPublished || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          required
        />
      </div>

      <div>
        <Label htmlFor="metaDescription">Meta Description</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="metaKeywords">Meta Keywords</Label>
        <Input
          id="metaKeywords"
          value={formData.metaKeywords}
          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          checked={formData.isPublished}
          onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
        />
        <Label htmlFor="isPublished">Published</Label>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Update Page" : "Create Page"}
      </Button>
    </form>
  );
}