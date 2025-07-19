
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const ShopHero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center bg-gray-900 text-white overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2520&auto=format&fit=crop"
        alt="Collection of modern fashion"
        fill
        className="object-cover object-center z-0"
        data-ai-hint="modern fashion"
        priority
      />
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Discover Your Next Find
        </h1>
        <p className="text-lg text-gray-200 mb-8">
          Browse thousands of curated preloved items from sellers worldwide.
        </p>
        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for dresses, bags, shoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full h-14 rounded-full bg-white/90 text-gray-900 placeholder-gray-500 border-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent"
          />
        </form>
      </div>
    </section>
  );
};
