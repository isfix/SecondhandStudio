
"use client";

import { HandHeart, Recycle, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  const features = [
    {
      name: "Our Mission",
      description: "To make secondhand the first choice by creating a simple, trusted, and stylish platform for preloved fashion.",
      icon: HandHeart,
    },
    {
      name: "Sustainability First",
      description: "Every item you buy or sell contributes to a more circular economy, reducing waste and extending the life of clothing.",
      icon: Recycle,
    },
    {
      name: "Community-Powered",
      description: "We are a vibrant community of fashion lovers, tastemakers, and sustainable shoppers, all connected by a shared passion.",
      icon: Users,
    },
  ];

  return (
    <div className="bg-background">
      <div className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
            <motion.div
                animate={{
                    x: ['-20%', '10%','-20%'],
                    y: ['-20%', '20%','-20%'],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
                className="absolute top-0 left-0 h-96 w-96 bg-pink-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: ['20%', '-10%', '20%'],
                    y: ['20%', '-20%', '20%'],
                    rotate: [0, -90, 0],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
                className="absolute bottom-0 right-0 h-96 w-96 bg-blue-500/30 rounded-full blur-3xl"
            />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Fashion with a Conscience</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Preloved ByNaju is more than a marketplace. It's a movement towards a more sustainable and stylish future. Join us in reimagining the lifecycle of fashion.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden py-24 sm:py-32 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-primary">Our Values</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The Fabric of Our Company</p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  These are the principles that guide our decisions and inspire our community.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-muted-foreground lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-foreground">
                        <feature.icon className="absolute left-1 top-1 h-5 w-5 text-primary" aria-hidden="true" />
                        {feature.name}
                      </dt>
                      <dd className="inline"> {feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1485518882345-15568b007407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmYXNoaW9ufGVufDB8fHx8MTc1MjgzMzI2MXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Diverse group of friends laughing together"
              className="w-full max-w-none rounded-xl shadow-xl ring-1 ring-border sm:w-[57rem] md:-ml-4 lg:-ml-0"
              width={2432}
              height={1442}
              data-ai-hint="team fashion"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-base font-semibold text-primary">Join The Movement</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">Ready to Dive In?</p>
          <p className="mx-auto mt-5 max-w-prose text-lg text-muted-foreground">
            Whether you're looking to refresh your wardrobe or give your preloved items a new home, there's a place for you here.
          </p>
          <div className="mt-8 flex justify-center gap-4">
             <Button asChild size="lg" variant="default">
                <Link href="/welcome">Start Shopping</Link>
             </Button>
             <Button asChild size="lg" variant="outline">
                <Link href="/sell">Sell Your Items</Link>
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
