import { useAuth } from "@/hooks/useAuth";
import { SellerDashboard } from "@/components/SellerDashboard";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Sell() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive mx-auto mb-4"></div>
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
            <div className="bg-olive/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-12 h-12 text-olive" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Start Selling Today</h1>
            <p className="text-gray-600 mb-6">
              Join thousands of sellers turning their preloved fashion into cash. 
              Create your account to upload items, manage listings, and connect with buyers.
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-olive text-white px-8 py-3 rounded-full hover:bg-olive/90 transition-colors font-medium"
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
