# Event Database Documentation
## For Event Map View Platform Development

This document provides comprehensive documentation for the event aggregation database system that powers the event map view platform. The database collects, standardizes, and manages event data from 5 major Turkish ticketing platforms.

---

## 🏗️ Database Architecture Overview

### Core Purpose
A unified event data platform that:
- Aggregates events from 5 Turkish ticketing platforms
- Standardizes venue information across platforms
- Tracks real-time pricing and availability
- Provides geolocation data for map-based visualization
- Maintains historical price tracking for market analysis

### Database Statistics (Current)
- **Total Unique Events**: 5,240
- **Total Canonical Venues**: 505
- **Platform Coverage**:
  - Bubilet: 6,073 events
  - Biletinial: 2,416 events
  - Biletix: 2,468 events
  - Passo: 1,360 events
  - Bugece: 777 events

---

## 📊 Main Database Schemas

### 1. ticketing_platforms_raw_data Schema
Primary schema containing all platform-specific data tables.

### 2. public Schema
Contains unified data tables, venue standardization, and analytics views.

### 3. Test Schemas
Isolated testing environments for each platform:
- `bubilet_test`
- `biletinial_test`
- `biletix_test`
- `passo_test`
- `bugece_test`

---

## 🎫 Platform Event Tables

Each platform has 3 interconnected tables following the same pattern:

### Pattern: `{platform}_events`, `{platform}_prices`, `{platform}_price_history`

#### Common Event Table Structure
All platform event tables share these core columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint (PK) | Unique event identifier |
| `provider` | text | Platform name |
| `name` | text | Event name |
| `venue` | text | Venue name (raw from platform) |
| `date` | timestamp | Event date and time |
| `genre` | text | Event category/genre |
| `created_at` | timestamp | First seen timestamp |
| `last_seen` | timestamp | Last update timestamp |
| `canonical_venue_id` | uuid | Link to standardized venue |
| `description` | text | Event description |
| `promoter` | text | Event promoter/organizer |
| `artist` | text[] | Array of performer names |
| `event_url` | text | Direct link to event page |
| `coordinates` | jsonb | Geolocation data `{lat, lng}` |

#### Platform-Specific Extensions

**Biletix Additional Fields:**
- `promoter_code` - Internal promoter identifier
- `seat_plan_image_url` - Venue seating chart
- `single_seat_mode` - Boolean for seat selection type
- `ticket_selection_data` - Complex pricing/section data
- `publish_date` - Event publish timestamp
- `additional_images` - Event promotional images

**Bugece Additional Fields:**
- `ticket_types` - Available ticket categories
- `min_price` / `max_price` - Price range indicators

### Price Tables Structure

#### Current Prices (`{platform}_prices`)
Snapshot-based price tracking system:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint (PK) | Price record ID |
| `event_id` | bigint (FK) | Reference to event |
| `category` | text | Ticket category name |
| `price` | numeric | Current price |
| `remaining` | integer | Tickets available |
| `sold_out` | boolean | Availability status |
| `created_at` | timestamp | Record creation |
| `last_seen` | timestamp | Last update |
| `snapshot_id` | uuid | Unique snapshot identifier |
| `status` | text | 'active', 'sold_out', 'inactive' |

#### Historical Prices (`{platform}_price_history`)
Complete historical record of all price changes:
- Same structure as prices table
- Never updated, only inserted
- Preserves complete pricing timeline

---

## 🏛️ Unified Data Tables

### unique_events Table
Central table unifying events across all platforms:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique event identifier |
| `name` | text | Standardized event name |
| `canonical_venue_id` | uuid (FK) | Standardized venue reference |
| `date` | timestamp | Event date/time |
| `genre` | text | Primary genre/category |
| `promoter` | text[] | Event promoters |
| `artist` | text[] | Performing artists |
| `description` | text | Combined description |
| `biletinial_event_id` | bigint | Platform reference |
| `biletix_event_id` | bigint | Platform reference |
| `passo_event_id` | bigint | Platform reference |
| `bugece_event_id` | bigint | Platform reference |
| `bubilet_event_id` | bigint | Platform reference |
| `providers` | text[] | Active platforms list |
| `status` | text | Event status |
| `created_at` | timestamp | First creation |
| `updated_at` | timestamp | Last modification |

**Key Features:**
- Deduplicates events across platforms
- Links same event from different sources
- Maintains platform-specific IDs for price lookup
- Enables cross-platform analysis

### canonical_venues Table
Standardized venue database:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique venue identifier |
| `name` | text | Standardized venue name |
| `city` | text | City location |
| `capacity` | integer | Venue capacity |
| `coordinates` | jsonb | GPS coordinates `{lat, lng}` |
| `created_at` | timestamp | Creation timestamp |

**Key Features:**
- Single source of truth for venues
- Resolves venue name variations
- Provides accurate geolocation
- Links to all platform events

### manual_venue_map Table
Manual venue standardization overrides:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Mapping identifier |
| `raw_venue` | text | Original venue name |
| `canonical_id` | uuid (FK) | Canonical venue reference |
| `source` | text | Platform source |

### unmatched_venues Table
Venues requiring manual review:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Record identifier |
| `raw_venue` | text | Unmatched venue name |
| `occurrences` | integer | Times encountered |
| `platforms` | text[] | Platforms using this name |
| `first_seen` | timestamp | First occurrence |
| `suggested_match` | uuid | AI-suggested canonical match |

---

## 🔄 Data Relationships

### Primary Relationships

1. **Platform Events → Prices**
   - One-to-many relationship
   - Connected via `event_id` foreign key
   - Cascade delete on event removal

2. **Platform Events → Unique Events**
   - Many-to-one relationship
   - Platform events map to single unique event
   - Enables cross-platform event matching

3. **Events → Canonical Venues**
   - Many-to-one relationship
   - All events link to standardized venue
   - Through `canonical_venue_id` foreign key

4. **Prices → Price History**
   - Current snapshot vs historical tracking
   - Same structure, different purposes
   - History preserves all states

### Data Flow
```
Platform APIs/Websites
        ↓
Platform Scrapers (Python)
        ↓
Platform Event Tables
        ↓
Venue Standardization (Edge Function)
        ↓
Unique Events Table
        ↓
Map View Application
```

---

## 🗺️ Geolocation System

### Coordinate Storage
- Stored as JSONB: `{"lat": 41.0082, "lng": 28.9784}`
- Indexed with GIN for efficient spatial queries
- Available in both event and venue tables

### Coverage
- All Bubilet events have coordinates
- Biletix events have coordinates
- Other platforms use venue-based coordinates
- Canonical venues provide fallback coordinates

### Query Examples
```sql
-- Find events within radius (using PostGIS)
SELECT * FROM unique_events 
WHERE ST_DWithin(
  ST_MakePoint((coordinates->>'lng')::float, (coordinates->>'lat')::float)::geography,
  ST_MakePoint(28.9784, 41.0082)::geography,
  5000 -- 5km radius
);

-- Get events with coordinates
SELECT e.*, c.coordinates 
FROM unique_events e
JOIN canonical_venues c ON e.canonical_venue_id = c.id
WHERE c.coordinates IS NOT NULL;
```

---

## 💰 Price Tracking System

### Snapshot-Based Architecture
- **INSERT-only approach**: Never update existing records
- **Complete state capture**: Each snapshot represents full price state
- **Historical preservation**: All price changes tracked
- **Efficient querying**: UUID-based snapshot retrieval

### Price Status Values
- `'active'` - Tickets available for purchase
- `'sold_out'` - Category sold out
- `'inactive'` - No longer offered

### Common Queries
```sql
-- Get current prices for an event
SELECT * FROM ticketing_platforms_raw_data.bubilet_prices
WHERE event_id = 123 
AND snapshot_id = (
  SELECT MAX(snapshot_id) 
  FROM ticketing_platforms_raw_data.bubilet_prices 
  WHERE event_id = 123
);

-- Track price changes over time
SELECT 
  date_trunc('day', created_at) as date,
  category,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM ticketing_platforms_raw_data.biletix_price_history
WHERE event_id = 456
GROUP BY date_trunc('day', created_at), category
ORDER BY date;

-- Find sold out events
SELECT DISTINCT e.* 
FROM ticketing_platforms_raw_data.passo_events e
JOIN ticketing_platforms_raw_data.passo_prices p ON e.id = p.event_id
WHERE p.status = 'sold_out'
AND p.snapshot_id = (
  SELECT MAX(snapshot_id) 
  FROM ticketing_platforms_raw_data.passo_prices 
  WHERE event_id = e.id
);
```

---

## 🔍 Key Indexes

### Performance Optimization
Each table has strategic indexes for common queries:

**Event Tables:**
- Primary key on `id`
- Unique constraint on `(name, venue, date)`
- GIN index on `coordinates` for spatial queries
- B-tree indexes on `date`, `genre`, `venue`

**Price Tables:**
- Primary key on `id`
- Foreign key index on `event_id`
- B-tree index on `snapshot_id`
- Composite indexes for time-based queries

**Unique Events:**
- Multiple indexes on foreign keys
- GIN indexes on array fields (`artist`, `promoter`)
- Date-based indexes for timeline queries
- Venue and genre indexes for filtering

---

## 🛠️ Database Functions & Triggers

### Key Functions

1. **Venue Standardization** (Edge Function)
   - Fuzzy matching algorithm
   - 0.75 similarity threshold
   - Manual override support
   - Automatic venue creation

2. **Event Deduplication**
   - Matches events by name, venue, date
   - Cross-platform linking
   - Automatic unique_events updates

3. **Price History Tracking**
   - Automatic historical record creation
   - Snapshot management
   - Status change detection

### Important Triggers

- `trg_upsert_unique` - Updates unique_events when canonical_venue_id set
- Price history triggers - Archive price changes
- Update timestamp triggers - Track modifications

---

## 📈 Analytics Views & Tables

### Available Analytics
- `venue_price_bucket_simple` - Price distribution by venue
- `venue_capacity_details` - Venue size and utilization
- `venue_area_sold_out_performance` - Sales performance metrics
- `price_bucket_overview_with_venues` - Comprehensive pricing analysis

---

## 🎭 Artists, Promoters & Providers Ecosystem

### Overview
The database includes comprehensive schemas for managing artists, event promoters, and ticketing platform providers, creating a complete event ecosystem with marketing analytics and talent management capabilities.

---

## 👥 Artists Management System

### Three-Tier Artist Architecture

#### 1. artists.artists Table (8,667 records)
Core artist records with standardized information:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique artist identifier |
| `artists_name` | text | Display name |
| `normalized_name` | text | Standardized name for matching |
| `spotify_link` | text | Spotify artist URL |
| `genre` | text[] | Music genres |
| `created_at` | timestamp | Record creation |
| `updated_at` | timestamp | Last modification |

#### 2. canonical_artists Table (8,667 records)
Standardized artist names with deduplication:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Canonical artist ID |
| `artist_name_view` | text | Display name |
| `normalized_name_old` | text | Legacy normalized name |
| `normalized_name` | text | Current normalized name |
| `spotify_link` | text | Spotify URL |
| `unified_profile_id` | uuid (FK) | Link to full profile |
| `agency` | text | Booking agency |
| `genre` | text[] | Music genres |
| `merged_into` | uuid | For duplicate resolution |
| `data_source` | text | Data origin |

**Key Features:**
- Handles artist name variations across platforms
- Merges duplicate artists
- Links to unified profile for rich data

#### 3. unified_artist_profile Table (7,658 records)
Comprehensive artist profiles with streaming and social media data:

| Column | Type | Description |
|--------|------|-------------|
| `uuid` | uuid (PK) | Profile identifier |
| `artist` | text | Artist name |
| `agency` | text | Booking agency |
| `instagram_link` | text | Instagram profile |
| `spotify_link` | text | Spotify artist page |
| `monthly_listeners` | integer | Spotify monthly listeners |
| `followers` | integer | Total followers |
| `city_1` through `city_5` | text | Top listening cities |
| `listeners_1` through `listeners_5` | integer | Listeners per city |
| `youtube_link` | text | YouTube channel |
| `facebook_link` | text | Facebook page |
| `twitter_link` | text | Twitter/X profile |
| `soundcloud` | text | SoundCloud profile |
| `apple_music` | text | Apple Music profile |
| `wikipedia` | text | Wikipedia page |
| `description` | text | Artist biography |
| `booking_emails` | text | Contact information |
| `territory` | text | Booking territory |

### Event-Artist Relationships

#### artists.event_artists Junction Table (5,453 relationships)
Links artists to events with performance order:

| Column | Type | Description |
|--------|------|-------------|
| `event_id` | uuid (FK) | Link to unique_events |
| `artist_id` | uuid (FK) | Link to artists.artists |
| `position` | integer | Performance order (1=headliner) |
| `created_at` | timestamp | Relationship creation |

**Primary Key:** Composite (event_id, artist_id)

### Artist-Related Tables

#### artists.artists_detail Table
Additional artist metadata and analytics:
- Extended biographical information
- Performance statistics
- Historical data

#### artists.spotify_concerts Table
Spotify-sourced concert data:
- Links to unified_artist_profile
- Concert dates and venues
- Ticket availability

---

## 📢 Promoters Schema

### Core Promoter Management

#### promoters.promoters Table (210 records)
Event promoters and organizers:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique promoter ID |
| `name` | text | Promoter name |
| `instagram_link` | text | Instagram profile |
| `meta_ads_query` | text | Meta ads search query |
| `meta_ads_page_scrape_link` | text | Meta ads library URL |
| `created_at` | timestamp | Record creation |

### Campaign Tracking

#### promoters.promoter_campaigns Table
Tracks advertising campaigns for events:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Campaign ID |
| `event_id` | uuid (FK) | Link to unique_events |
| `promoter_id` | uuid (FK) | Link to promoters |
| `ad_page_name` | varchar(255) | Ad page/account name |
| `ad_status` | varchar(50) | Campaign status |
| `ad_start_date` | date | Campaign start |
| `ad_end_date` | date | Campaign end |
| `ad_duration_days` | integer | Total campaign days |
| `ad_caption` | text | Ad copy/caption |
| `match_confidence` | numeric(3,2) | Event match confidence |
| `ad_archive_id` | text | Meta ad library ID |
| `promoter_name` | text | Denormalized name |
| `created_at` | timestamp | Record creation |
| `updated_at` | timestamp | Last update |

**Unique Constraint:** (promoter_id, ad_page_name, ad_caption)

#### promoters.promoters_total_campaigns_by_page Table
Aggregated campaign statistics by promoter and page.

---

## 🎫 Providers Schema

### Platform Provider Management

#### providers.providers Table (5 records)
Ticketing platform providers:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint (PK) | Provider ID |
| `provider` | text | Platform name |
| `meta_ads_scrape_link` | text | Meta ads URL |
| `tiktok` | text | TikTok profile |
| `google_ads_scrape_link` | text | Google ads URL |
| `created_at` | timestamp | Record creation |

**Current Providers:**
- Bubilet
- Biletinial
- Biletix
- Passo
- Bugece

### Provider Marketing Analytics

#### providers.providers_google_ads_campaigns Table
Google Ads campaign data:

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer (PK) | Campaign ID |
| `provider_id` | integer (FK) | Link to providers |
| `advertiser_id` | text | Google advertiser ID |
| `creative_id` | text | Ad creative ID |
| `url` | text | Landing page URL |
| `first_shown` | text | First appearance date |
| `last_shown` | text | Last appearance date |
| `subject` | text | Ad subject/title |
| `format` | text | Ad format type |
| `ad_caption` | text | Ad description |
| `total_impressions` | text | Total views |
| `variation_count` | integer | A/B test variations |
| `variation_contents` | text | Variation details |
| `google_haritalar` | text | Maps impressions |
| `google_play` | text | Play Store impressions |
| `google_alisveris` | text | Shopping impressions |
| `google_arama` | text | Search impressions |
| `youtube` | text | YouTube impressions |
| `date_range` | text | Campaign period |
| `platform_impressions_json` | jsonb | Detailed platform metrics |
| `created_at` | timestamp | Record creation |

#### providers.tiktok_video_metrics Table
TikTok content performance:

| Column | Type | Description |
|--------|------|-------------|
| `provider_id` | integer (FK) | Link to providers |
| Video metrics columns | various | Engagement data |

#### providers.providers_total_campaigns_by_page Table
Aggregated campaign performance by provider.

---

## 🔗 Enhanced Data Relationships

### Complete Relationship Map

```
                          unique_events
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
artists.event_artists  promoter_campaigns    Platform Events
        │                      │              (bubilet, biletix, etc.)
        ▼                      ▼                      │
artists.artists       promoters.promoters            │
        │                      │                      ▼
        ▼                      │              Platform Prices
canonical_artists              │              Platform Price History
        │                      │
        ▼                      ▼
unified_artist_profile   Meta/Google Ads
                         Campaign Data

                    providers.providers
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                      ▼
Google Ads Campaigns                  TikTok Metrics
```

### Key Foreign Key Relationships

1. **Events to Artists** (Many-to-Many)
   - `unique_events.id` ← `artists.event_artists.event_id`
   - `artists.event_artists.artist_id` → `artists.artists.id`

2. **Events to Promoters** (Many-to-Many via Campaigns)
   - `unique_events.id` ← `promoters.promoter_campaigns.event_id`
   - `promoters.promoter_campaigns.promoter_id` → `promoters.promoters.id`

3. **Artist Hierarchy**
   - `canonical_artists.unified_profile_id` → `unified_artist_profile.uuid`
   - `artists.spotify_concerts.artist_id` → `unified_artist_profile.uuid`

4. **Provider Marketing**
   - `providers.providers.id` ← `providers_google_ads_campaigns.provider_id`
   - `providers.providers.id` ← `tiktok_video_metrics.provider_id`

---

## 📊 Advanced Query Examples

### Artist Queries

```sql
-- Get all artists for an event with their profiles
SELECT 
  e.name as event_name,
  a.artists_name,
  a.spotify_link,
  ea.position,
  uap.monthly_listeners,
  uap.instagram_link
FROM unique_events e
JOIN artists.event_artists ea ON e.id = ea.event_id
JOIN artists.artists a ON ea.artist_id = a.id
LEFT JOIN canonical_artists ca ON ca.normalized_name_old = a.normalized_name
LEFT JOIN unified_artist_profile uap ON ca.unified_profile_id = uap.uuid
WHERE e.id = 'event-uuid-here'
ORDER BY ea.position;

-- Find all events for a specific artist
SELECT 
  e.name,
  e.date,
  v.name as venue,
  v.city
FROM unique_events e
JOIN artists.event_artists ea ON e.id = ea.event_id
JOIN artists.artists a ON ea.artist_id = a.id
JOIN canonical_venues v ON e.canonical_venue_id = v.id
WHERE a.normalized_name = 'artist-normalized-name'
AND e.date > NOW()
ORDER BY e.date;

-- Get top artists by event count
SELECT 
  a.artists_name,
  COUNT(DISTINCT ea.event_id) as event_count,
  array_agg(DISTINCT a.genre) as genres,
  MAX(uap.monthly_listeners) as spotify_listeners
FROM artists.artists a
JOIN artists.event_artists ea ON a.id = ea.artist_id
LEFT JOIN canonical_artists ca ON ca.normalized_name_old = a.normalized_name
LEFT JOIN unified_artist_profile uap ON ca.unified_profile_id = uap.uuid
GROUP BY a.id, a.artists_name
ORDER BY event_count DESC
LIMIT 50;
```

### Promoter Campaign Queries

```sql
-- Get active campaigns for upcoming events
SELECT 
  e.name as event_name,
  e.date as event_date,
  p.name as promoter,
  pc.ad_page_name,
  pc.ad_status,
  pc.ad_start_date,
  pc.ad_end_date,
  pc.ad_duration_days
FROM unique_events e
JOIN promoters.promoter_campaigns pc ON e.id = pc.event_id
JOIN promoters.promoters p ON pc.promoter_id = p.id
WHERE e.date > NOW()
AND pc.ad_status = 'ACTIVE'
ORDER BY e.date;

-- Analyze promoter campaign effectiveness
SELECT 
  p.name as promoter,
  COUNT(DISTINCT pc.event_id) as events_promoted,
  AVG(pc.ad_duration_days) as avg_campaign_length,
  COUNT(DISTINCT pc.ad_page_name) as ad_accounts_used,
  AVG(pc.match_confidence) as avg_match_confidence
FROM promoters.promoters p
JOIN promoters.promoter_campaigns pc ON p.id = pc.promoter_id
GROUP BY p.id, p.name
ORDER BY events_promoted DESC;
```

### Provider Analytics Queries

```sql
-- Get provider marketing spend distribution
SELECT 
  p.provider,
  COUNT(DISTINCT gac.creative_id) as total_creatives,
  COUNT(DISTINCT gac.url) as unique_landing_pages,
  SUM(CAST(gac.total_impressions AS INTEGER)) as total_impressions,
  jsonb_object_keys(gac.platform_impressions_json) as platform
FROM providers.providers p
JOIN providers.providers_google_ads_campaigns gac ON p.id = gac.provider_id
GROUP BY p.provider, platform
ORDER BY p.provider, total_impressions DESC;

-- Cross-platform event availability
SELECT 
  e.name,
  e.date,
  array_agg(DISTINCT 
    CASE 
      WHEN e.bubilet_event_id IS NOT NULL THEN 'Bubilet'
      WHEN e.biletix_event_id IS NOT NULL THEN 'Biletix'
      WHEN e.biletinial_event_id IS NOT NULL THEN 'Biletinial'
      WHEN e.passo_event_id IS NOT NULL THEN 'Passo'
      WHEN e.bugece_event_id IS NOT NULL THEN 'Bugece'
    END
  ) as available_platforms
FROM unique_events e
WHERE e.date > NOW()
GROUP BY e.id, e.name, e.date
HAVING COUNT(
  CASE WHEN e.bubilet_event_id IS NOT NULL THEN 1
       WHEN e.biletix_event_id IS NOT NULL THEN 1
       WHEN e.biletinial_event_id IS NOT NULL THEN 1
       WHEN e.passo_event_id IS NOT NULL THEN 1
       WHEN e.bugece_event_id IS NOT NULL THEN 1
  END
) > 1;
```

### Comprehensive Event Intelligence Query

```sql
-- Full event intelligence with artists, promoters, and platforms
WITH event_artists AS (
  SELECT 
    ea.event_id,
    array_agg(
      a.artists_name ORDER BY ea.position
    ) as artists,
    array_agg(
      uap.monthly_listeners ORDER BY ea.position
    ) as artist_popularity
  FROM artists.event_artists ea
  JOIN artists.artists a ON ea.artist_id = a.id
  LEFT JOIN canonical_artists ca ON ca.normalized_name_old = a.normalized_name
  LEFT JOIN unified_artist_profile uap ON ca.unified_profile_id = uap.uuid
  GROUP BY ea.event_id
),
event_campaigns AS (
  SELECT 
    pc.event_id,
    array_agg(DISTINCT p.name) as promoters,
    COUNT(DISTINCT pc.id) as campaign_count,
    MIN(pc.ad_start_date) as first_campaign_date
  FROM promoters.promoter_campaigns pc
  JOIN promoters.promoters p ON pc.promoter_id = p.id
  GROUP BY pc.event_id
)
SELECT 
  e.name as event_name,
  e.date,
  v.name as venue,
  v.city,
  v.capacity,
  ea.artists,
  ea.artist_popularity,
  ec.promoters,
  ec.campaign_count,
  ec.first_campaign_date,
  e.providers as platforms
FROM unique_events e
JOIN canonical_venues v ON e.canonical_venue_id = v.id
LEFT JOIN event_artists ea ON e.id = ea.event_id
LEFT JOIN event_campaigns ec ON e.id = ec.event_id
WHERE e.date > NOW()
AND e.status = 'active'
ORDER BY e.date
LIMIT 100;
```

---

## 💡 Implementation Notes for Artist/Promoter Features

### For Map Platform Integration

1. **Artist-Based Discovery**
   - Show events by artist popularity (Spotify listeners)
   - Artist tour routing on map
   - Similar artist recommendations
   - Genre-based clustering

2. **Promoter Intelligence**
   - Display promoter badges on events
   - Show campaign-backed events
   - Promoter reliability scoring
   - Multi-promoter collaborations

3. **Provider Analytics**
   - Platform availability indicators
   - Price comparison across providers
   - Provider-specific promotions
   - Marketing campaign visibility

### Data Quality Considerations

1. **Artist Normalization**
   - Multiple normalization levels ensure matching
   - Merged duplicates tracked via `merged_into`
   - Spotify data validates artist identity

2. **Campaign Matching**
   - `match_confidence` indicates campaign-event link quality
   - Manual review for low-confidence matches
   - Ad archive IDs enable verification

3. **Provider Coverage**
   - Not all events have provider campaigns
   - TikTok metrics limited to active accounts
   - Google Ads data depends on transparency settings

---

## 🔐 Data Integrity

### Constraints
- Foreign key relationships enforced
- Unique constraints on natural keys
- NOT NULL on critical fields
- Check constraints on status values

### Data Quality
- 98-100% platform relationship validity
- Comprehensive venue standardization
- Consistent date/time handling (timezone-aware)
- Array field normalization

---

## 🚀 API Access Patterns

### For Map View Platform

1. **Get Events by Location**
```sql
-- Events near a point with venue details
SELECT 
  e.*,
  v.name as venue_name,
  v.coordinates,
  v.city,
  array_agg(DISTINCT p.provider) as available_on
FROM unique_events e
JOIN canonical_venues v ON e.canonical_venue_id = v.id
LEFT JOIN (
  SELECT event_id, 'bubilet' as provider FROM ticketing_platforms_raw_data.bubilet_events
  UNION ALL
  SELECT event_id, 'biletix' FROM ticketing_platforms_raw_data.biletix_events
  -- ... other platforms
) p ON p.event_id IN (e.bubilet_event_id, e.biletix_event_id, ...)
WHERE v.coordinates IS NOT NULL
AND e.date > NOW()
GROUP BY e.id, v.id;
```

2. **Get Event Prices**
```sql
-- Current prices across all platforms for an event
WITH event_prices AS (
  -- Get prices from each platform
  SELECT price, category, 'bubilet' as platform 
  FROM ticketing_platforms_raw_data.bubilet_prices
  WHERE event_id = (SELECT bubilet_event_id FROM unique_events WHERE id = $1)
  AND snapshot_id = (SELECT MAX(snapshot_id) FROM ...)
  
  UNION ALL
  
  SELECT price, category, 'biletix' as platform
  FROM ticketing_platforms_raw_data.biletix_prices
  WHERE event_id = (SELECT biletix_event_id FROM unique_events WHERE id = $1)
  -- ... continue for all platforms
)
SELECT 
  MIN(price) as min_price,
  MAX(price) as max_price,
  array_agg(DISTINCT platform) as platforms,
  array_agg(DISTINCT category) as categories
FROM event_prices;
```

3. **Search Events**
```sql
-- Full-text search with filters
SELECT * FROM unique_events
WHERE 
  to_tsvector('english', name || ' ' || COALESCE(description, '')) 
  @@ plainto_tsquery('english', $1)
  AND date BETWEEN $2 AND $3
  AND genre = ANY($4)
  AND canonical_venue_id = ANY($5)
ORDER BY date;
```

---

## 🔄 Data Update Cycle

### Scraping Schedule
- Automated scrapers run periodically
- Each platform scraped independently
- Snapshot created per scraping run
- Historical data preserved

### Update Process
1. Scraper fetches current platform data
2. Events upserted (update or insert)
3. New price snapshot created
4. Venue standardization triggered
5. Unique events table updated
6. Analytics views refreshed

---

## 💡 Implementation Notes for Map Platform

### Key Considerations

1. **Coordinate Availability**
   - Not all events have coordinates
   - Use canonical venue coordinates as fallback
   - Consider clustering for performance

2. **Real-time Pricing**
   - Prices change frequently
   - Always query latest snapshot
   - Consider caching strategy

3. **Cross-platform Events**
   - Same event may appear on multiple platforms
   - Use unique_events for deduplication
   - Show price comparison opportunity

4. **Performance Optimization**
   - Use spatial indexes for map queries
   - Implement pagination for large result sets
   - Consider materialized views for complex queries

5. **Data Freshness**
   - last_seen indicates data age
   - Consider showing data freshness to users
   - Handle stale data gracefully

### Recommended Tech Stack Integration

**Backend:**
- PostGIS for spatial queries
- GraphQL/REST API for data access
- Redis for caching frequently accessed data
- WebSocket for real-time price updates

**Frontend:**
- Mapbox/Google Maps for visualization
- Marker clustering for performance
- Filter system using indexes
- Price comparison widgets

---

## 📝 Sample Integration Code

### Node.js/TypeScript Example
```typescript
interface Event {
  id: string;
  name: string;
  venue: {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    city: string;
  };
  date: Date;
  prices: {
    min: number;
    max: number;
    platforms: string[];
  };
}

async function getEventsNearLocation(
  lat: number, 
  lng: number, 
  radiusKm: number
): Promise<Event[]> {
  const query = `
    SELECT 
      e.id,
      e.name,
      e.date,
      v.id as venue_id,
      v.name as venue_name,
      v.coordinates,
      v.city
    FROM unique_events e
    JOIN canonical_venues v ON e.canonical_venue_id = v.id
    WHERE ST_DWithin(
      ST_MakePoint((v.coordinates->>'lng')::float, (v.coordinates->>'lat')::float)::geography,
      ST_MakePoint($1, $2)::geography,
      $3
    )
    AND e.date > NOW()
    AND e.status = 'active'
    ORDER BY e.date
    LIMIT 100;
  `;
  
  // Execute query and transform results
  return db.query(query, [lng, lat, radiusKm * 1000]);
}
```

---

## 🔮 Future Enhancements

### Planned Features
- Artist and promoter standardization tables
- Enhanced venue capacity tracking
- Weather data integration for outdoor events
- Social media engagement metrics
- Dynamic pricing predictions
- Recommendation engine

### Scaling Considerations
- Partitioning for historical data
- Read replicas for heavy traffic
- Elasticsearch for advanced search
- CDN for static venue images
- Event streaming for real-time updates

---

## 📚 Related Documentation

- Platform scraper implementations in `/SCRAPERS/`
- Venue standardization logic in `/supabase/functions/`
- Price tracking documentation in `bubilet_logic.md`
- Database analysis reports in `/efes/preparation/`
- Schema extraction tools in `/scripts/`

---

## 🆘 Support & Maintenance

### Common Issues
1. **Missing Coordinates**: Check canonical_venues table
2. **Duplicate Events**: Review unique_events matching logic
3. **Price Discrepancies**: Verify snapshot_id usage
4. **Venue Mismatches**: Check manual_venue_map overrides

### Monitoring Queries
```sql
-- Check data freshness
SELECT 
  'bubilet' as platform,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '24 hours') as fresh_events
FROM ticketing_platforms_raw_data.bubilet_events
UNION ALL
-- Repeat for other platforms

-- Find venues needing coordinates
SELECT * FROM canonical_venues 
WHERE coordinates IS NULL 
AND id IN (
  SELECT DISTINCT canonical_venue_id 
  FROM unique_events 
  WHERE date > NOW()
);

-- Check price snapshot health
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT snapshot_id) as snapshots,
  COUNT(DISTINCT event_id) as events_priced
FROM ticketing_platforms_raw_data.bubilet_prices
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

This documentation provides a complete reference for building an event map view platform on top of this database. The system is production-ready with comprehensive data coverage, standardization, and tracking capabilities.