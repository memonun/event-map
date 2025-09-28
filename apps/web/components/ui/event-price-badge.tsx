'use client';

import React, { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { ClientPricesService } from '@/lib/services/client/prices';

interface EventPriceBadgeProps {
  eventId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EventPriceBadge({ eventId, className = '', size = 'sm' }: EventPriceBadgeProps) {
  const [priceData, setPriceData] = useState<{
    loading: boolean;
    minPrice: number | null;
    maxPrice: number | null;
    priceRange: string;
    hasData: boolean;
  }>({
    loading: true,
    minPrice: null,
    maxPrice: null,
    priceRange: 'Yükleniyor...',
    hasData: false
  });

  useEffect(() => {
    let mounted = true;

    const loadPrice = async () => {
      try {
        const minPrice = await ClientPricesService.getEventMinPrice(eventId);

        if (!mounted) return;

        if (minPrice !== null) {
          const prices = await ClientPricesService.getEventPrices(eventId);

          if (!mounted) return;

          if (prices.length > 0) {
            const allMinPrices = prices.map(p => p.minPrice).filter(p => p > 0);
            const allMaxPrices = prices.map(p => p.maxPrice).filter(p => p > 0);

            const finalMinPrice = Math.min(...allMinPrices);
            const finalMaxPrice = Math.max(...allMaxPrices);

            setPriceData({
              loading: false,
              minPrice: finalMinPrice,
              maxPrice: finalMaxPrice,
              priceRange: finalMinPrice === finalMaxPrice
                ? ClientPricesService.formatPrice(finalMinPrice)
                : ClientPricesService.formatPriceRange(finalMinPrice, finalMaxPrice),
              hasData: true
            });
          } else {
            setPriceData({
              loading: false,
              minPrice: null,
              maxPrice: null,
              priceRange: 'Fiyat bilgisi yok',
              hasData: false
            });
          }
        } else {
          setPriceData({
            loading: false,
            minPrice: null,
            maxPrice: null,
            priceRange: 'Fiyat bilgisi yok',
            hasData: false
          });
        }
      } catch (error) {
        if (!mounted) return;

        console.error('Error loading price for event:', eventId, error);
        setPriceData({
          loading: false,
          minPrice: null,
          maxPrice: null,
          priceRange: 'Fiyat bilgisi yok',
          hasData: false
        });
      }
    };

    loadPrice();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (priceData.loading) {
    return (
      <div className={`inline-flex items-center gap-1 bg-gray-100 text-gray-600 rounded-full ${sizeClasses[size]} ${className}`}>
        <div className={`${iconSizes[size]} border border-gray-400 border-t-transparent rounded-full animate-spin`} />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (!priceData.hasData) {
    return (
      <div className={`inline-flex items-center gap-1 bg-gray-100 text-gray-500 rounded-full ${sizeClasses[size]} ${className}`}>
        <Ticket className={iconSizes[size]} />
        <span>Fiyat bilgisi yok</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
      <Ticket className={iconSizes[size]} />
      <span>{priceData.priceRange}</span>
    </div>
  );
}