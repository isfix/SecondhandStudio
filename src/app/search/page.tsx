
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useItems } from "@/hooks/useItems";
import { Search } from "lucide-react";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { items, loading } = useItems({ 
    ...filters, 
    approvalStatus: "approved", 
    search: searchQuery
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Items</h1>
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </form>
        </div>

        <FilterBar onFilterChange={handleFilterChange} />
        
        <section className="py-8">
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
              <div className="text-gray-500 text-lg mb-4">
                {searchQuery ? `No items found for "${searchQuery}"` : "No items found"}
              </div>
              <p className="text-gray-400">
                {searchQuery ? "Try different keywords or adjust your filters" : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  {searchQuery ? `Found ${items.length} items for "${searchQuery}"` : `${items.length} items found`}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <Button className="bg-olive text-white px-8 py-3 rounded-full hover:bg-olive/90 transition-colors font-medium">
                    Load More Items
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
