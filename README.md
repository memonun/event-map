# Event Map Platform

A comprehensive event discovery platform for Turkey, aggregating events from 5 major ticketing platforms with an interactive map interface and advanced filtering capabilities.

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

## Quick Start

### Prerequisites

- Node.js 18+ 
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
   
   Create `.env.local`:
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
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

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

### Map View

- **Navigation**: Use mouse/touch to pan and zoom
- **Clustering**: Events are automatically clustered for performance
- **Event Details**: Click markers to see event information
- **Geolocation**: Allow location access for nearby events

### List View

- **Search**: Search across event names, artists, and venues
- **Filters**: Filter by genre, city, date range, and platforms
- **View Modes**: Switch between grid and compact list views
- **Load More**: Pagination with "load more" functionality

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
│   ├── events/             # Event listing components
│   ├── map/                # Map-related components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── services/           # Database service layers
│   ├── types/              # TypeScript type definitions
│   └── supabase/           # Supabase client configurations
└── supabase/
    └── migrations/         # Database setup scripts
```

### Key Services

- **EventsService**: Event querying and search
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