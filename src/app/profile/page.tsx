
"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Edit, Camera, ShoppingBag, BarChart2, Star, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { AuthModal } from "@/components/AuthModal";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { updateProfile, updateEmail } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, loading: authLoading, firebaseUser, refetchUser } = useAuth();
  const { items: userItems, loading: itemsLoading } = useItems({ 
    sellerId: user?.id, 
    includeAll: true,
    enabled: !!user?.id 
  });
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    email: "",
    photoURL: "",
  });
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user]);

  const isLoading = authLoading || (!!user && itemsLoading);

  const handleEditToggle = () => {
    if (isEditing) {
      if (user) {
        setEditData({
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
        });
        setNewProfilePic(null);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setNewProfilePic(file);
    const reader = new FileReader();
    reader.onload = (event) => {
        setEditData(prev => ({...prev, photoURL: event.target?.result as string}));
    }
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || !firebaseUser) return;
    setIsSaving(true);

    try {
        let newPhotoURL = user.photoURL;

        if (newProfilePic) {
            const filePath = `profile-pictures/${user.firebaseUid}/${Date.now()}-${newProfilePic.name}`;
            const { error: uploadError } = await supabase.storage
              .from('profile-pictures')
              .upload(filePath, newProfilePic);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('profile-pictures')
              .getPublicUrl(filePath);
            newPhotoURL = publicUrl;
        }

        await updateProfile(firebaseUser, { 
            displayName: editData.displayName, 
            photoURL: newPhotoURL 
        });

        if (firebaseUser.email !== editData.email) {
            // Note: Updating email requires re-authentication. Handle this flow if needed.
            // For now, we'll keep it simple and not allow email change from profile.
            // await updateEmail(firebaseUser, editData.email);
        }

        const response = await fetch('/api/users/current', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: editData.displayName,
            photoURL: newPhotoURL
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile in database.');
        }

        await refetchUser();
        toast({ title: "Profile updated", description: "Your changes have been saved." });
        setIsEditing(false);
        setNewProfilePic(null);

    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              {/* <User className="w-12 h-12 text-primary" /> */}
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Join Preloved</h1>
            <p className="text-gray-600 mb-6">Create your profile to start buying and selling preloved fashion items.</p>
            <Button onClick={() => setShowAuthModal(true)} variant="default" size="lg">Sign Up / Sign In</Button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }
  
  if (!user) {
     return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  const soldItems = userItems.filter(item => item.sellStatus === 'sold').length;
  
  const stats = [
    { label: "Items Listed", value: userItems.length, icon: ShoppingBag },
    { label: "Items Sold", value: soldItems, icon: BarChart2 },
    { label: "Rating", value: user.rating, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your stats.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Profile Information
                <Button variant="ghost" size="sm" onClick={handleEditToggle}>
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Image
                    src={editData.photoURL || "https://placehold.co/96x96.png"}
                    alt={editData.displayName || "User"}
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                    width={96}
                    height={96}
                    data-ai-hint="profile person"
                  />
                  {isEditing && (
                    <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-white shadow-lg rounded-full p-2 cursor-pointer hover:bg-gray-100">
                      <Camera className="w-4 h-4" />
                      <input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</Label>
                      <Input id="displayName" value={editData.displayName} onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))} placeholder="Enter your name"/>
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</Label>
                      <Input id="email" type="email" value={editData.email} onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" disabled/>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} variant="default" disabled={isSaving}>
                         {isSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
                      </Button>
                      <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      {/* <User className="w-5 h-5 text-gray-400" /> */}
                      <div>
                        <p className="text-sm text-gray-600">Display Name</p>
                        <p className="font-medium">{user.displayName || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 text-center">
                      <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { color: "bg-green-500", text: `Item "Vintage Denim Jacket" was viewed 5 times`, time: "2 hours ago" },
                    { color: "bg-blue-500", text: `New message from potential buyer`, time: "4 hours ago" },
                    { color: "bg-orange-500", text: `Item "Black Midi Dress" was added to 3 wishlists`, time: "1 day ago" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                      <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                      <div>
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
