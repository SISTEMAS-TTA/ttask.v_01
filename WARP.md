# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15-based ERP system for task and project management, built with TypeScript, Firebase authentication, and Firestore database. The application features a responsive dashboard with task management, notes, and project charts functionality.

## Essential Commands

### Package Management
This project uses **pnpm exclusively**. Never use npm or yarn.

```bash
# Install dependencies
pnpm install

# Development server with Turbopack
pnpm dev

# Production build with Turbopack  
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Execute packages without installing (instead of npx)
pnpm dlx <package-name>
```

### Development Workflow
```bash
# Start development server (runs on http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Lint the codebase
pnpm lint

# Add new dependencies
pnpm add <package-name>          # Production dependency
pnpm add -D <package-name>       # Development dependency
```

### Troubleshooting Commands
```bash
# Clear node_modules and reinstall
rm -rf node_modules && pnpm install

# Clear pnpm cache and reinstall
pnpm store prune && pnpm install
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui (New York style)
- **Authentication**: Firebase Auth with local persistence
- **Database**: Firebase Firestore
- **State Management**: React hooks + custom hooks
- **Icons**: Lucide React
- **Notifications**: Sonner

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Toaster
│   ├── page.tsx           # Home (redirects to dashboard via AuthWrapper)
│   ├── dashboard/         # Main dashboard page
│   ├── login/            # Authentication pages
│   ├── register/         
│   └── notes/            # Notes page
├── components/
│   ├── core/             # Custom core components
│   └── ui/               # shadcn/ui components
├── hooks/                # Shared React hooks
├── lib/
│   ├── firebase/         # Firebase configuration and services
│   ├── utils.ts          # Utility functions
│   └── greeting.ts       # Helper functions
└── modules/              # Feature-based architecture
    ├── admin/            # User management features
    ├── auth/             # Authentication logic
    ├── charts/           # Project charts and analytics
    ├── dashboard/        # Dashboard-specific components
    ├── notes/            # Notes management
    ├── tasks/            # Task management
    └── types/            # TypeScript type definitions
```

### Core Architecture Patterns

#### Modular Architecture
The codebase follows a feature-based modular structure where each domain (auth, tasks, notes, etc.) is self-contained with its own:
- Components
- Hooks  
- Services
- Types (when applicable)

#### Authentication Flow
- `AuthWrapper` component protects routes and handles authentication state
- `useUser` hook manages Firebase auth state and user profile data
- Fallback to localStorage for user profiles when Firebase is unavailable
- Automatic redirect to `/login` for unauthenticated users

#### Firebase Integration
- **Config**: Centralized Firebase setup with environment variable fallbacks
- **Services**: Separate service files for different Firebase features (firestore.ts, notes.ts, tasks.ts)
- **Authentication**: Firebase Auth with browser local persistence
- **Database**: Firestore collections for users, tasks, notes

#### Responsive Dashboard Design
The dashboard implements a sophisticated responsive layout:
- **Mobile**: Horizontal scrolling columns (320px wide)
- **Tablet**: Horizontal scrolling with wider columns (384px wide)  
- **Desktop**: Flexible columns with minimum widths
- **XL Desktop**: 5-column grid that fits all content

#### UI System
- Built on Radix UI primitives with shadcn/ui styling
- Tailwind CSS v4 with custom CSS variables
- Consistent component patterns using `class-variance-authority`
- Toast notifications via Sonner

### Key Components

#### Dashboard Layout
- `AppSidebar`: Main navigation with collapsible sidebar
- Column-based layout: Charts → Notes → Assigned Tasks → Received Tasks → Completed Tasks
- Breadcrumb navigation with dynamic active state

#### User Management
- Role-based user system with specific roles (Director, Administrador, Proyectos, etc.)
- User profile management via Firestore
- Admin functionality for user management

#### Task System  
- Task creation, assignment, and status tracking
- Multiple task views: assigned, received, completed
- Task filtering and management capabilities

### Environment Setup

The application expects Firebase environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`pnpm up next@latest react@latest react-dom@latest
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Copy `.env.local.example` to `.env.local` and configure Firebase credentials.

### Development Notes

- The project enforces pnpm usage with post-install warnings
- Turbopack is enabled for faster development and builds
- ESLint configured with Next.js and TypeScript rules
- Spanish language support (lang="es" in layout)
- VS Code workspace includes recommended extensions and settings