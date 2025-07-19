
"use client";
// @ts-nocheck

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit2, Trash2, BarChart3, Users, ShoppingBag, Bot, Settings, FileText, TrendingUp, Eye, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from "framer-motion";
import Image from "next/image";

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

const ADMIN_USER_ID = '33def218-4d89-462d-9309-4512c4055268';


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
  userChange: number;
  itemChange: number;
  viewChange: number;
  salesChange: number;
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboardData();
      loadPendingItems();
      loadReviewHistory();
    }
  }, [user]);

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You do not have the necessary permissions to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, pagesResponse] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/content-pages")
      ]);
      const analyticsData = await analyticsResponse.json();
      const pagesData = await pagesResponse.json();
      setAnalytics(analyticsData);
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

  const handleApproveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) throw new Error("Failed to approve item");

      toast({ title: "Success", description: "Item approved successfully" });
      await loadPendingItems();
      setIsApprovalModalOpen(false);
      setAdminNotes("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve item", variant: "destructive" });
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) throw new Error("Failed to reject item");

      toast({ title: "Success", description: "Item rejected successfully" });
      await loadPendingItems();
      setIsApprovalModalOpen(false);
      setAdminNotes("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject item", variant: "destructive" });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;
    try {
      const response = await fetch(`/api/admin/items/bulk-${bulkAction}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: selectedItems, adminNotes }),
      });
      if (!response.ok) throw new Error(`Failed to bulk ${bulkAction} items`);
      toast({ title: "Success", description: `Items ${bulkAction}ed successfully` });
      await loadPendingItems();
      setIsBulkActionModalOpen(false);
      setAdminNotes("");
      setSelectedItems([]);
    } catch (error) {
      toast({ title: "Error", description: `Failed to bulk ${bulkAction} items`, variant: "destructive" });
    }
  };


  const generateAIContent = async (originalContent: string, contentType: string) => {
    setIsAiGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalContent, contentType }),
      });

      if (!response.ok) throw new Error("Failed to generate AI content");

      const data = await response.json();
      return data.generatedContent;
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate AI content", variant: "destructive" });
      return null;
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreatePage = async (pageData: Partial<ContentPage>) => {
    try {
      const response = await fetch("/api/admin/content-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      if (!response.ok) throw new Error("Failed to create page");
      await loadDashboardData();
      setIsCreateModalOpen(false);
      toast({ title: "Success", description: "Page created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create page", variant: "destructive" });
    }
  };

  const handleUpdatePage = async (pageId: string, pageData: Partial<ContentPage>) => {
    try {
      const response = await fetch(`/api/admin/content-pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      if (!response.ok) throw new Error("Failed to update page");
      await loadDashboardData();
      setIsEditModalOpen(false);
      setSelectedPage(null);
      toast({ title: "Success", description: "Page updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update page", variant: "destructive" });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/admin/content-pages/${pageId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete page");
      await loadDashboardData();
      toast({ title: "Success", description: "Page deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete page", variant: "destructive" });
    }
  };

  function safePercent(val: any) {
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  }
  const dashboardCards = [
    { title: "Total Users", value: analytics?.totalUsers || 0, icon: Users, color: "bg-blue-100 text-blue-600", change: analytics ? `${safePercent(analytics.userChange) >= 0 ? '+' : ''}${safePercent(analytics.userChange).toFixed(1)}%` : '0%', changeLabel: 'from last month' },
    { title: "Total Items", value: analytics?.totalItems || 0, icon: ShoppingBag, color: "bg-green-100 text-green-600", change: analytics ? `${safePercent(analytics.itemChange) >= 0 ? '+' : ''}${safePercent(analytics.itemChange).toFixed(1)}%` : '0%', changeLabel: 'from last month' },
    { title: "Total Views", value: analytics?.totalViews || 0, icon: Eye, color: "bg-purple-100 text-purple-600", change: analytics ? `${safePercent(analytics.viewChange) >= 0 ? '+' : ''}${safePercent(analytics.viewChange).toFixed(1)}%` : '0%', changeLabel: 'from last month' },
    { title: "Total Sales", value: `$${analytics?.totalSales || 0}`, icon: DollarSign, color: "bg-orange-100 text-orange-600", change: analytics ? `${safePercent(analytics.salesChange) >= 0 ? '+' : ''}${safePercent(analytics.salesChange).toFixed(1)}%` : '0%', changeLabel: 'from last month' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
     maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Oversee marketplace operations, content, and analytics.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
            <TabsTrigger value="approvals">
                <ShoppingBag className="h-4 w-4 mr-2" />Item Approvals
                {pendingItems.length > 0 && <Badge className="ml-2">{pendingItems.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="content"><FileText className="h-4 w-4 mr-2" />Content</TabsTrigger>
            <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />AI Tools</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.map((card, index) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                      <div className={`p-2 rounded-full ${card.color}`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{card.value}</div>
                      <p className={`text-xs ${card.change.startsWith('-') ? 'text-red-600' : 'text-green-600'} mt-1`}>{card.change} {card.changeLabel}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {analytics && analytics.userGrowth && analytics.itemStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>User Growth</CardTitle></CardHeader><CardContent className="h-[300px]">
                  <Line data={{ labels: analytics.userGrowth.labels || [], datasets: [{ label: 'Users', data: analytics.userGrowth.users || [], borderColor: 'hsl(var(--primary))', backgroundColor: 'hsla(var(--primary), 0.1)', tension: 0.2 }] }} options={chartOptions} />
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Item Performance</CardTitle></CardHeader><CardContent className="h-[300px]">
                  <Bar data={{ labels: analytics.itemStats.labels || [], datasets: [
                    { label: 'Views', data: analytics.itemStats.views || [], backgroundColor: 'hsla(var(--primary), 0.7)' },
                    { label: 'Likes', data: analytics.itemStats.likes || [], backgroundColor: 'hsla(var(--primary), 0.4)' }
                  ] }} options={chartOptions} />
                </CardContent></Card>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No analytics data available.</div>
            )}
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Item Approval Queue</CardTitle>
                    <CardDescription>Review new submissions from sellers.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsBulkActionModalOpen(true)} disabled={pendingItems.length === 0}>Bulk Actions</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsReviewHistoryModalOpen(true)}>Review History</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pendingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Queue is Clear!</h3>
                    <p className="text-muted-foreground">No items are currently awaiting review.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.images && item.images.length > 0 && (
                          <div className="relative aspect-[4/3] w-full bg-secondary">
                            <Image src={item.images[0]} alt={item.title} layout="fill" className="object-cover" />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{item.brand} - {item.category}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between pt-2">
                            <span className="font-semibold text-lg">${item.price}</span>
                            <Badge variant="secondary">{item.condition}</Badge>
                          </div>
                          <Button variant="default" size="sm" onClick={() => { setSelectedItem(item); setIsApprovalModalOpen(true); }} className="w-full mt-4">Review Item</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                 <div className="flex items-center justify-between">
                    <CardTitle>Content Pages</CardTitle>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4 mr-2" />Create Page</Button></DialogTrigger>
                      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Create New Page</DialogTitle></DialogHeader><PageForm onSubmit={handleCreatePage} /></DialogContent>
                    </Dialog>
                  </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(pages) ? pages.map((page) => (
                    <Card key={page.id} className="relative">
                      <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">{page.title}</CardTitle><Badge variant={page.isPublished ? "default" : "secondary"}>{page.isPublished ? "Published" : "Draft"}</Badge></div><p className="text-sm text-muted-foreground">/{page.slug}</p></CardHeader>
                      <CardContent><p className="text-sm text-muted-foreground mb-4 line-clamp-3 h-16">{page.content.substring(0, 100)}...</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedPage(page); setIsEditModalOpen(true); }}><Edit2 className="h-4 w-4 mr-1" />Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePage(page.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) : <div className="text-muted-foreground">No content pages found.</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
             <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />AI-Powered Tools</CardTitle><CardDescription>Use Google Gemini AI to enhance your content and improve user experience</CardDescription></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5" />Content Enhancement</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">Generate improved descriptions, SEO meta tags, and engaging content</p><Button onClick={() => generateAIContent("Sample content", "enhancement")} disabled={isAiGenerating} className="w-full">{isAiGenerating ? "Generating..." : "Enhance Content"}</Button></CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />SEO Optimization</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">Automatically generate SEO-friendly titles, descriptions, and keywords</p><Button onClick={() => generateAIContent("Sample content", "seo")} disabled={isAiGenerating} className="w-full">{isAiGenerating ? "Generating..." : "Optimize SEO"}</Button></CardContent></Card>
             </CardContent></Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card><CardHeader><CardTitle>System Settings</CardTitle><CardDescription>Configure platform-wide settings and integrations.</CardDescription></CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="flex items-center justify-between p-4 border rounded-lg"><Label htmlFor="ai-content">Enable AI Content Generation</Label><Switch id="ai-content" defaultChecked /></div>
                <div className="flex items-center justify-between p-4 border rounded-lg"><Label htmlFor="moderation">Automatic Content Moderation</Label><Switch id="moderation" defaultChecked /></div>
                <div className="flex items-center justify-between p-4 border rounded-lg"><Label htmlFor="analytics">Enable Analytics Tracking</Label><Switch id="analytics" defaultChecked /></div>
                <div className="flex items-center justify-between p-4 border rounded-lg"><Label htmlFor="notifications">Email Notifications</Label><Switch id="notifications" /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedItem && (
        <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Review Item: {selectedItem.title}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={selectedItem.title} readOnly /></div>
                <div><Label>Brand</Label><Input value={selectedItem.brand} readOnly /></div>
                <div><Label>Category</Label><Input value={selectedItem.category} readOnly /></div>
                <div><Label>Price</Label><Input value={`$${selectedItem.price}`} readOnly /></div>
                <div><Label>Condition</Label><Input value={selectedItem.condition} readOnly /></div>
                <div><Label>Size</Label><Input value={selectedItem.size} readOnly /></div>
              </div>
              <div><Label>Description</Label><Textarea value={selectedItem.description} readOnly rows={4} /></div>
              <div><Label>Admin Notes</Label><Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes about your decision... (required for rejection)" rows={3}/></div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleApproveItem(selectedItem.id)} className="flex-1" variant="default">Approve Item</Button>
                <Button onClick={() => handleRejectItem(selectedItem.id)} variant="destructive" className="flex-1">Reject Item</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {selectedPage && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Page</DialogTitle></DialogHeader>
            <PageForm initialData={selectedPage} onSubmit={(data) => handleUpdatePage(selectedPage.id, data)} />
        </DialogContent></Dialog>
      )}

      <Dialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Bulk Approve/Reject Items</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4"><div className="flex flex-col gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
              {pendingItems.map(item => (<label key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><input type="checkbox" checked={selectedItems.includes(item.id)} onChange={e => {if (e.target.checked) setSelectedItems([...selectedItems, item.id]); else setSelectedItems(selectedItems.filter(id => id !== item.id));}}/><span>{item.title}</span></label>))}</div>
            <Select value={bulkAction || undefined} onValueChange={v => setBulkAction(v as 'approve' | 'reject')}><SelectTrigger><SelectValue placeholder="Select Action" /></SelectTrigger><SelectContent><SelectItem value="approve">Approve</SelectItem><SelectItem value="reject">Reject</SelectItem></SelectContent></Select>
            <Textarea placeholder="Admin notes (optional for approval)" value={adminNotes} onChange={e => setAdminNotes(e.target.value)}/>
            <Button onClick={handleBulkAction} disabled={!bulkAction || selectedItems.length === 0}>Execute Bulk Action</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isReviewHistoryModalOpen} onOpenChange={setIsReviewHistoryModalOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Review History</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2 py-4">
            {reviewHistory.length === 0 ? (<div className="text-muted-foreground text-center py-8">No review history found.</div>) : (reviewHistory.map((entry: any) => (<div key={entry.id} className="border-b pb-2 mb-2 last:border-b-0"><div className="flex items-center gap-2"><span className="font-medium text-foreground">{entry.itemTitle}</span><Badge variant={entry.action === 'approved' ? 'default' : 'destructive'}>{entry.action}</Badge></div><div className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</div>{entry.adminNotes && <p className="text-sm text-muted-foreground mt-1">Notes: <span className="text-foreground">{entry.adminNotes}</span></p>}</div>)))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageForm({ initialData, onSubmit }: { initialData?: ContentPage; onSubmit: (data: Partial<ContentPage>) => void;}) {
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
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div><Label htmlFor="title">Title</Label><Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required/></div>
      <div><Label htmlFor="slug">Slug</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required/></div>
      <div><Label htmlFor="content">Content</Label><Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} required/></div>
      <div><Label htmlFor="metaDescription">Meta Description</Label><Textarea id="metaDescription" value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} rows={2}/></div>
      <div><Label htmlFor="metaKeywords">Meta Keywords</Label><Input id="metaKeywords" value={formData.metaKeywords} onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })} placeholder="keyword1, keyword2, keyword3"/></div>
      <div className="flex items-center space-x-2 pt-2"><Switch id="isPublished" checked={formData.isPublished} onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}/><Label htmlFor="isPublished">Published</Label></div>
      <Button type="submit" className="w-full mt-4">{initialData ? "Update Page" : "Create Page"}</Button>
    </form>
  );
}
