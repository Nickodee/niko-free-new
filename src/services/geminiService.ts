/**
 * AI Service
 * Handles AI content generation using Azure OpenAI via backend API
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export interface GenerateEventDescriptionParams {
  eventName: string;
  categories?: string[];
  interests?: string[];
  locationType?: 'physical' | 'online' | 'hybrid';
  locationName?: string;
  startDate?: string;
  startTime?: string;
}

export interface GeneratePartnerDescriptionParams {
  businessName: string;
  category?: string;
  location?: string;
  interests?: string[];
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('partner_token') || localStorage.getItem('access_token');
  return token;
};

/**
 * Generate event description using Azure OpenAI via backend API
 * Note: This endpoint is public and doesn't require authentication
 */
export const generateEventDescription = async (
  params: GenerateEventDescriptionParams
): Promise<string> => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available (for logged-in partners), but not required
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.generateEventDescription}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventName: params.eventName,
        categories: params.categories,
        interests: params.interests,
        locationType: params.locationType,
        locationName: params.locationName,
        startDate: params.startDate,
        startTime: params.startTime,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText || 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use statusText
      }
      throw new Error(`Failed to generate event description: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (data.description) {
      return data.description.trim();
    }

    throw new Error('No description received from server');
  } catch (error) {
    console.error('Error generating event description:', error);
    throw error;
  }
};

/**
 * Generate partner business description using Azure OpenAI via backend API
 * Note: This endpoint is public and doesn't require authentication (for partner applications)
 */
export const generatePartnerDescription = async (
  params: GeneratePartnerDescriptionParams
): Promise<string> => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available (for logged-in partners), but not required
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.generatePartnerDescription}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        businessName: params.businessName,
        category: params.category,
        location: params.location,
        interests: params.interests,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText || 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use statusText
      }
      throw new Error(`Failed to generate partner description: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (data.description) {
      return data.description.trim();
    }

    throw new Error('No description received from server');
  } catch (error) {
    console.error('Error generating partner description:', error);
    throw error;
  }
};

