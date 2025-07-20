
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "./ui/separator";

export const Header = () => {
  const pathname = usePathname();
  const { user, firebaseUser, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const navLinks = [
    { href: "/welcome", label: "Shop" },
    { href: "/sell", label: "Sell" },
    { href: "/about", label: "About" },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  const loggedInUser = user || firebaseUser;

  return (
    <>
      <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Left side */}
            <div className="flex-1 flex justify-start items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/icon.png" alt="Preloved ByNaju Logo" width={28} height={28} />
                <span className="text-xl font-heading text-foreground">
                  Prelovedbynajuw
                </span>
              </Link>
            </div>

            {/* Center Nav */}
            <nav className="hidden md:flex flex-1 justify-center items-center space-x-2">
              {navLinks.map(link => (
                <Button asChild variant="ghost" key={link.href} className={`text-base transition-colors hover:text-primary ${pathname === link.href ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                 <Link href={link.href}>
                  {link.label}
                </Link>
                </Button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex-1 flex justify-end items-center space-x-2">
              {loggedInUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full"
                      aria-label="User account menu"
                    >
                      {loggedInUser.photoURL ? (

                        <Image 
                          src={loggedInUser.photoURL} 
                          alt={loggedInUser.displayName || "User"} 
                          className="w-8 h-8 rounded-full object-cover"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{loggedInUser.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {loggedInUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sell">My Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              ) : (
                <div className="hidden md:flex items-center space-x-2">
                   <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="ghost"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="default"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
               <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileMenu(true)}
                aria-label="Open main menu"
              >
                <Menu className="h-6 w-6" />
              </Button>

            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: "-20%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-20%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-x-0 top-0 z-50 bg-background md:hidden shadow-lg"
              >
                 <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center space-x-2">
                       <Image src="/icon.png" alt="Preloved ByNaju Logo" width={28} height={28} />
                       <span className="text-lg text-foreground font-bold">
                         Prelovedbynajuw
                       </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                 </div>
                 <div className="p-6">
                    <nav className="flex flex-col space-y-2">
                      {navLinks.map(link => (
                          <Link 
                            href={link.href} 
                            key={link.href}
                            onClick={() => setShowMobileMenu(false)}
                            className={`text-lg font-medium p-3 rounded-md transition-colors ${pathname === link.href ? 'bg-secondary text-primary' : 'text-foreground hover:bg-secondary/70'}`}
                          >
                            {link.label}
                          </Link>
                      ))}
                    </nav>

                    <Separator className="my-6"/>

                    {loggedInUser ? (
                      <div className="space-y-2">
                         <Button asChild variant="outline" className="w-full justify-start text-lg p-6">
                           <Link href="/profile" onClick={() => setShowMobileMenu(false)}>Profile</Link>
                         </Button>
                         <Button onClick={() => { handleSignOut(); setShowMobileMenu(false); }} variant="outline" className="w-full justify-start text-lg p-6">
                           Sign Out
                         </Button>
                      </div>
                   ) : (
                     <Button onClick={() => { setShowMobileMenu(false); setShowAuthModal(true); }} variant="default" className="w-full text-lg p-6">
                        Sign In / Sign Up
                      </Button>
                   )}
                 </div>
              </motion.div>
            )}
        </AnimatePresence>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
