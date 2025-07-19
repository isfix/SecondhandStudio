import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export const HeroSection = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleStartShopping = () => {
    setLocation("/");
  };

  const handleSellItems = () => {
    setLocation("/sell");
  };

  return (
    <section className="bg-gradient-to-r from-beige to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
            Preloved Fashion, <span className="text-olive font-medium">Reimagined</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover unique fashion pieces, connect with sellers, and give clothes a second life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartShopping}
              className="bg-olive text-white px-8 py-3 rounded-full hover:bg-olive/90 transition-colors font-medium"
            >
              Start Shopping
            </Button>
            <Button
              onClick={handleSellItems}
              variant="outline"
              className="border-olive text-olive px-8 py-3 rounded-full hover:bg-olive/5 transition-colors font-medium"
            >
              Sell Your Items
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
