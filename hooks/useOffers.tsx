import { useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys, slowQueryOptions } from '@/lib/cache';

export interface Offer {
  id: string;
  type: 'offer';
  badge: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  validFrom?: string;
  icon: React.ReactNode;
  image: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
}

export interface OfferGalleryItem {
  id: string;
  type: "image" | "video" | "reel";
  contentType: "offer";
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  validFrom?: string;
  validTo?: string;
}

export interface ServiceWithOffers {
  id: string;
  name: string;
  business_name?: string;
  gallery: OfferGalleryItem[];
}

/**
 * Check if an offer is currently valid based on its date range
 */
const isOfferValid = (validFrom?: string, validTo?: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  // If no dates are set, consider the offer as always valid
  if (!validFrom && !validTo) {
    return true;
  }
  
  // Check start date
  if (validFrom) {
    const startDate = new Date(validFrom);
    startDate.setHours(0, 0, 0, 0);
    if (today < startDate) {
      return false; // Offer hasn't started yet
    }
  }
  
  // Check end date
  if (validTo) {
    const endDate = new Date(validTo);
    endDate.setHours(23, 59, 59, 999); // End of day
    if (today > endDate) {
      return false; // Offer has expired
    }
  }
  
  return true;
};

/**
 * Extract valid offers from services gallery data
 */
const extractValidOffers = (services: ServiceWithOffers[]): Offer[] => {
  const offers: Offer[] = [];
  
  services.forEach(service => {
    if (!service.gallery || !Array.isArray(service.gallery)) {
      return;
    }
    
    service.gallery.forEach(item => {
      // Only process items with contentType "offer"
      if (item.contentType !== 'offer') {
        return;
      }
      
      // Check if offer is currently valid
      if (!isOfferValid(item.validFrom, item.validTo)) {
        return;
      }
      
      // Create offer object
      const offer: Offer = {
        id: `${service.id}-${item.id}`,
        type: 'offer',
        badge: 'Special Offer',
        title: item.title || 'Special Offer',
        description: item.description || 'Limited time offer available now!',
        discount: 'Special Deal', // Could be extracted from title/description
        validUntil: item.validTo 
          ? new Date(item.validTo).toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric", 
              year: "numeric" 
            })
          : 'Limited Time',
        validFrom: item.validFrom,
        icon: <Tag className="h-6 w-6" />, // Offer icon
        image: item.url || '/placeholder-offer.jpg',
        serviceId: service.id,
        serviceName: service.name,
        providerName: service.business_name || 'Verified Provider'
      };
      
      offers.push(offer);
    });
  });
  
  return offers;
};

export const useOffers = () => {
  // Use TanStack Query so the result is cached and shared with other
  // components that call usePublicServices — no duplicate API calls.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.public.services(),
    queryFn: async () => {
      const response = await apiClient.get<ServiceWithOffers[]>(API_ENDPOINTS.SERVICES.SEARCH);
      if (response.status === 'success' && response.data) {
        return response.data;
      }
      return [];
    },
    // Offers are derived from service gallery — slow-changing content.
    ...slowQueryOptions,
    select: (services) => extractValidOffers(services),
  });

  return {
    offers: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

/**
 * Utility function to check if a specific offer is valid (for external use)
 */
export const checkOfferValidity = (validFrom?: string, validTo?: string): boolean => {
  return isOfferValid(validFrom, validTo);
};

/**
 * Utility function to get offer status text
 */
export const getOfferStatus = (validFrom?: string, validTo?: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!validFrom && !validTo) {
    return 'Always Available';
  }
  
  if (validFrom) {
    const startDate = new Date(validFrom);
    startDate.setHours(0, 0, 0, 0);
    if (today < startDate) {
      return `Starts ${startDate.toLocaleDateString()}`;
    }
  }
  
  if (validTo) {
    const endDate = new Date(validTo);
    endDate.setHours(23, 59, 59, 999);
    if (today > endDate) {
      return 'Expired';
    }
    return `Until ${endDate.toLocaleDateString()}`;
  }
  
  return 'Active';
};