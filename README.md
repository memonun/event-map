# Event Map Monorepo

A comprehensive event discovery platform for Turkey with both web and mobile applications, aggregating events from 5 major ticketing platforms with an Airbnb-style interactive map interface and advanced filtering capabilities.

## 🏗️ Monorepo Structure

```
event-map/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # React Native mobile app (Expo)
├── packages/
│   ├── shared/              # Shared business logic, services, types
│   ├── ui/                  # Shared UI components
│   └── config/              # Shared configuration
└── package.json             # Root workspace configuration
```

## 🆕 Recent Updates

### Monorepo Implementation
- **Multi-Platform Support**: Separate web and mobile applications
- **Shared Code**: Common business logic and types across platforms
- **Independent Development**: Teams can work on different platforms simultaneously
- **Workspace Configuration**: npm workspaces for efficient dependency management

### Airbnb-Style Interface (Web)
- **Floating UI Components**: Clean, modern interface with floating search bar and user menu
- **Centered Overlay Panel**: Centered event details panel over map with backdrop blur
- **Smart 3-Tier Clustering**: City → Major Venues → Individual Venues for optimal performance
- **Dynamic Ticket URLs**: Platform-specific buy buttons fetched on-demand from raw data tables

## Features

🗺️ **Interactive Map View**
- Display 5,240+ events on an interactive map
- Event clustering for better performance
- Real-time event discovery based on location
- PostGIS-powered spatial queries

📋 **Advanced Event Listing**
- Grid and list view modes
- Comprehensive filtering by genre, city, date, and platform
- Real-time search across events, artists, and venues
- Pagination and infinite scrolling

🎫 **Price Comparison**
- Real-time price tracking across 5 platforms
- Historical price data and trends
- Platform availability indicators
- Cheapest price highlighting

🎭 **Rich Event Data**
- Artist information with Spotify integration
- Venue details with capacity and location
- Promoter and marketing campaign data
- Multi-platform ticket availability

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL with PostGIS)
- **Database**: 5,240+ events from Turkish ticketing platforms
- **Map**: Mapbox GL JS with React Map GL
- **UI**: shadcn/ui components, Radix UI primitives
- **Data**: Real-time price tracking, venue standardization

## Database Overview

The platform connects to a comprehensive event aggregation database containing:

- **unique_events**: 5,240 deduplicated events
- **canonical_venues**: 505 standardized venues with coordinates
- **artists.artists**: 8,667 artist profiles with Spotify data
- **Platform-specific tables**: Events and prices from Bubilet, Biletix, Biletinial, Passo, Bugece
- **Real-time pricing**: Snapshot-based price tracking system

For detailed database documentation, see `DATABASE_DOCUMENTATION.md`.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- Supabase project with the event database
- (Optional) Mapbox account for map functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-map
   npm install
   ```

2. **Set up environment variables**

   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key

   # Optional: For map functionality
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   ```

3. **Set up the database**

   Run the spatial functions in your Supabase SQL editor:
   ```bash
   # Copy and execute the contents of:
   supabase/migrations/create_spatial_functions.sql
   ```

4. **Start the development server**
   ```bash
   # Start web app
   npm run dev

   # Or use specific commands
   npm run dev:web     # Web app
   npm run dev:mobile  # Mobile app (requires Expo)
   ```

Visit `http://localhost:3000` to see the web application.

### Available Scripts

- `npm run dev` - Start web app development server
- `npm run dev:web` - Start web app
- `npm run dev:mobile` - Start mobile app
- `npm run build:web` - Build web app for production
- `npm run build:mobile` - Build mobile app
- `npm run clean` - Clean all build artifacts

## Database Setup

### Required Functions

The application requires several PostGIS functions for efficient spatial queries. Run these in your Supabase SQL editor:

```sql
-- See supabase/migrations/create_spatial_functions.sql for complete setup
```

Key functions include:
- `get_events_near_location()` - PostGIS spatial search
- `get_events_in_bounds()` - Map bounds filtering  
- `get_popular_genres()` - Genre statistics
- `get_cities_with_venues()` - City listings

### Row Level Security

Ensure your Supabase policies allow:
- Public read access to events and venues
- Authenticated user access to personal data

## Usage

### Airbnb-Style Map Interface

- **Smart Navigation**: Seamless pan and zoom with intelligent clustering
- **Floating Controls**: Search bar and filters always accessible at the top
- **Toggle Side Panel**: Click the list button to view all events in current area
- **Event Details**: Click any event card for comprehensive information modal

### Filtering System

- **Real-time Search**: Instant search across event names and artists
- **Dynamic Genres**: Dropdown populated with actual database genres
- **City Filter**: Filter by major Turkish cities
- **Date Range**: Select specific date ranges for event discovery
- **Platform Filter**: View events from specific ticketing platforms

### Event Discovery

- **3-Tier Clustering**: 
  - Zoom 5-10: City-level clusters
  - Zoom 11-14: Major venue clusters (5+ events)
  - Zoom 15+: Individual venue markers
- **Side Panel**: Shows filtered events based on current map view
- **Venue Selection**: Click venue markers to see venue-specific events

### Event Information

Each event displays:
- Event name, date, and time
- Venue with capacity and location
- Artist lineup with Spotify data
- Available platforms and pricing
- Genre and promoter information

## Development

### Project Structure

```
├── app/                     # Next.js App Router pages
├── components/
│   ├── map/                # Map-related components
│   │   ├── smart-cluster-map.tsx     # 3-tier clustering system
│   │   ├── universal-event-panel.tsx # Toggleable side panel
│   │   ├── event-detail-modal.tsx    # Large event detail modal
│   │   ├── floating-search.tsx       # Top search bar
│   │   └── floating-user-menu.tsx    # User menu
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── services/           # Database service layers
│   │   └── client/        
│   │       └── events.ts  # Event fetching with ticket URLs
│   ├── types/              # TypeScript type definitions
│   └── supabase/           # Supabase client configurations
└── supabase/
    └── migrations/         # Database setup scripts
```

### Key Services

- **ClientEventsService**: Event querying with real-time filtering
  - `searchEvents()`: Filter by genre, city, date, platforms
  - `getEventWithTicketUrls()`: Fetch ticket URLs on-demand
  - `getAvailableGenres()`: Dynamic genre loading
- **VenuesService**: Venue management and location queries
- **PricesService**: Price comparison and tracking
- **ArtistsService**: Artist data and relationships

### Adding Features

1. **New Filters**: Extend `EventSearchParams` type and update `EventFilters` component
2. **Map Features**: Add new marker types or overlays in `EventMap` component  
3. **Data Queries**: Create new RPC functions in Supabase and corresponding service methods

## Performance Considerations

- **Map Clustering**: Events are clustered for better performance with large datasets
- **Pagination**: List views use efficient pagination to handle large result sets
- **Spatial Indexing**: PostGIS indexes enable fast location-based queries
- **Price Snapshots**: Efficient snapshot-based price tracking reduces query load

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | ✅ | Supabase anonymous key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | ⚠️ | Mapbox token (optional, for map view) |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For questions and support:
- Review the `DATABASE_DOCUMENTATION.md` for detailed schema information
- Check the `CLAUDE.md` file for development guidelines
- Open an issue for bugs or feature requests

---

**Event Map Platform** - Discover events across Turkey with powerful search and interactive mapping.