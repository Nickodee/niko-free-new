/**
 * Payment Service
 * Handles ticket booking and M-Pesa payment integration
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getAuthHeaders as getAuthHeadersFromAuth, removeToken } from './authService';

/**
 * Book tickets for an event
 */
export const bookTicket = async (data: {
  event_id: number;
  ticket_type_id?: number; // Optional for free events
  quantity: number;
  promo_code?: string;
}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tickets.book}`, {
    method: 'POST',
    headers: getAuthHeadersFromAuth(),
    body: JSON.stringify(data),
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear invalid token
    removeToken();
    const result = await response.json().catch(() => ({}));
    throw new Error(result.msg || result.error || 'Your session has expired. Please log in again to continue booking.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.msg || 'Failed to book ticket');
  }

  return result;
};

/**
 * Initiate M-Pesa STK Push payment
 */
export const initiatePayment = async (data: {
  booking_id: number;
  phone_number: string;
}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.payments.initiate}`, {
    method: 'POST',
    headers: getAuthHeadersFromAuth(),
    body: JSON.stringify(data),
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    removeToken();
    const result = await response.json().catch(() => ({}));
    throw new Error(result.msg || result.error || 'Your session has expired. Please log in again.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.msg || 'Failed to initiate payment');
  }

  return result;
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (paymentId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.payments.status(paymentId)}`, {
    method: 'GET',
    headers: getAuthHeadersFromAuth(),
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    removeToken();
    const result = await response.json().catch(() => ({}));
    throw new Error(result.msg || result.error || 'Your session has expired. Please log in again.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.msg || 'Failed to check payment status');
  }

  return result;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.payments.history}`, {
    method: 'GET',
    headers: getAuthHeadersFromAuth(),
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    removeToken();
    const result = await response.json().catch(() => ({}));
    throw new Error(result.msg || result.error || 'Your session has expired. Please log in again.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.msg || 'Failed to fetch payment history');
  }

  return result;
};

