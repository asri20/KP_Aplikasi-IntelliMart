import { z } from 'zod';

/**
 * Feature Schema
 */
export const featureSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  highlight: z.string().optional(),
});

/**
 * Features List Schema
 */
export const featuresSchema = z.array(featureSchema);

/**
 * Pricing Plan Schema
 */
export const pricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  price: z.number(),
  period: z.string(),
  description: z.string(),
  popular: z.boolean(),
  features: z.array(z.string()),
  limitations: z.array(z.string()),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  discount: z
    .object({
      annual: z.string(),
    })
    .optional(),
});

/**
 * Pricing Plans Schema
 */
export const pricingPlansSchema = z.array(pricingPlanSchema);
