
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, MessageSquare, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import { ItemCard } from "@/components/ItemCard";
import { useItems } from "@/hooks/useItems";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

export default function Home() {
  const router = useRouter();
  const { items, loading } = useItems({ approvalStatus: "approved" });

  const features = [
    {
      name: "1. Browse & Discover",
      description: "Explore our curated collection of preloved fashion pieces from trusted sellers.",
      icon: Search,
    },
    {
      name: "2. Connect & Purchase",
      description: "Message sellers directly to ask questions and arrange secure transactions.",
      icon: MessageSquare,
    },
    {
      name: "3. List Your Own",
      description: "Give your preloved pieces a new life by listing them in our marketplace.",
      icon: Handshake,
    },
  ];

  const categories = [
    { name: "Dresses", href: "/welcome?category=Dresses", image: "https://images.unsplash.com/photo-1484328256245-34b71758c30b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxkcmVzcyUyMGZhc2hpb258ZW58MHx8fHwxNzUyODYwMDkxfDA&ixlib=rb-4.1.0&q=80&w=1080", hint: "dress fashion" },
    { name: "Handbags", href: "/welcome?category=Bags", image: "https://images.unsplash.com/photo-1683921470299-b8f0f3331657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxoYW5kYmFnJTIwZmFzaGlvbnxlbnwwfHx8fDE3NTI4NjAwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080", hint: "handbag fashion" },
    { name: "Outerwear", href: "/welcome?category=Outerwear", image: "https://images.unsplash.com/photo-1610871276689-81c7cdae19ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjb2F0JTIwZmFzaGlvbnxlbnwwfHx8fDE3NTI4NjAwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080", hint: "coat fashion" },
    { name: "Accessories", href: "/welcome?category=Accessories", image: "https://images.unsplash.com/photo-1513089176717-55db930c2e2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2NhcmYlMjBmYXNoaW9ufGVufDB8fHx8MTc1Mjg2MDA5MXww&ixlib=rb-4.1.0&q=80&w=1080", hint: "scarf fashion" },
  ];

  const stats = [
    { value: "10K+", label: "Items Rehomed" },
    { value: "5K+", label: "Happy Customers" },
    { value: "2K+", label: "Trusted Sellers" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center bg-gray-900 text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Stylish woman posing outdoors"
          fill
          className="object-cover object-center z-0"
          data-ai-hint="elegant fashion"
          priority
        />
        <div className="absolute inset-0 bg-neutral-700/50 z-10"></div>
        <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading mb-4 text-white">
              Prelovedbynajuw
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-2">
              Curated Style, Conscious Choice
            </p>
            <p className="text-base md:text-lg text-stone-300 mb-8">
              Discover unique preloved fashion pieces that tell a story. Sustainable luxury for the modern wardrobe.
            </p>
            <Button
              onClick={() => router.push("/welcome")}
              variant="default"
              size="lg"
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Pieces Section */}
      <section className="py-24 bg-background">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading">Featured Pieces</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Handpicked treasures from our curated collection
            </p>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/4">
                    <div className="bg-white rounded-xl shadow-sm animate-pulse p-4">
                      <div className="aspect-square bg-gray-200 rounded-lg"></div>
                      <div className="mt-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                items.slice(0, 8).map((item) => (
                  <CarouselItem key={item.id} className="sm:basis-1/2 lg:basis-1/4">
                    <div className="p-1">
                      <ItemCard
                        item={item as any}
                        onItemClick={(clickedItem) => { /* Handle click if needed */ }}
                      />
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background/80 hover:bg-background border-2 h-10 w-10" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background/80 hover:bg-background border-2 h-10 w-10" />
          </Carousel>
          
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/welcome">
                View All Items <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-24 bg-secondary">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading">How It Works</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Simple steps to sustainable style
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.name} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-2 text-xl font-semibold font-sans">{feature.name}</h3>
                <p className="mt-2 text-base text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Shop by Category Section */}
      <section className="py-24 bg-background">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading">Shop by Category</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="group relative block aspect-[4/5] overflow-hidden rounded-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.hint}
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-semibold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
       <section className="bg-secondary py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-heading">
            Our Mission
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            At Prelovedbynajuw, we believe that fashion should be both beautiful and sustainable. Every piece in our marketplace has a story to tell and a future to fulfill. By choosing preloved fashion, you're not just making a style statement – you're making a statement about the kind of world you want to live in.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
