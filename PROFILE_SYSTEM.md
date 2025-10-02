# Profile & Account Management System

## Overview

The Event Map Platform features a comprehensive account management system that allows users to manage their venue preferences, follow artists, maintain social connections, and configure account settings through a unified interface.

## System Architecture

### Route Structure

```
/protected/profile/
├── page.tsx                           # Entry point - redirects to /account
├── account/                           # Main account management hub
│   ├── layout.tsx                     # Shared layout with sidebar navigation
│   ├── page.tsx                       # Default redirect to venues
│   ├── venues/                        # Venue favorites management
│   │   └── page.tsx
│   ├── artists/                       # Artist following system
│   │   └── page.tsx
│   ├── friends/                       # Social connections
│   │   └── page.tsx
│   └── settings/                      # Account configuration
│       └── page.tsx
└── events/                            # Events & activity (existing)
    └── page.tsx
```

### Navigation Flow

1. **Entry Point**: `/protected/profile` → redirects to `/protected/profile/account`
2. **Default Account Page**: `/protected/profile/account` → redirects to `/protected/profile/account/venues`
3. **Sidebar Navigation**: Allows switching between the 4 main sections
4. **Events Page**: Accessible via sidebar link to existing events functionality

## Core Features

### 1. Your Venues (`/protected/profile/account/venues`)

**Purpose**: Manage favorite venues and track their upcoming events.

**Key Features**:
- **Venue Favorites Management**: Add/remove venues from favorites
- **Statistics Dashboard**: Track favorite venues count, upcoming events, total events
- **Search Functionality**: Find and add new venues to favorites
- **Venue Cards**: Display venue information, capacity, event statistics
- **Quick Actions**: View venue events, navigate to venue location

**API Integration**:
```typescript
GET    /api/profile/venues     // Fetch user's favorite venues
POST   /api/profile/venues     // Add venue to favorites
DELETE /api/profile/venues     // Remove venue from favorites
```

### 2. Your Artists (`/protected/profile/account/artists`)

**Purpose**: Follow artists and track their upcoming events through a calendar interface.

**Key Features**:
- **Two-Tab Interface**: 
  - Artists List: Manage followed artists
  - Artist Calendar: View upcoming events from all followed artists
- **Statistics Dashboard**: Followed artists, upcoming events, total events, genres
- **Artist Management**: Follow/unfollow artists with real-time updates
- **Artist Calendar**: Monthly timeline view of upcoming events
- **Navigation Integration**: Click artist cards → navigate to `/artists/{id}` endpoints

**API Integration**:
```typescript
GET    /api/profile/artists           // Get followed artists with details
POST   /api/profile/artists          // Follow an artist
DELETE /api/profile/artists          // Unfollow an artist
GET    /api/profile/artists/calendar // Get calendar of upcoming artist events
```

### 3. Friends (`/protected/profile/account/friends`)

**Purpose**: Manage social connections and view friend activity.

**Key Features**:
- **Three-Tab Interface**: 
  - Friends: View current connections
  - Incoming: Friend requests received
  - Outgoing: Friend requests sent
- **Statistics Dashboard**: Total friends, pending requests
- **Request Management**: Accept/decline incoming friend requests
- **Social Activity**: View friends' recent event activity
- **Search Integration**: Find and connect with other users

**API Integration**: Uses existing friends API from events system.

### 4. Settings (`/protected/profile/account/settings`)

**Purpose**: Configure account information and preferences.

**Key Features**:
- **Profile Information**: Enhanced UserProfileForm with beautiful styling
- **Real-time Username Validation**: Check availability as you type
- **Privacy Settings**: Placeholder for future privacy controls
- **Notification Preferences**: Placeholder for future notification settings
- **Visual Design**: Preserves original form styling with colored borders and validation

## Component Architecture

### Core Components

```
components/profile/
├── account-sidebar.tsx              # 4-section navigation sidebar
├── your-venues-section.tsx          # Venues management interface
├── venue-card.tsx                   # Individual venue display/actions
├── add-venue-dialog.tsx             # Search and add venues dialog
├── your-artists-section.tsx         # Artists management interface
├── artist-card.tsx                  # Individual artist display/actions
├── artist-calendar.tsx              # Monthly calendar of artist events
├── add-artist-dialog.tsx            # Search and follow artists dialog
├── friends-management-section.tsx   # Social connections interface
├── user-profile-form.tsx            # Enhanced profile editing form
└── [supporting components...]
```

### Shared Components (from Events System)

```
components/profile/
├── profile-header.tsx               # User profile header with stats
├── resizable-friends-sidebar.tsx    # Adjustable friends sidebar
├── future-events-section.tsx        # Upcoming events management
├── activity-section.tsx             # Past events and activity
├── profile-event-card.tsx           # Modern event cards
├── artist-bubble.tsx                # Clickable artist navigation
└── stacked-event-icons.tsx          # Friend activity visualization
```

## Database Integration

### User Preferences Storage

User preferences are stored in the `user_profiles.preferences` JSONB field:

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    preferences JSONB DEFAULT '{
        "genres": [],
        "favorite_venues": [],
        "followed_artists": []
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Example Preferences Structure

```json
{
    "genres": ["pop", "rock", "electronic"],
    "favorite_venues": [
        "uuid-of-zorlu-psm",
        "uuid-of-istanbul-kongre-merkezi"
    ],
    "followed_artists": [
        "dua-lipa",
        "tarkan", 
        "sezen-aksu"
    ]
}
```

### Database Queries

**Get User's Favorite Venues with Event Counts**:
```sql
SELECT v.*, 
       COUNT(e.id) FILTER (WHERE e.date > NOW()) as upcoming_events,
       COUNT(e.id) as total_events
FROM canonical_venues v
LEFT JOIN unique_events e ON v.id = e.canonical_venue_id
WHERE v.id = ANY(user_preferences.favorite_venues)
GROUP BY v.id;
```

**Get Followed Artists with Upcoming Events**:
```sql
SELECT a.*, 
       COUNT(e.id) FILTER (WHERE e.date > NOW()) as upcoming_count
FROM artists.artists a
LEFT JOIN artists.event_artists ea ON a.id = ea.artist_id
LEFT JOIN unique_events e ON ea.event_id = e.id
WHERE a.normalized_name = ANY(user_preferences.followed_artists)
GROUP BY a.id;
```

## API Endpoints Reference

### Venue Management
- `GET /api/profile/venues` - Fetch user's favorite venues with event statistics
- `POST /api/profile/venues` - Add venue to favorites (body: `{venueId}`)
- `DELETE /api/profile/venues` - Remove venue from favorites (body: `{venueId}`)

### Artist Management
- `GET /api/profile/artists` - Get followed artists with upcoming events preview
- `POST /api/profile/artists` - Follow an artist (body: `{artistName}`)
- `DELETE /api/profile/artists` - Unfollow an artist (body: `{artistName}`)
- `GET /api/profile/artists/calendar` - Get calendar view of all followed artists' upcoming events

### Profile Management
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/username-check?username={username}` - Check username availability

### Friends Management
- Uses existing `/api/profile/friends` endpoint from events system

## User Experience Features

### Design Principles
- **Unified Navigation**: Single sidebar for all account sections
- **Responsive Design**: Mobile-friendly with collapsible elements
- **Real-time Feedback**: Immediate updates on follow/unfollow actions
- **Search Integration**: Easy discovery and addition of venues/artists
- **Statistics Overview**: Dashboard cards showing user activity

### Visual Styling
- **Modern Card Design**: Clean, bordered cards with hover effects
- **Color-coded Status**: Green/red borders for validation states
- **Professional Typography**: Consistent font sizes and weights
- **Spacing & Layout**: Proper grid systems and component spacing

### Interactive Elements
- **Search Dialogs**: Modal interfaces for adding venues and artists
- **Dropdown Menus**: Context menus for card actions
- **Tab Interfaces**: Organized content in friends and artists sections
- **Calendar Views**: Monthly timeline for artist events

## Integration Points

### Navigation Integration
- **Floating User Menu**: Updated to link to new account system
- **Admin Dashboard**: Links updated to use new profile routes
- **Artist Cards**: Navigate to `/artists/{normalized-name}` pages
- **Event System**: Maintained existing events page functionality

### Social Features Integration
- **Friends System**: Leverages existing social connections
- **Event Interactions**: Connects with existing RSVP system
- **Activity Feeds**: Shows friend activity in various sections

### Search Integration
- **Artist Search**: Integrates with existing artist database
- **Venue Search**: Connects with canonical venues system
- **Event Discovery**: Links to main event search and filtering

## Troubleshooting

### Common Issues

**Routes not accessible**:
- Check that `/protected/profile` redirects properly
- Verify middleware authentication is working
- Ensure all nested routes build successfully

**API endpoints failing**:
- Check Supabase client authentication
- Verify user_profiles table exists with proper schema
- Test preferences JSONB field structure

**Search dialogs not working**:
- Verify venue/artist search APIs are functional
- Check that search results are properly formatted
- Test add/remove operations update preferences correctly

### Development Notes
- All routes require authentication via Supabase middleware
- Artist names are stored as normalized strings in preferences
- Venue IDs are stored as UUIDs in preferences
- Real-time updates use client-side state management
- Mock data is used in search dialogs (to be replaced with real APIs)

## Future Enhancements

### Planned Features
- **Privacy Controls**: Granular visibility settings
- **Notification System**: Event reminders and friend activity alerts
- **Advanced Search**: Filters for venue capacity, location, artist genres
- **Social Recommendations**: Suggest venues/artists based on friend activity
- **Export Features**: Download personal event history and preferences

### Technical Improvements
- **Caching Layer**: Redis caching for frequently accessed data
- **Real-time Updates**: WebSocket integration for live friend activity
- **Mobile App**: React Native implementation of account features
- **Analytics**: User behavior tracking and preference analysis