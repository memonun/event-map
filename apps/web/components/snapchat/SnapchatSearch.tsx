'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Music } from 'lucide-react';
import type { EventSearchParams } from '@/lib/types';

interface SnapchatSearchProps {
  onFiltersChange: (filters: EventSearchParams) => void;
  initialFilters?: EventSearchParams;
}

interface FilterChip {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  active: boolean;
}

export function SnapchatSearch({ onFiltersChange, initialFilters = {} }: SnapchatSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState<EventSearchParams>(initialFilters);

  const filterChips: FilterChip[] = [
    {
      id: 'concerts',
      label: 'Concerts',
      icon: Music,
      color: 'bg-purple-500',
      active: filters.genre === 'concert'
    },
    {
      id: 'theatre',
      label: 'Theatre',
      icon: Calendar,
      color: 'bg-red-500',
      active: filters.genre === 'theatre'
    },
    {
      id: 'nearby',
      label: 'Nearby',
      icon: MapPin,
      color: 'bg-blue-500',
      active: !!filters.radius
    }
  ];

  const cities = ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa'];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters = { ...filters, search: searchQuery };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, onFiltersChange]);

  const handleFilterChipToggle = (chipId: string) => {
    let newFilters = { ...filters };

    switch (chipId) {
      case 'concerts':
        newFilters.genre = newFilters.genre === 'concert' ? undefined : 'concert';
        break;
      case 'theatre':
        newFilters.genre = newFilters.genre === 'theatre' ? undefined : 'theatre';
        break;
      case 'nearby':
        newFilters.radius = newFilters.radius ? undefined : 10000; // 10km
        break;
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCityFilter = (city: string) => {
    const newFilters = { ...filters, city: filters.city === city ? undefined : city };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    setIsFilterMenuOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 overflow-hidden">
          <div className="flex-1 flex items-center">
            <Search className="w-5 h-5 text-gray-400 ml-4" />
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`m-1 p-2 rounded-full transition-colors ${
              isFilterMenuOpen ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Dropdown */}
        {isFilterMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 z-30">
            <div className="space-y-4">
              {/* City Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cities</h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCityFilter(city)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.city === city
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">When</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newFilters = {
                        ...filters,
                        dateRange: filters.dateRange === 'today' ? undefined : 'today'
                      };
                      setFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.dateRange === 'today'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const newFilters = {
                        ...filters,
                        dateRange: filters.dateRange === 'week' ? undefined : 'week'
                      };
                      setFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.dateRange === 'week'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => handleFilterChipToggle(chip.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                chip.active
                  ? `${chip.color} text-white scale-105 shadow-md`
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:scale-105'
              }`}
            >
              <Icon className="w-4 h-4" />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Overlay to close filter menu */}
      {isFilterMenuOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsFilterMenuOpen(false)}
        />
      )}
    </div>
  );
}