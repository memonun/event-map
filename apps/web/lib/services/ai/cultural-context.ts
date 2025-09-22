/**
 * Turkish Cultural Context Analyzer
 * Determines cultural context for events based on timing, location, and type
 */

import type { 
  UniqueEvent, 
  CanonicalVenue, 
  TurkishCulturalContext 
} from '@/lib/types';

/**
 * Analyze and determine cultural context for an event
 */
export function analyzeCulturalContext(
  event: UniqueEvent, 
  venue: CanonicalVenue
): TurkishCulturalContext {
  const eventDate = new Date(event.date);
  
  return {
    temporal_context: analyzeTemporalContext(eventDate),
    transport_context: analyzeTransportContext(venue),
    social_timing: analyzeSocialTiming(event, eventDate),
    atmosphere_type: analyzeAtmosphereType(event, venue),
    price_positioning: analyzePricePositioning(event, venue)
  };
}

/**
 * Determine temporal/seasonal context
 */
function analyzeTemporalContext(eventDate: Date): string {
  const month = eventDate.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Ramadan detection (approximate - varies yearly)
  // This is a simplified version - in production you'd use Islamic calendar
  if (isRamadanPeriod(eventDate)) {
    return 'ramazan';
  }
  
  // Religious holidays (approximate dates)
  if (isEidPeriod(eventDate)) {
    return 'bayram';
  }
  
  // Seasonal contexts
  if (month >= 6 && month <= 8) {
    return 'yaz_tatili'; // Summer vacation
  } else if (month === 12 || month === 1) {
    return 'kis_tatili'; // Winter vacation
  } else if (month >= 3 && month <= 5) {
    return 'ilkbahar'; // Spring
  } else {
    return 'sonbahar'; // Fall
  }
}

/**
 * Determine transport accessibility context
 */
function analyzeTransportContext(venue: CanonicalVenue): string {
  const city = venue.city?.toLowerCase();
  const venueName = venue.name?.toLowerCase();
  
  // Metro accessible venues (known locations)
  const metroAccessibleVenues = [
    'zorlu center', 'trump towers', 'palladium', 'istanbul kongre merkezi',
    'ankara arena', 'cepa', 'meb şura salonu'
  ];
  
  if (metroAccessibleVenues.some(name => venueName?.includes(name))) {
    return 'metro_access';
  }
  
  // City center locations
  const cityCenterVenues = [
    'maksim', 'gazinosport', 'cemal reşit rey', 'aya irini', 'galatasaray üniversitesi',
    'boğaziçi üniversitesi', 'sabancı üniversitesi', 'bahçeşehir üniversitesi'
  ];
  
  if (cityCenterVenues.some(name => venueName?.includes(name))) {
    return 'city_center';
  }
  
  // Venues with known parking facilities
  const parkingVenues = [
    'volkswagen arena', 'türk telekom stadyumu', 'ulker sports arena',
    'bjk inönü stadyumu', 'atatürk olimpiyat stadyumu'
  ];
  
  if (parkingVenues.some(name => venueName?.includes(name))) {
    return 'parking_available';
  }
  
  // Default based on city
  if (city === 'istanbul' || city === 'İstanbul') {
    return 'metro_access'; // Istanbul has extensive metro
  } else if (city === 'ankara') {
    return 'city_center'; // Ankara venues tend to be central
  } else {
    return 'parking_available'; // Other cities usually have parking
  }
}

/**
 * Determine social timing appropriateness
 */
function analyzeSocialTiming(event: UniqueEvent, eventDate: Date): string {
  const hour = eventDate.getHours();
  const genre = event.genre?.toLowerCase();
  const eventName = event.name?.toLowerCase();
  
  // Family-friendly indicators
  const familyKeywords = [
    'çocuk', 'aile', 'masalı', 'disney', 'animasyon', 'sirk', 'sihirbaz',
    'puppet', 'çocuk tiyatrosu', 'family', 'kids'
  ];
  
  if (familyKeywords.some(keyword => 
    eventName?.includes(keyword) || genre?.includes(keyword)
  )) {
    return 'family_friendly';
  }
  
  // Late night events
  if (hour >= 22 || genre?.includes('club') || genre?.includes('party')) {
    return 'late_night';
  }
  
  // Weekend activities
  const dayOfWeek = eventDate.getDay();
  if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
    return 'weekend_activity';
  }
  
  // Default
  return 'social_evening';
}

/**
 * Determine atmosphere type
 */
function analyzeAtmosphereType(event: UniqueEvent, venue: CanonicalVenue): string {
  const genre = event.genre?.toLowerCase();
  const eventName = event.name?.toLowerCase();
  const venueName = venue.name?.toLowerCase();
  const capacity = venue.capacity;
  
  // Outdoor events
  const outdoorKeywords = ['festival', 'açık hava', 'outdoor', 'park', 'beach', 'sahil'];
  if (outdoorKeywords.some(keyword => 
    eventName?.includes(keyword) || venueName?.includes(keyword)
  )) {
    return 'acik_hava';
  }
  
  // Intimate/small venues
  if (capacity && capacity < 500) {
    return 'samimi';
  }
  
  // Calm/quiet events
  const calmKeywords = ['klasik', 'opera', 'bale', 'chamber', 'solo', 'acoustic'];
  if (calmKeywords.some(keyword => 
    genre?.includes(keyword) || eventName?.includes(keyword)
  )) {
    return 'sakin';
  }
  
  // Energetic events
  const energeticKeywords = ['rock', 'electronic', 'dance', 'hip-hop', 'rap', 'party'];
  if (energeticKeywords.some(keyword => 
    genre?.includes(keyword) || eventName?.includes(keyword)
  )) {
    return 'canli';
  }
  
  // Formal events
  const formalKeywords = ['gala', 'opera', 'classic', 'philharmonic', 'symphony'];
  if (formalKeywords.some(keyword => 
    eventName?.includes(keyword) || venueName?.includes(keyword)
  )) {
    return 'formal';
  }
  
  // Default
  return 'casual';
}

/**
 * Determine price positioning context
 */
function analyzePricePositioning(event: UniqueEvent, venue: CanonicalVenue): string {
  const venueName = venue.name?.toLowerCase();
  const eventName = event.name?.toLowerCase();
  const capacity = venue.capacity;
  
  // Premium venues/events
  const premiumVenues = [
    'zorlu center', 'trump towers', 'ritz carlton', 'four seasons',
    'cemal reşit rey', 'atatürk kültür merkezi', 'harbiye'
  ];
  
  const premiumKeywords = ['gala', 'premium', 'vip', 'exclusive', 'özel'];
  
  if (premiumVenues.some(name => venueName?.includes(name)) ||
      premiumKeywords.some(keyword => eventName?.includes(keyword))) {
    return 'premium';
  }
  
  // Budget-friendly indicators
  const budgetKeywords = ['ücretsiz', 'free', 'bedava', 'student', 'öğrenci'];
  if (budgetKeywords.some(keyword => eventName?.includes(keyword))) {
    return 'budget';
  }
  
  // University venues tend to be budget-friendly
  if (venueName?.includes('üniversitesi') || venueName?.includes('university')) {
    return 'budget';
  }
  
  // Large capacity venues tend to be more affordable
  if (capacity && capacity > 10000) {
    return 'orta_segment';
  }
  
  // Default middle segment
  return 'orta_segment';
}

/**
 * Helper functions for date-based cultural context
 */
function isRamadanPeriod(date: Date): boolean {
  // This is a simplified version. In production, you'd use proper Islamic calendar calculation
  // Ramadan dates change yearly according to Islamic calendar
  
  // 2025 approximate Ramadan: March 1 - March 30
  // 2026 approximate Ramadan: February 18 - March 19
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if (year === 2025) {
    return month === 3 && day <= 30;
  } else if (year === 2026) {
    return (month === 2 && day >= 18) || (month === 3 && day <= 19);
  }
  
  // For other years, return false (should implement proper Islamic calendar)
  return false;
}

function isEidPeriod(date: Date): boolean {
  // Simplified Eid detection
  // In production, calculate actual Eid dates
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Eid al-Fitr 2025 (approximate): March 31 - April 2
  // Eid al-Adha 2025 (approximate): June 7 - June 10
  
  if (year === 2025) {
    return (month === 3 && day >= 31) || 
           (month === 4 && day <= 2) ||
           (month === 6 && day >= 7 && day <= 10);
  }
  
  return false;
}

/**
 * Get cultural context explanation in Turkish
 */
export function getCulturalContextExplanation(context: TurkishCulturalContext): string {
  const explanations: string[] = [];
  
  // Temporal context
  switch (context.temporal_context) {
    case 'ramazan':
      explanations.push('Ramazan ayının manevi atmosferi');
      break;
    case 'bayram':
      explanations.push('Bayram coşkusu ve aile buluşmaları');
      break;
    case 'yaz_tatili':
      explanations.push('Yaz tatilinin keyifli atmosferi');
      break;
  }
  
  // Transport context
  switch (context.transport_context) {
    case 'metro_access':
      explanations.push('Metro ile kolay erişim');
      break;
    case 'parking_available':
      explanations.push('Araç park imkanı');
      break;
    case 'city_center':
      explanations.push('Şehir merkezi konumu');
      break;
  }
  
  // Social timing
  switch (context.social_timing) {
    case 'family_friendly':
      explanations.push('Aile dostu etkinlik');
      break;
    case 'late_night':
      explanations.push('Gece yaşamı deneyimi');
      break;
  }
  
  return explanations.join(', ');
}