
"use client";

import { Home, Search, Plus, User, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export const MobileBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Plus, label: "Sell", href: "/sell" },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center h-full w-full text-sm font-medium transition-colors duration-200">
              <Icon className={`w-6 h-6 mb-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                 <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute bottom-1 w-5 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
