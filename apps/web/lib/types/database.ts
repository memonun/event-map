// Database types for Event Map Platform
// Based on the comprehensive event aggregation database schema

// User and social types
export interface UserProfile {
  id: string; // References auth.users.id
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  role: 'admin' | 'user';
  preferences: {
    genres: string[];
    favorite_venues: string[];
    followed_artists: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface UserEvent {
  id: string;
  user_id: string;
  event_id: string;
  status: 'attended' | 'going' | 'interested' | 'maybe';
  created_at: string;
  updated_at: string;
}

export interface CapsuleEntry {
  id: string;
  user_id: string;
  event_id: string;
  rating: number | null; // 1-5 stars
  reflection: string | null;
  media_urls: string[];
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
}

export interface UserConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface EventAggregates {
  event_id: string;
  attendee_count: number;
  going_count: number;
  interested_count: number;
  capsule_count: number;
  avg_rating: number | null;
  rating_count: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface UserStats {
  events_attended: number;
  events_going: number;
  events_interested: number;
  capsules_created: number;
  cities_visited: number;
  genres_explored: number;
  total_connections: number;
}

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
  // Image fields (primarily from Bugece)
  image_url: string | null;
  featured_image: string | null;
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

// Enhanced event with ticket URLs
export interface TicketUrl {
  platform: string;
  url: string;
  available: boolean;
}

export interface EventWithTicketUrls extends UniqueEvent {
  venue: CanonicalVenue;
  ticket_urls: TicketUrl[];
  actual_time?: string; // Actual datetime from provider table
}

// Biletix specific fields
export interface BiletixEvent extends PlatformEvent {
  promoter_code: string | null;
  seat_plan_image_url: string | null;
  single_seat_mode: boolean | null;
  ticket_selection_data: Record<string, unknown> | null;
  publish_date: string | null;
  additional_images: string[] | null;
}

// Bugece specific fields
export interface BugeceEvent extends PlatformEvent {
  ticket_types: string[] | null;
  min_price: number | null;
  max_price: number | null;
  image_url: string | null;
  poster_image: string | null;
  banner_image: string | null;
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
  tracked_at: string;
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

// New AI Knowledge Base Types (replacing old EventEmbedding)
export interface EventKnowledgeSection {
  id: number; // BIGINT from database
  event_id: string;
  content: string; // Turkish narrative content
  embedding: number[] | string; // 1536-dimensional vector (may be string from DB)
  metadata: {
    language: string; // 'tr' or 'en'
    content_version: string;
    cultural_context: boolean;
    generated_at?: string;
    template_version: string;
  };
  created_at: string;
  updated_at: string;
}

// DEPRECATED: Use EventKnowledgeSection instead
export interface EventEmbedding {
  id: string;
  event_id: string;
  embedding: number[]; // 384-dimensional vector
  content: string; // The original text used to generate embedding
  created_at: string;
  updated_at: string;
}

// New Turkish-optimized search result
export interface TurkishEventSearchResult extends EventWithVenue {
  similarity_score: number;
  matching_content: string;
  cultural_context?: string;
  intent_match?: {
    temporal?: string;
    price_sensitivity?: string;
    social_context?: string;
    atmosphere?: string;
    location?: string;
    genre?: string;
  };
}

// DEPRECATED: Use TurkishEventSearchResult instead
export interface VectorSearchResult extends EventWithVenue {
  similarity_score: number;
  matching_content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  event_recommendations?: TurkishEventSearchResult[];
  // DEPRECATED: Use event_recommendations instead
  legacy_recommendations?: VectorSearchResult[];
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
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

// Turkish cultural context types
export interface TurkishCulturalContext {
  temporal_context: string; // 'ramazan', 'bayram', 'yaz_tatili', etc.
  transport_context: string; // 'metro_access', 'city_center', 'parking_available'
  social_timing: string; // 'family_friendly', 'late_night', 'weekend_activity'
  atmosphere_type: string; // 'samimi', 'acik_hava', 'formal', 'casual'
  price_positioning: string; // 'budget', 'orta_segment', 'premium'
}

export interface TurkishQueryIntent {
  temporal?: string; // 'bu_aksam', 'hafta_sonu', 'bayram'
  price_sensitivity?: string; // 'ucuz', 'premium', 'ucretsiz'
  social_context?: string; // 'romantik', 'aile', 'arkadas', 'solo'
  atmosphere?: string; // 'sakin', 'canli', 'samimi', 'acik_hava'
  location?: string; // 'istanbul', 'ankara', 'izmir'
  genre?: string; // 'konser', 'tiyatro', 'stand_up', 'sergi'
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
  // New Turkish-specific parameters
  cultural_context?: TurkishCulturalContext;
  query_intent?: TurkishQueryIntent;
  language_preference?: 'tr' | 'en';
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