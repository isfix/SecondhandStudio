
"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer = () => {
    const quickLinks = [
        { href: '/welcome', label: 'Shop' },
        { href: '/about', label: 'About' },
        { href: '/sell', label: 'Sell' },
        { href: '/contact', label: 'Contact' },
    ];
    const supportLinks = [
        { href: '/faq', label: 'FAQ' },
        { href: '/shipping', label: 'Shipping Info' },
        { href: '/returns', label: 'Returns' },
        { href: '/privacy', label: 'Privacy Policy' },
    ];

    return (
        <footer className="bg-background border-t">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Social */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image src="/icon.png" alt="Preloved ByNaju Logo" width={32} height={32} />
                            <span className="text-xl font-heading">
                                Prelovedbynajuw
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm">
                            Curated preloved fashion for the conscious consumer. Discover unique pieces while supporting sustainable style.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5"/></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5"/></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5"/></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2">
                            {quickLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Support</h3>
                        <ul className="mt-4 space-y-2">
                            {supportLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Stay in the Loop</h3>
                        <p className="mt-4 text-base text-muted-foreground">Get the latest on new arrivals, special offers, and more.</p>
                        <form className="mt-4 flex w-full">
                            <Input type="email" placeholder="Enter your email" className="w-full rounded-r-none" />
                            <Button type="submit" variant="default" className="rounded-l-none">Subscribe</Button>
                        </form>
                    </div>

                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Prelovedbynajuw. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};
