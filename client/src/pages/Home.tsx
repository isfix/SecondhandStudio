import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { Button } from "@/components/ui/button";
import { useItems } from "@/hooks/useItems";
import type { Item } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState<(Item & { id: string }) | null>(null);
  const { items, loading } = useItems({ ...filters, approvalStatus: "approved", realTime: true });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleItemClick = (item: Item & { id: string }) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <FilterBar onFilterChange={handleFilterChange} />
      
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Latest Arrivals</h2>
            <p className="text-gray-600">Discover fresh finds from our community</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                  />
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <Button className="bg-olive text-white px-8 py-3 rounded-full hover:bg-olive/90 transition-colors font-medium">
                  Load More Items
                </Button>
              </div>
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
