
"use client";

import { useState } from "react";
import { Eye, Edit, Trash2, Plus, AlertTriangle, CheckCircle, LayoutGrid, ListPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { useToast } from "@/hooks/use-toast";
import { ItemForm } from "./ItemForm";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export const SellerDashboard = () => {
  const { user } = useAuth();
  const { items, loading, refetch } = useItems({ sellerId: user?.id, includeAll: true, enabled: !!user?.id });
  const { toast } = useToast();
  const [view, setView] = useState<'listings' | 'form'>('listings');

  const approvedItems = items.filter(item => item.approvalStatus === 'approved');
  const pendingItems = items.filter(item => item.approvalStatus === 'pending');
  const rejectedItems = items.filter(item => item.approvalStatus === 'rejected');

  const stats = [
    { label: "Approved Listings", value: approvedItems.length, icon: CheckCircle },
    { label: "Pending Review", value: pendingItems.length, icon: Eye },
    { label: "Needs Attention", value: rejectedItems.length, icon: AlertTriangle },
    { label: "Total Items", value: items.length, icon: LayoutGrid },
  ];

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      toast({ title: "Success", description: "Listing deleted." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending': return <Badge variant="secondary">Pending Review</Badge>;
      case 'rejected': return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <AnimatePresence mode="wait">
        {view === 'listings' ? (
          <motion.div
            key="listings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your listings, track their status, and add new items.</p>
              </div>
              <Button onClick={() => setView('form')} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
                      <div className="bg-primary/10 p-2 rounded-full">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Listings</CardTitle>
                <CardDescription>An overview of all your items and their current status.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading your listings...</div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16">
                     <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-gray-800">No listings yet</h3>
                     <p className="text-gray-500 mt-2">Click "Add New Item" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                          <Image
                            src={item.images?.[0] || "https://placehold.co/64x64.png"}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            data-ai-hint="fashion clothing"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.brand} • Size {item.size} • ${item.price}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {getStatusBadge(item.approvalStatus)}
                             {item.approvalStatus === 'rejected' && item.adminNotes && (
                              <p className="text-xs text-red-600 truncate max-w-xs">Feedback: "{item.adminNotes}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" disabled><Edit className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Edit</span></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Delete</span></Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <Button variant="ghost" onClick={() => setView('listings')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Add a New Item</h1>
              <p className="text-gray-600 mt-1">Fill out the form below to list your item for sale.</p>
            </div>
            <ItemForm onFormSubmit={() => { refetch(); setView('listings'); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
