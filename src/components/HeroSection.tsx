
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const HeroSection = () => {
  const router = useRouter();

  const handleStartShopping = () => {
    const filterBar = document.getElementById("filter-bar");
    if (filterBar) {
      filterBar.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push("/#latest-arrivals");
    }
  };

  const handleSellItems = () => {
    router.push("/sell");
  };

  return (
    <section className="bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-warm-grey tracking-tight mb-6">
                Preloved Fashion, <br /><span className="text-olive font-medium">Reimagined</span>
              </h1>
              <p className="text-lg text-warm-grey/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Discover unique fashion pieces, connect with sellers, and give clothes a second life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleStartShopping}
                  variant="default"
                  size="lg"
                >
                  Start Shopping
                </Button>
                <Button
                  onClick={handleSellItems}
                  variant="outline-olive"
                  size="lg"
                >
                  Sell Your Items
                </Button>
              </div>
            </div>
            <div className="relative h-80 lg:h-auto lg:aspect-[4/3.5] -mx-4 sm:-mx-6 lg:mx-0">
               <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8ZmFzaGlvbnxlbnwwfHx8fDE3NTI4MzMyNjF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Stylish preloved fashion items"
                  fill
                  className="object-cover rounded-2xl shadow-xl"
                  data-ai-hint="colorful fashion"
                  priority
               />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
