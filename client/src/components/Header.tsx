import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

export const Header = () => {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-olive rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl text-gray-900">
                  <span className="font-bold">Preloved</span>
                  <span className="font-light">ByNaju</span>
                </span>
              </Link>

              <nav className="hidden md:flex space-x-8">
                <Link 
                  href="/" 
                  className={`text-gray-700 hover:text-olive transition-colors ${
                    location === "/" ? "text-olive font-medium" : ""
                  }`}
                >
                  Shop
                </Link>
                <Link 
                  href="/sell" 
                  className={`text-gray-700 hover:text-olive transition-colors ${
                    location === "/sell" ? "text-olive font-medium" : ""
                  }`}
                >
                  Sell
                </Link>
                {user?.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className={`text-gray-700 hover:text-olive transition-colors ${
                      location === "/admin" ? "text-olive font-medium" : ""
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  href="/about" 
                  className={`text-gray-700 hover:text-olive transition-colors ${
                    location === "/about" ? "text-olive font-medium" : ""
                  }`}
                >
                  About
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>



              {user ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/sell" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Listings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-olive text-white px-4 py-2 rounded-full hover:bg-olive/90 transition-colors"
                >
                  Sign In
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-gray-700 hover:text-olive py-2">
                  Shop
                </Link>
                <Link href="/sell" className="text-gray-700 hover:text-olive py-2">
                  Sell
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-olive py-2">
                  About
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};