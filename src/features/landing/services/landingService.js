import { validateResponse } from '@shared/lib/api/validator';

import { env } from '@core/config/env';

import { FEATURES_DATA } from '../constants/features';
import { PRICING_PLANS } from '../constants/pricing';
import { featuresSchema, pricingPlansSchema } from '../schemas/landingSchema';

/**
 * Delay helper untuk simulasi network latency
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Landing Service
 * Mock data service untuk landing page
 * Akan diganti dengan real API call di production
 */

/**
 * @typedef {import('../schemas/landingSchema').featureSchema} Feature
 * @typedef {import('../schemas/landingSchema').pricingPlanSchema} PricingPlan
 */

/**
 * Fetch features data
 * @returns {Promise<Feature[]>}
 */
export async function fetchFeatures() {
  // Simulasi network delay jika mock API enabled
  if (env.enableMockApi) {
    await delay(800);
  }

  // Mock data
  const mockData = FEATURES_DATA;

  // Validate response dengan Zod
  const validation = validateResponse(featuresSchema, mockData);

  if (!validation.success) {
    throw new Error('Invalid features data structure');
  }

  return validation.data;
}

/**
 * Fetch pricing plans data
 * @returns {Promise<PricingPlan[]>}
 */
export async function fetchPricingPlans() {
  // Simulasi network delay jika mock API enabled
  if (env.enableMockApi) {
    await delay(600);
  }

  // Mock data
  const mockData = PRICING_PLANS;

  // Validate response dengan Zod
  const validation = validateResponse(pricingPlansSchema, mockData);

  if (!validation.success) {
    throw new Error('Invalid pricing data structure');
  }

  return validation.data;
}

/**
 * Submit contact form
 * @param {Object} formData - Form data
 * @param {string} formData.name - Name
 * @param {string} formData.email - Email
 * @param {string} formData.message - Message
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitContactForm(formData) {
  // Simulasi network delay
  if (env.enableMockApi) {
    await delay(1000);
  }

  // Mock success response
  return {
    success: true,
    message: `Terima kasih ${formData.name}! Kami akan segera menghubungi Anda.`,
  };
}
