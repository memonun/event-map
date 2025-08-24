# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Event mapping platform for Turkey that aggregates 5,240+ events from 5 ticketing platforms (Bubilet, Biletix, Biletinial, Passo, Bugece) with an Airbnb-style interactive map interface.

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

# Git workflow commands (PRODUCTION SAFETY)
git checkout -b feature/your-feature    # Create feature branch
git push origin feature/your-feature    # Push feature branch (safe)
# NEVER: git push origin main           # Deploys to production!
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database/Auth**: Supabase (PostgreSQL with PostGIS)
- **Map**: Mapbox GL JS with React Map GL
- **Authentication**: Cookie-based using @supabase/ssr

### Key Directories
- `app/` - Next.js App Router pages and layouts
  - `auth/` - Authentication pages (login, signup, password reset)
  - `protected/` - Protected routes requiring authentication
- `components/` - React components
  - `map/` - Map components (smart-cluster-map, event-detail-modal, floating-search)
  - `ui/` - shadcn/ui components
  - `tutorial/` - Tutorial-specific components
- `lib/` - Utilities and configurations
  - `services/` - Database service layers
    - `client/` - Client-side services (events, venues)
  - `supabase/` - Supabase client configurations
  - `types/` - TypeScript type definitions

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
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN= # Optional: For map functionality
OPENAI_API_KEY= # Optional: For AI chatbot functionality
```

## Key Database Queries

### Get Events Near Location (PostGIS)
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

### Get Current Event Prices
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

## Database Schema

### Core Tables

#### unique_events (5,240 records)
Central unified events table:
- `id` (uuid) - Primary key
- `name` (text) - Event name
- `canonical_venue_id` (uuid) - FK to canonical_venues
- `date` (timestamp) - Event date/time
- `genre` (text) - Event category
- `artist` (text[]) - Performing artists
- `providers` (text[]) - Available platforms
- Platform-specific IDs: `biletinial_event_id`, `biletix_event_id`, `passo_event_id`, `bugece_event_id`, `bubilet_event_id`

#### canonical_venues (505 records)
Standardized venue database:
- `id` (uuid) - Primary key
- `name` (text) - Venue name
- `city` (text) - City location
- `capacity` (integer) - Venue capacity
- `coordinates` (jsonb) - GPS coordinates `{lat, lng}`

#### Platform Tables
Each platform has:
- `{platform}_events` - Event data from platform
- `{platform}_prices` - Current prices (snapshot-based)
- `{platform}_price_history` - Historical price tracking

#### Artists & Promoters
- `artists.artists` (8,667 records) - Artist profiles with Spotify data
- `unified_artist_profile` (7,658 records) - Rich artist data with streaming metrics
- `promoters.promoters` (210 records) - Event promoters
- `promoters.promoter_campaigns` - Marketing campaign tracking

## Map Implementation

### 3-Tier Clustering System
The map uses intelligent clustering for optimal performance:
- **Zoom 5-10**: City-level clusters
- **Zoom 11-14**: Major venue clusters (5+ events)
- **Zoom 15+**: Individual venue markers

### Key Map Components
- `smart-cluster-map.tsx` - Main map with clustering logic
- `universal-event-panel.tsx` - Toggleable side panel for events
- `event-detail-modal.tsx` - 80% viewport modal for event details
- `floating-search.tsx` - Top search bar with filters
- `floating-user-menu.tsx` - User account menu

## Authentication Flow

- Cookie-based authentication using Supabase Auth
- Protected routes handled via middleware (`middleware.ts`)
- Auth confirmation handled at `/auth/confirm/route.ts`
- Login/signup forms use server actions for authentication

## AI Chatbot Integration

### Vector Search & Embeddings
The platform includes AI-powered event discovery using vector embeddings:
- **Embeddings Table**: `unique_events_embeddings` with 384-dimensional vectors
- **Vector Search**: pgvector extension for similarity search
- **Hybrid Search**: Combines semantic similarity with metadata filtering

### AI Features
- **Conversational Interface**: Chat with AI about events in Turkish/English
- **Smart Recommendations**: Vector similarity-based event suggestions
- **Context Awareness**: Maintains conversation history and user preferences
- **Visual Integration**: Event cards with images and booking links

### AI Service Architecture
```
components/chat/
├── floating-chatbot.tsx      # Main chat toggle button
├── chat-modal.tsx           # Full conversation interface  
├── event-recommendation-card.tsx # AI-recommended events display
└── index.ts                 # Component exports

lib/services/client/embeddings.ts # Vector search service

app/api/chat/
├── message/route.ts         # Main chat endpoint
├── embed/route.ts          # Embedding generation
└── similar-events/route.ts  # Event similarity API
```

### Vector Search Functions (SQL)
```sql
-- Search for similar events using embeddings
SELECT * FROM search_similar_events(query_embedding, threshold, limit);

-- Find events similar to a specific event
SELECT * FROM find_similar_events(reference_event_id, threshold, limit);

-- Hybrid search with metadata filters
SELECT * FROM hybrid_search_events(embedding, genre, city, dates, threshold, limit);
```

## Important Patterns

### Server Actions
Authentication forms use Next.js server actions for form submission:
```typescript
async function signIn(formData: FormData) {
  "use server";
  // Authentication logic
}
```

### Protected Routes
Protected pages check authentication status:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return redirect("/auth/login");
```

### Component Conventions
- Use shadcn/ui components from `components/ui/`
- Follow existing patterns for form handling with server actions
- Maintain TypeScript strict mode compliance

## Testing

Currently no test commands are configured. When implementing tests, add testing scripts to package.json.

## Deployment

**Status: ✅ SUCCESSFULLY DEPLOYED TO PRODUCTION**

The application is deployed on Vercel with automatic Supabase integration and custom domain support.

### Production Environment
- **Platform**: Vercel
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Domain**: Custom domain configured
- **HTTPS**: Automatic SSL certificate
- **CDN**: Global edge network

### Git Workflow for Production Safety

**⚠️ IMPORTANT: Never push directly to `main` branch - it auto-deploys to production!**

#### Development Process
1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Develop Locally**: Make changes and test with `npm run dev`
3. **Push Feature Branch**: `git push origin feature/your-feature`
4. **Create Pull Request**: GitHub → PR to merge into `main`
5. **Test Preview**: Vercel creates preview URL for PR
6. **Merge to Deploy**: Merging PR auto-deploys to production

#### Branch Commands
```bash
# Start new feature
git checkout main && git pull origin main
git checkout -b feature/new-feature-name

# Push feature branch
git push origin feature/new-feature-name

# Clean up after merge
git checkout main && git pull origin main
git branch -d feature/new-feature-name
git push origin --delete feature/new-feature-name
```

#### Deployment URLs
- **Production**: Your custom domain + `[project].vercel.app`
- **Preview**: Auto-generated for each Pull Request
- **Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)