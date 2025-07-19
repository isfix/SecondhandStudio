# ThreadSwap - Preloved Fashion Marketplace

## Overview

ThreadSwap is a comprehensive AI-powered preloved fashion marketplace with advanced features including Google Gemini AI integration, Supabase storage, and a full admin dashboard. The platform combines sustainable fashion practices with cutting-edge technology to provide intelligent recommendations, automated content generation, and seamless user experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme (olive/beige color scheme)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution

### Authentication & User Management
- **Authentication**: Firebase Auth (Google OAuth, email/password)
- **User Storage**: Dual storage - Firebase Auth for authentication, PostgreSQL for user profiles
- **Authorization**: Session-based with Firebase UID linking

## Key Components

### Database Schema
Located in `shared/schema.ts`:
- **Users**: Enhanced profiles with roles, bio, social links, ratings, and verification status
- **Items**: Rich product listings with AI-generated descriptions, tags, analytics, and promotion features
- **Wishlist**: User-item relationship table for saved items
- **Messages**: User-to-user communication system
- **Reviews**: Rating and review system for users
- **Analytics**: Comprehensive tracking for user actions and item performance
- **Content Pages**: CMS for managing static content with AI generation
- **AI Generated Content**: Tracking and approval system for AI-generated content

### API Routes
- **Health Check**: `/api/health`
- **Users**: CRUD operations for user profiles
- **Items**: Full CRUD for product listings with filtering
- **Wishlist**: Add/remove items from user wishlists
- **AI Services**: Content generation, SEO optimization, recommendations, and moderation
- **Admin Panel**: Analytics, content management, and progress monitoring

### Client-Side Features
- **Responsive Design**: Mobile-first with desktop layouts
- **Item Browsing**: Grid view with filtering and search
- **Item Details**: Modal-based detailed view
- **Authentication**: Modal-based sign-in/sign-up
- **Seller Dashboard**: Item management for sellers
- **Wishlist**: Save and manage favorite items
- **Profile Management**: User account settings
- **Admin Dashboard**: Analytics, content management, and AI tools
- **AI-Powered Item Forms**: Intelligent description generation and SEO optimization
- **Advanced Image Upload**: Drag-and-drop with optimization and thumbnails
- **Personalized Recommendations**: AI-driven product suggestions

### Storage Strategy
- **Development**: In-memory storage implementation
- **Production**: PostgreSQL with Drizzle ORM
- **Images**: Supabase storage with automatic optimization and thumbnail generation
- **AI Content**: Google Gemini AI for intelligent content generation and recommendations

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Firebase Auth
   - Frontend receives Firebase user token
   - Backend creates/retrieves user profile in PostgreSQL
   - Session established with connect-pg-simple

2. **Item Management**:
   - Sellers create listings through React forms
   - Data validated with Zod schemas
   - Stored in PostgreSQL via Drizzle ORM
   - Real-time updates via React Query

3. **Wishlist Operations**:
   - Users add/remove items from wishlist
   - Changes reflected immediately in UI
   - Persistent storage in PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **firebase**: Authentication and real-time features
- **@google/generative-ai**: Google Gemini AI integration for content generation
- **@supabase/supabase-js**: File storage and image optimization
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **tsx**: TypeScript execution for Node.js
- **vite**: Build tool and dev server
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle pushes schema changes to PostgreSQL

### Environment Configuration
- **Development**: Uses tsx for hot reloading
- **Production**: Node.js serves bundled code
- **Database**: Requires `DATABASE_URL` environment variable

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared TypeScript schemas
├── migrations/      # Database migrations
└── dist/           # Build output
```

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon serverless)
- Environment variables for database and Firebase config
- Static file serving for built React app

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, making it suitable for deployment on platforms like Replit, Vercel, or traditional hosting providers.