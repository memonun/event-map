// Database types for Event Map Platform
// Based on the comprehensive event aggregation database schema

export interface Coordinates {
  lat: number;
  lng: number;
}

// Core event types
export interface UniqueEvent {
  id: string;
  name: string;
  canonical_venue_id: string;
  date: string;
  genre: string | null;
  promoter: string[] | null;
  artist: string[] | null;
  description: string | null;
  providers: string[] | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  // Platform-specific event IDs
  biletinial_event_id: number | null;
  biletix_event_id: number | null;
  passo_event_id: number | null;
  bugece_event_id: number | null;
  bubilet_event_id: number | null;
}

export interface CanonicalVenue {
  id: string;
  name: string;
  city: string | null;
  capacity: number | null;
  coordinates: Coordinates | null;
  created_at: string;
}

// Platform event types
export interface PlatformEvent {
  id: number;
  provider: string;
  name: string;
  venue: string;
  date: string;
  genre: string | null;
  created_at: string;
  last_seen: string;
  canonical_venue_id: string | null;
  description: string | null;
  promoter: string | null;
  artist: string[] | null;
  event_url: string | null;
  coordinates: Coordinates | null;
}

// Biletix specific fields
export interface BiletixEvent extends PlatformEvent {
  promoter_code: string | null;
  seat_plan_image_url: string | null;
  single_seat_mode: boolean | null;
  ticket_selection_data: any | null;
  publish_date: string | null;
  additional_images: string[] | null;
}

// Bugece specific fields
export interface BugeceEvent extends PlatformEvent {
  ticket_types: string[] | null;
  min_price: number | null;
  max_price: number | null;
}

// Price tracking types
export interface PlatformPrice {
  id: number;
  event_id: number;
  category: string;
  price: number;
  remaining: number | null;
  sold_out: boolean;
  created_at: string;
  last_seen: string;
  snapshot_id: string;
  status: 'active' | 'sold_out' | 'inactive';
}

export interface PriceHistory extends PlatformPrice {
  // Same structure as PlatformPrice but for historical tracking
}

// Artist types
export interface Artist {
  id: string;
  artists_name: string;
  normalized_name: string;
  spotify_link: string | null;
  genre: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CanonicalArtist {
  id: string;
  artist_name_view: string;
  normalized_name_old: string | null;
  normalized_name: string;
  spotify_link: string | null;
  unified_profile_id: string | null;
  agency: string | null;
  genre: string[] | null;
  merged_into: string | null;
  data_source: string | null;
}

export interface UnifiedArtistProfile {
  uuid: string;
  artist: string;
  agency: string | null;
  instagram_link: string | null;
  spotify_link: string | null;
  monthly_listeners: number | null;
  followers: number | null;
  city_1: string | null;
  city_2: string | null;
  city_3: string | null;
  city_4: string | null;
  city_5: string | null;
  listeners_1: number | null;
  listeners_2: number | null;
  listeners_3: number | null;
  listeners_4: number | null;
  listeners_5: number | null;
  youtube_link: string | null;
  facebook_link: string | null;
  twitter_link: string | null;
  soundcloud: string | null;
  apple_music: string | null;
  wikipedia: string | null;
  description: string | null;
  booking_emails: string | null;
  territory: string | null;
}

export interface EventArtist {
  event_id: string;
  artist_id: string;
  position: number;
  created_at: string;
}

// Promoter types
export interface Promoter {
  id: string;
  name: string;
  instagram_link: string | null;
  meta_ads_query: string | null;
  meta_ads_page_scrape_link: string | null;
  created_at: string;
}

export interface PromoterCampaign {
  id: string;
  event_id: string;
  promoter_id: string;
  ad_page_name: string;
  ad_status: string;
  ad_start_date: string;
  ad_end_date: string;
  ad_duration_days: number | null;
  ad_caption: string | null;
  match_confidence: number | null;
  ad_archive_id: string | null;
  promoter_name: string | null;
  created_at: string;
  updated_at: string;
}

// Provider types
export interface Provider {
  id: number;
  provider: string;
  meta_ads_scrape_link: string | null;
  tiktok: string | null;
  google_ads_scrape_link: string | null;
  created_at: string;
}

// Venue standardization types
export interface ManualVenueMap {
  id: string;
  raw_venue: string;
  canonical_id: string;
  source: string;
}

export interface UnmatchedVenue {
  id: string;
  raw_venue: string;
  occurrences: number;
  platforms: string[] | null;
  first_seen: string;
  suggested_match: string | null;
}

// Combined types for API responses
export interface EventWithVenue extends UniqueEvent {
  venue: CanonicalVenue;
}

export interface EventWithDetails extends EventWithVenue {
  artists: Artist[];
  promoters: Promoter[];
  prices: {
    platform: string;
    current_prices: PlatformPrice[];
    min_price: number | null;
    max_price: number | null;
  }[];
}

export interface EventSearchParams {
  query?: string;
  genre?: string;
  city?: string;
  date_from?: string;
  date_to?: string;
  lat?: number;
  lng?: number;
  radius?: number; // in meters
  platforms?: string[];
  limit?: number;
  offset?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// API response types
export interface EventsResponse {
  events: EventWithVenue[];
  total: number;
  has_more: boolean;
}

export interface PriceComparisonResponse {
  event_id: string;
  platforms: {
    platform: string;
    prices: PlatformPrice[];
    min_price: number | null;
    max_price: number | null;
    url: string | null;
  }[];
}