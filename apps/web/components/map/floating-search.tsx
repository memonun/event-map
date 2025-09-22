'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientEventsService } from '@/lib/services/client';
import type { EventSearchParams } from '@/lib/types';

interface FloatingSearchProps {
  onFiltersChange: (filters: EventSearchParams) => void;
  initialFilters: EventSearchParams;
  onSearchExecuted?: (hasQuery: boolean) => void; // Callback for when search is executed
}

export function FloatingSearch({ onFiltersChange, initialFilters, onSearchExecuted }: FloatingSearchProps) {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [availableGenres, setAvailableGenres] = useState<{ genre: string; count: number }[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Execute search immediately (for Enter key or search button)
  const executeSearch = useCallback((searchQuery: string = query) => {
    setIsSearching(true);
    const newFilters = { ...activeFilters, query: searchQuery || undefined };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Trigger search executed callback to auto-open panel
    const hasQuery = Boolean(searchQuery?.trim());
    onSearchExecuted?.(hasQuery);
    
    if (hasQuery) {
      console.log('Search executed:', searchQuery);
    }
    
    // Clear searching state after a brief delay
    setTimeout(() => setIsSearching(false), 500);
  }, [query, activeFilters, onFiltersChange, onSearchExecuted]);

  // Handle search input with debouncing
  const handleSearchInput = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      executeSearch(searchQuery);
    }, 300); // 300ms debounce delay
  }, [executeSearch]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Clear debounce timeout and execute search immediately
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      executeSearch();
    }
  }, [executeSearch]);

  // Toggle filters panel
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    const emptyFilters: EventSearchParams = {};
    setQuery('');
    setActiveFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setShowFilters(false);
    setIsSearching(false);
  }, [onFiltersChange]);

  // Load available genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      setGenresLoading(true);
      try {
        const genres = await ClientEventsService.getAvailableGenres();
        setAvailableGenres(genres);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setGenresLoading(false);
      }
    };

    loadGenres();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const hasActiveFilters = query || activeFilters.genre || activeFilters.city || activeFilters.date_from;

  return (
    <div className="w-full max-w-2xl">
      {/* Main Search Bar */}
      <div className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center px-6 py-4">
          {isSearching ? (
            <div className="w-5 h-5 mr-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400 mr-3" />
          )}
          
          <input
            type="text"
            placeholder="Etkinlik, sanatçı veya mekan ara... (Enter'a basın)"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none text-sm font-medium"
          />

          <div className="flex items-center gap-2 ml-4">
            {/* Filters Button */}
            <Button
              variant={showFilters ? "default" : "ghost"}
              size="sm"
              onClick={toggleFilters}
              className={`rounded-full ${showFilters ? 'bg-red-500 text-white hover:bg-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtreler
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="rounded-full text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Chips - Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 px-2">
          {query && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              &quot;{query}&quot;
              <button onClick={() => executeSearch('')} className="ml-1 hover:bg-red-600 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {activeFilters.genre && (
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              {activeFilters.genre}
              <button onClick={() => {
                const newFilters = { ...activeFilters };
                delete newFilters.genre;
                setActiveFilters(newFilters);
                onFiltersChange(newFilters);
              }} className="ml-1 hover:bg-orange-600 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {activeFilters.city && (
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              {activeFilters.city}
              <button onClick={() => {
                const newFilters = { ...activeFilters };
                delete newFilters.city;
                setActiveFilters(newFilters);
                onFiltersChange(newFilters);
              }} className="ml-1 hover:bg-blue-600 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="mt-4 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
              <select
                value={activeFilters.city || ''}
                onChange={(e) => {
                  const newFilters = { ...activeFilters, city: e.target.value || undefined };
                  setActiveFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Tüm şehirler</option>
                <option value="İstanbul">İstanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="İzmir">İzmir</option>
                <option value="Bursa">Bursa</option>
                <option value="Antalya">Antalya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={activeFilters.genre || ''}
                onChange={(e) => {
                  const newFilters = { ...activeFilters, genre: e.target.value || undefined };
                  setActiveFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                disabled={genresLoading}
              >
                <option value="">
                  {genresLoading ? 'Kategoriler yükleniyor...' : 'Tüm kategoriler'}
                </option>
                {availableGenres.map(({ genre, count }) => (
                  <option key={genre} value={genre === 'Uncategorized' ? '__uncategorized__' : genre}>
                    {genre === 'Uncategorized' ? 'Kategori belirtilmemiş' : genre} ({count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
              <input
                type="date"
                value={activeFilters.date_from || ''}
                onChange={(e) => {
                  const newFilters = { ...activeFilters, date_from: e.target.value || undefined };
                  setActiveFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}