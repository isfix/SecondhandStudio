
"use client";

import { useState } from "react";
import Link from "next/link";
import { ShopHero } from "@/components/ShopHero";
import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { Button } from "@/components/ui/button";
import { useItems } from "@/hooks/useItems";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Welcome() {
  const [filters, setFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState<(any & { id: string }) | null>(null);
  const { items, loading } = useItems({ ...filters, approvalStatus: "approved" });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleItemClick = (item: any & { id: string }) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopHero />
      <FilterBar onFilterChange={handleFilterChange} />
      
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="mt-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg mb-4">No items found</div>
              <p className="text-gray-400">Try adjusting your filters or check back later for new arrivals</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                  />
                ))}
              </div>
              
              {items.length > 12 && (
                <div className="mt-12 text-center">
                  <Button variant="default" size="lg">
                    Load More Items
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
