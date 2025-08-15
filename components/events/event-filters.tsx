'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Music, Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { EventsService, VenuesService } from '@/lib/services';
import type { EventSearchParams } from '@/lib/types';
import { format } from 'date-fns';

interface EventFiltersProps {
  onFiltersChange: (filters: EventSearchParams) => void;
  initialFilters?: EventSearchParams;
  className?: string;
}

interface FilterOptions {
  genres: { genre: string; count: number }[];
  cities: { city: string; venue_count: number }[];
  platforms: string[];
}

export function EventFilters({ 
  onFiltersChange, 
  initialFilters = {},
  className = "" 
}: EventFiltersProps) {
  const [filters, setFilters] = useState<EventSearchParams>(initialFilters);
  const [options, setOptions] = useState<FilterOptions>({
    genres: [],
    cities: [],
    platforms: ['bubilet', 'biletix', 'biletinial', 'passo', 'bugece']
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');

  // Load filter options
  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const [genres, cities] = await Promise.all([
        EventsService.getPopularGenres(30),
        VenuesService.getCitiesWithVenues()
      ]);
      
      setOptions({
        genres,
        cities,
        platforms: ['bubilet', 'biletix', 'biletinial', 'passo', 'bugece']
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EventSearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    updateFilters({ query: query || undefined });
  }, [updateFilters]);

  // Handle date range
  const handleDateChange = useCallback((field: 'date_from' | 'date_to', value: string) => {
    updateFilters({ [field]: value || undefined });
  }, [updateFilters]);

  // Handle genre selection
  const handleGenreToggle = useCallback((genre: string) => {
    const currentGenre = filters.genre;
    updateFilters({ 
      genre: currentGenre === genre ? undefined : genre 
    });
  }, [filters.genre, updateFilters]);

  // Handle city selection
  const handleCityToggle = useCallback((city: string) => {
    const currentCity = filters.city;
    updateFilters({ 
      city: currentCity === city ? undefined : city 
    });
  }, [filters.city, updateFilters]);

  // Handle platform selection
  const handlePlatformToggle = useCallback((platform: string) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    updateFilters({ 
      platforms: newPlatforms.length > 0 ? newPlatforms : undefined 
    });
  }, [filters.platforms, updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof EventSearchParams];
    return value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Etkinlik, sanatçı veya mekan ara..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-2">
            <Label htmlFor="date-from" className="text-sm text-gray-600">
              Başlangıç:
            </Label>
            <Input
              id="date-from"
              type="date"
              value={filters.date_from ? format(new Date(filters.date_from), 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateChange('date_from', e.target.value)}
              className="w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="date-to" className="text-sm text-gray-600">
              Bitiş:
            </Label>
            <Input
              id="date-to"
              type="date"
              value={filters.date_to ? format(new Date(filters.date_to), 'yyyy-MM-dd') : ''}
              onChange={(e) => handleDateChange('date_to', e.target.value)}
              className="w-36"
            />
          </div>
        </div>

        {/* Genre Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Music className="w-4 h-4" />
              Kategori
              {filters.genre && (
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
            <DropdownMenuLabel>Etkinlik Kategorileri</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loading ? (
              <div className="p-2 text-sm text-gray-500">Yükleniyor...</div>
            ) : (
              options.genres.map((genre) => (
                <DropdownMenuCheckboxItem
                  key={genre.genre}
                  checked={filters.genre === genre.genre}
                  onCheckedChange={() => handleGenreToggle(genre.genre)}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{genre.genre}</span>
                    <span className="text-xs text-gray-500">{genre.count}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* City Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <MapPin className="w-4 h-4" />
              Şehir
              {filters.city && (
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
            <DropdownMenuLabel>Şehirler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loading ? (
              <div className="p-2 text-sm text-gray-500">Yükleniyor...</div>
            ) : (
              options.cities.map((city) => (
                <DropdownMenuCheckboxItem
                  key={city.city}
                  checked={filters.city === city.city}
                  onCheckedChange={() => handleCityToggle(city.city)}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{city.city}</span>
                    <span className="text-xs text-gray-500">{city.venue_count}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Platform Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Platform
              {filters.platforms && filters.platforms.length > 0 && (
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {filters.platforms.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Bilet Platformları</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {options.platforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={filters.platforms?.includes(platform) || false}
                onCheckedChange={() => handlePlatformToggle(platform)}
              >
                <span className="capitalize">{platform}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-gray-600 hover:text-red-600"
          >
            <X className="w-4 h-4" />
            Temizle ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Search className="w-3 h-3" />
              <span>"{filters.query}"</span>
              <button
                onClick={() => handleSearch('')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {filters.genre && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <Music className="w-3 h-3" />
              <span>{filters.genre}</span>
              <button
                onClick={() => handleGenreToggle(filters.genre!)}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {filters.city && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <MapPin className="w-3 h-3" />
              <span>{filters.city}</span>
              <button
                onClick={() => handleCityToggle(filters.city!)}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {filters.platforms && filters.platforms.map((platform) => (
            <div key={platform} className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              <span className="capitalize">{platform}</span>
              <button
                onClick={() => handlePlatformToggle(platform)}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}