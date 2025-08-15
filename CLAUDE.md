# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application with Supabase integration for building an event mapping platform. The project uses Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui components.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Authentication**: Cookie-based using @supabase/ssr

### Key Directories
- `app/` - Next.js App Router pages and layouts
  - `auth/` - Authentication pages (login, signup, password reset)
  - `protected/` - Protected routes requiring authentication
- `components/` - React components
  - `ui/` - shadcn/ui components
  - `tutorial/` - Tutorial-specific components
- `lib/` - Utilities and configurations
  - `supabase/` - Supabase client configurations

### Supabase Client Usage

The application uses three different Supabase client configurations:

1. **Server Components** (`lib/supabase/server.ts`): Use `createClient()` for server-side operations
2. **Client Components** (`lib/supabase/client.ts`): Use browser client for client-side operations
3. **Middleware** (`lib/supabase/middleware.ts`): Special client for Next.js middleware

### Environment Variables

Required environment variables (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
```

### Key Database Queries

#### Get Events Near Location (PostGIS)
```sql
SELECT e.*, v.name as venue_name, v.coordinates, v.city
FROM unique_events e
JOIN canonical_venues v ON e.canonical_venue_id = v.id
WHERE ST_DWithin(
  ST_MakePoint((v.coordinates->>'lng')::float, (v.coordinates->>'lat')::float)::geography,
  ST_MakePoint($lng, $lat)::geography,
  $radiusMeters
)
AND e.date > NOW()
ORDER BY e.date;
```

#### Get Current Event Prices
```sql
-- Get latest prices from Bubilet for an event
SELECT category, price, remaining, sold_out
FROM ticketing_platforms_raw_data.bubilet_prices
WHERE event_id = $event_id
AND snapshot_id = (
  SELECT MAX(snapshot_id) 
  FROM ticketing_platforms_raw_data.bubilet_prices 
  WHERE event_id = $event_id
);
```

### Authentication Flow

- Cookie-based authentication using Supabase Auth
- Protected routes handled via middleware (`middleware.ts`)
- Auth confirmation handled at `/auth/confirm/route.ts`
- Login/signup forms use server actions for authentication

## Important Patterns

### Server Actions
Authentication forms use Next.js server actions for form submission. Example pattern:
```typescript
async function signIn(formData: FormData) {
  "use server";
  // Authentication logic
}
```

### Protected Routes
Protected pages check authentication status and redirect if needed:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return redirect("/auth/login");
```

### Component Conventions
- Use shadcn/ui components from `components/ui/`
- Follow existing patterns for form handling with server actions
- Maintain TypeScript strict mode compliance

## Database Schema

The application connects to a comprehensive event aggregation database with 5,240+ unique events from 5 Turkish ticketing platforms. See `DATABASE_DOCUMENTATION.md` for full details.

### Core Tables

#### unique_events (5,240 records)
Central unified events table:
```sql
-- Key columns for unique_events
id                    uuid PRIMARY KEY
name                  text
canonical_venue_id    uuid FK → canonical_venues.id
date                  timestamp
genre                 text
artist                text[]
description           text
providers             text[] -- ['bubilet', 'biletix', etc.]
biletinial_event_id   bigint
biletix_event_id      bigint
passo_event_id        bigint
bugece_event_id       bigint
bubilet_event_id      bigint
```

#### canonical_venues (505 records)
Standardized venue database:
```sql
-- Key columns for canonical_venues
id            uuid PRIMARY KEY
name          text
city          text
capacity      integer
coordinates   jsonb -- {"lat": 41.0082, "lng": 28.9784}
```

#### Platform-Specific Tables
Each platform has `{platform}_events`, `{platform}_prices`, `{platform}_price_history`:
- **bubilet_events** (6,073 events)
- **biletinial_events** (2,416 events)
- **biletix_events** (2,468 events)
- **passo_events** (1,360 events)
- **bugece_events** (777 events)

#### Artists & Promoters Ecosystem
- **artists.artists** (8,667 records) - Artist profiles with Spotify data
- **unified_artist_profile** (7,658 records) - Rich artist data with streaming metrics
- **promoters.promoters** (210 records) - Event promoters with campaign data
- **promoters.promoter_campaigns** - Marketing campaign tracking

## Testing

Currently no test commands are configured. When implementing tests, add testing scripts to package.json.

## Deployment

The application is designed for deployment on Vercel with automatic Supabase integration. Environment variables are automatically configured when using Vercel's Supabase integration.