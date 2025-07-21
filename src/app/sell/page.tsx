
"use client";

import { useAuth } from "@/hooks/useAuth";
import { SellerDashboard } from "@/components/SellerDashboard";
import { AuthModal } from "@/components/AuthModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Sell() {
  const { user, loading, refetchUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setSyncing(true);
      refetchUser().finally(() => setSyncing(false));
    }
  }, [user, loading, refetchUser]);

  if (loading || syncing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Start Selling Today</h1>
            <p className="text-gray-600 mb-6">
              Join thousands of sellers turning their preloved fashion into cash. 
              Create your account to upload items, manage listings, and connect with buyers.
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              variant="default"
              size="lg"
            >
              Sign Up to Sell
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              It's free to get started • No listing fees • Secure payments
            </p>
          </div>
        </div>
        
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerDashboard />
    </div>
  );
}
