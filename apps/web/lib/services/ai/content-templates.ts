/**
 * Turkish Event Content Templates
 * Generates narrative-style content for events based on Turkish cultural context
 */

import type { 
  UniqueEvent, 
  CanonicalVenue, 
  TurkishCulturalContext,
  PlatformPrice 
} from '@/lib/types';

export interface EventContentContext {
  event: UniqueEvent;
  venue: CanonicalVenue;
  pricing?: {
    platform: string;
    prices: PlatformPrice[];
    min_price: number | null;
    max_price: number | null;
  }[];
  cultural_context?: TurkishCulturalContext;
}

/**
 * Main content generation function
 */
export function generateTurkishEventContent(context: EventContentContext): string {
  const { event, venue, pricing, cultural_context } = context;
  
  // Build narrative sections
  const sections: string[] = [];
  
  // Event introduction with cultural context
  sections.push(generateEventIntroduction(event, venue, cultural_context));
  
  // Venue and location narrative
  sections.push(generateVenueNarrative(venue, cultural_context));
  
  // Date and timing context
  sections.push(generateTimingNarrative(event, cultural_context));
  
  // Artist and genre information
  if (event.artist && event.artist.length > 0) {
    sections.push(generateArtistNarrative(event));
  }
  
  // Pricing and accessibility information
  if (pricing && pricing.length > 0) {
    sections.push(generatePricingNarrative(pricing, cultural_context));
  }
  
  // Platform availability
  if (event.providers && event.providers.length > 0) {
    sections.push(generatePlatformNarrative(event.providers));
  }
  
  // Cultural recommendations and context
  sections.push(generateCulturalRecommendations(event, venue, cultural_context));
  
  return sections.join(' ');
}

/**
 * Generate event introduction with Turkish cultural context
 */
function generateEventIntroduction(
  event: UniqueEvent, 
  venue: CanonicalVenue, 
  cultural_context?: TurkishCulturalContext
): string {
  const eventName = event.name;
  const city = venue.city;
  const genre = event.genre;
  
  // Determine cultural tone based on event type and context
  let introduction = `${eventName}`;
  
  // Add genre context in Turkish
  if (genre) {
    const genreContext = getGenreContext(genre);
    introduction += ` ${genreContext}`;
  }
  
  // Add location context with cultural significance
  introduction += ` ${city}'da`;
  
  // Add venue prestige or character
  if (venue.capacity && venue.capacity > 10000) {
    introduction += `, şehrin en büyük etkinlik mekanlarından ${venue.name}'de`;
  } else if (venue.capacity && venue.capacity < 500) {
    introduction += `, samimi atmosferiyle tanınan ${venue.name}'de`;
  } else {
    introduction += ` ${venue.name}'de`;
  }
  
  introduction += ' gerçekleşecek.';
  
  // Add cultural timing context
  if (cultural_context?.temporal_context) {
    introduction += ` ${getTemporalContext(cultural_context.temporal_context)}`;
  }
  
  return introduction;
}

/**
 * Generate venue-specific narrative with cultural context
 */
function generateVenueNarrative(
  venue: CanonicalVenue, 
  _cultural_context?: TurkishCulturalContext
): string {
  let narrative = '';
  
  // Venue capacity context
  if (venue.capacity) {
    if (venue.capacity > 20000) {
      narrative = 'Bu büyük kapasiteli etkinlik, binlerce kişiyle birlikte unutulmaz anlar yaşamanızı sağlayacak.';
    } else if (venue.capacity > 5000) {
      narrative = 'Orta ölçekli bu etkinlikte hem enerjik hem de rahat bir atmosfer sizi bekliyor.';
    } else if (venue.capacity < 1000) {
      narrative = 'Küçük ve samimi bu etkinlik, sanatçılarla yakın temas kurmanıza olanak tanıyor.';
    } else {
      narrative = 'İdeal kapasitedeki bu etkinlik, hem sosyal hem de keyifli bir deneyim sunuyor.';
    }
  }
  
  // Location and transport context
  if (_cultural_context?.transport_context) {
    narrative += ` ${getTransportContext(_cultural_context.transport_context, venue.city || undefined)}`;
  }
  
  return narrative;
}

/**
 * Generate timing narrative with Turkish cultural patterns
 */
function generateTimingNarrative(
  event: UniqueEvent, 
  _cultural_context?: TurkishCulturalContext
): string {
  const eventDate = new Date(event.date);
  const dayOfWeek = eventDate.getDay();
  const hour = eventDate.getHours();
  
  let narrative = '';
  
  // Day of week context
  if (dayOfWeek === 6 || dayOfWeek === 0) { // Weekend
    narrative = 'Hafta sonu eğlencesini doya doya yaşayabileceğiniz bu etkinlik, ';
  } else if (dayOfWeek === 5) { // Friday
    narrative = 'Hafta sonunu erken başlatmak isteyenler için mükemmel bir Cuma etkinliği, ';
  } else { // Weekday
    narrative = 'Hafta içi kendinize vakit ayırmak için ideal bir fırsat, ';
  }
  
  // Time of day context
  if (hour >= 20) {
    narrative += 'akşam saatlerinin enerjisiyle birleşecek.';
  } else if (hour >= 17) {
    narrative += 'iş çıkışı rahatlamanız için perfect bir zamanlama.';
  } else if (hour >= 14) {
    narrative += 'öğleden sonra keyifli bir zaman geçirmenizi sağlayacak.';
  } else {
    narrative += 'günün erken saatlerinde sakin bir deneyim sunacak.';
  }
  
  return narrative;
}

/**
 * Generate artist narrative with Turkish context
 */
function generateArtistNarrative(event: UniqueEvent): string {
  if (!event.artist || event.artist.length === 0) return '';
  
  const artists = event.artist;
  let narrative = '';
  
  if (artists.length === 1) {
    narrative = `${artists[0]} bu özel gecede sahne alacak.`;
  } else if (artists.length === 2) {
    narrative = `${artists[0]} ve ${artists[1]} bir araya gelerek muhteşem bir performans sergileyecek.`;
  } else {
    const firstTwo = artists.slice(0, 2).join(' ve ');
    const remaining = artists.length - 2;
    narrative = `${firstTwo} başta olmak üzere ${remaining} sanatçının yer alacağı zengin bir programa sahip.`;
  }
  
  return narrative;
}

/**
 * Generate pricing narrative with accessibility context
 */
function generatePricingNarrative(
  pricing: { platform: string; min_price: number | null; max_price: number | null }[],
  _cultural_context?: TurkishCulturalContext
): string {
  let narrative = '';
  
  // Find the best price range
  const allPrices = pricing.reduce((acc, p) => {
    if (p.min_price) acc.push(p.min_price);
    if (p.max_price) acc.push(p.max_price);
    return acc;
  }, [] as number[]);
  
  if (allPrices.length === 0) return 'Bilet fiyat bilgisi güncellenecek.';
  
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  
  // Price accessibility context
  if (minPrice < 100) {
    narrative = `${minPrice}₺'den başlayan uygun fiyatlı biletlerle herkesin katılabileceği bir etkinlik.`;
  } else if (minPrice < 300) {
    narrative = `${minPrice}₺ - ${maxPrice}₺ arası makul fiyatlarda biletlere sahip.`;
  } else {
    narrative = `${minPrice}₺'den başlayan premium deneyim için tasarlanmış bilet seçenekleri mevcut.`;
  }
  
  return narrative;
}

/**
 * Generate platform availability narrative
 */
function generatePlatformNarrative(providers: string[]): string {
  if (providers.length === 1) {
    return `Biletler ${providers[0]}'dan temin edilebilir.`;
  } else if (providers.length === 2) {
    return `Biletler ${providers[0]} ve ${providers[1]} üzerinden satın alınabilir.`;
  } else {
    return `${providers.slice(0, 2).join(', ')} ve ${providers.length - 2} platform daha dahil olmak üzere birçok seçenekten biletinizi alabilirsiniz.`;
  }
}

/**
 * Generate cultural recommendations
 */
function generateCulturalRecommendations(
  event: UniqueEvent,
  venue: CanonicalVenue,
  cultural_context?: TurkishCulturalContext
): string {
  let recommendations = '';
  
  // Social context recommendations
  if (cultural_context?.social_timing === 'family_friendly') {
    recommendations = 'Aile dostou bu etkinliğe çocuklarınızla birlikte katılabilirsiniz.';
  } else if (cultural_context?.social_timing === 'late_night') {
    recommendations = 'Gecenin geç saatlerine kadar sürecek bu eğlencede enerji dolu anlar yaşayacaksınız.';
  } else {
    recommendations = 'Arkadaşlarınızla birlikte katılabileceğiniz sosyal bir deneyim.';
  }
  
  // Add venue-specific cultural advice
  if (venue.city === 'Istanbul' || venue.city === 'İstanbul') {
    recommendations += ' İstanbul trafiğini hesaba katarak etkinlik başlamadan önce yola çıkmanız önerilir.';
  } else if (venue.city === 'Ankara') {
    recommendations += ' Ankara\'nın merkezi konumundan dolayı şehir içi ulaşım oldukça kolay.';
  } else if (venue.city === 'İzmir') {
    recommendations += ' İzmir\'in sıcak atmosferi etkinliğe ayrı bir renk katacak.';
  }
  
  return recommendations;
}

/**
 * Helper functions for context generation
 */
function getGenreContext(genre: string): string {
  const genreMap: Record<string, string> = {
    'Music': 'müzik etkinliği',
    'Concert': 'konser',
    'Theater': 'tiyatro oyunu', 
    'Comedy': 'komedi gösterisi',
    'Dance': 'dans gösterisi',
    'Exhibition': 'sergi',
    'Festival': 'festival',
    'Sports': 'spor etkinliği'
  };
  
  return genreMap[genre] || 'etkinliği';
}

function getTemporalContext(temporal: string): string {
  const contextMap: Record<string, string> = {
    'ramazan': 'Ramazan ayının özel atmosferinde',
    'bayram': 'Bayram coşkusunun yaşandığı bu dönemde',
    'yaz_tatili': 'Yaz tatilinin keyfini çıkaracağınız',
    'kis_tatili': 'Kış tatilinin sıcak atmosferinde'
  };
  
  return contextMap[temporal] || '';
}

function getTransportContext(transport: string, _city?: string): string {
  if (transport === 'metro_access') {
    return 'Metro ile kolayca ulaşabileceğiniz konumda.';
  } else if (transport === 'city_center') {
    return 'Şehir merkezindeki konum sayesinde her yerden kolay erişim.';
  } else if (transport === 'parking_available') {
    return 'Otopark imkanı bulunan mekanda araçla gelmeniz de mümkün.';
  }
  
  return '';
}

/**
 * Generate content for different event types with cultural optimization
 */
export function generateEventTypeContent(
  eventType: 'music' | 'theater' | 'comedy' | 'sports' | 'exhibition',
  context: EventContentContext
): string {
  const baseContent = generateTurkishEventContent(context);
  
  // Add type-specific cultural context
  const typeSpecificContent = getTypeSpecificContent(eventType, context);
  
  return `${baseContent} ${typeSpecificContent}`;
}

function getTypeSpecificContent(
  eventType: string, 
  _context: EventContentContext
): string {
  
  switch (eventType) {
    case 'music':
      return 'Müzikseverlerin buluşma noktası olan bu konserde, kaliteli ses sistemi ve profesyonel sahne düzeni ile unutulmaz bir deneyim yaşayacaksınız.';
    
    case 'theater':
      return 'Tiyatro sanatının büyüsüne kapılacağınız bu oyunda, yetenekli oyuncular ve etkileyici dekorlarla dolu bir gece sizi bekliyor.';
    
    case 'comedy':
      return 'Gülmekten karnınız ağrıyacak bu komedi gecesinde, stresinizi atacak ve keyifli vakit geçireceksiniz.';
    
    case 'sports':
      return 'Spor tutkunlarının heyecanla beklediği bu müsabakada, adrenalin dolu anlar ve unutulmaz atmosfer sizi karşılayacak.';
    
    case 'exhibition':
      return 'Sanat ve kültür meraklılarının ilgisini çekecek bu sergide, düşünce ufkunuzu genişletecek eserlerle karşılaşacaksınız.';
    
    default:
      return 'Bu özel etkinlikte kendinizi şımartacak ve güzel anılar biriktirecesiniz.';
  }
}