# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Turkish Education Coaching Platform ("Eğitim Koçluğu Uygulaması") - a modern web application for managing student coaching, assignments, messaging, and progress tracking. The platform serves both coaches and students with role-based access control.

## Technology Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS v4 with Shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Next.js with Turbopack (enabled by default)

## Common Commands

### Development
```bash
# Start development server (with Turbopack)
npm run dev

# Build for production (with Turbopack)
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Testing & Database
```bash
# Access Supabase project locally (if configured)
npx supabase start

# Apply database schema
# Run the SQL from database/schema.sql in Supabase Dashboard > SQL Editor

# Check database migrations
npx supabase db diff
```

## Application Architecture

### Authentication & Authorization
- **Middleware-based auth**: `src/middleware.ts` handles route protection and user session management
- **Role-based access**: Users have either 'coach' or 'student' roles defined in the profiles table
- **Protected routes**: `/dashboard`, `/coach`, `/student` require authentication
- **Auto-redirect**: Dashboard route (`/dashboard/page.tsx`) automatically redirects users to role-specific dashboards

### Database Schema
The application uses a comprehensive PostgreSQL schema with these core entities:
- **profiles**: User profiles with role (coach/student) and basic info
- **students**: Extended student information with coach relationships
- **assignments**: Homework/tasks with priority levels and due dates
- **assignment_submissions**: Student submissions for assignments
- **assignment_reviews**: Coach feedback and grading
- **messages**: Real-time messaging between coaches and students
- **reminders**: Automated reminders for assignments and deadlines
- **student_progress**: Weekly progress tracking by subject

### Component Structure
- **UI Components**: Located in `src/components/ui/` using Shadcn/ui patterns
- **Layouts**: App-wide layout in `src/app/layout.tsx`
- **Pages**: App Router structure in `src/app/` with nested routes
- **Utilities**: Shared utilities in `src/lib/utils.ts` and `src/lib/supabase.ts`

### Supabase Integration
- **Multiple clients**: Server components, client components, and middleware each have dedicated Supabase clients
- **RLS enabled**: All database tables use Row Level Security for data isolation
- **Real-time**: Built-in support for real-time subscriptions (messaging, notifications)

## Development Guidelines

### Database Operations
- Always use the appropriate Supabase client for the context (server vs client component)
- All database tables have RLS enabled - ensure policies are properly configured for new features
- Use the existing enum types: `user_role`, `assignment_status`, `priority_level`

### Component Development
- Follow the established Shadcn/ui patterns for consistent styling
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging
- Leverage existing UI components in `src/components/ui/` before creating new ones

### Route Structure
- Protected routes should be placed under `/dashboard`
- Role-specific features should be organized under `/dashboard/coach` or `/dashboard/student`
- Authentication routes are under `/auth`

### Environment Variables
Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Key Features
- **Student Management**: Coaches can add/manage multiple students
- **Assignment System**: Create, assign, submit, and review assignments
- **Messaging**: Real-time communication between coaches and students
- **Progress Tracking**: Weekly progress reports by subject
- **File Attachments**: Support for file uploads in assignments and messages (URLs stored in arrays)
- **Reminders**: Automated reminder system for deadlines

## Deployment

The application is optimized for Vercel deployment:
1. Configure environment variables in Vercel dashboard
2. Database schema must be applied manually in Supabase dashboard
3. Ensure Supabase project is properly configured with RLS policies

## Turkish Language Context

The application uses Turkish language throughout the UI and database. When making changes:
- Database column names and comments are in Turkish
- UI text and error messages should be in Turkish
- Keep the existing Turkish naming conventions for consistency