import { env } from '@core/config/env';

/**
 * Validate API response with Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema
 * @param {*} data - Data to validate
 * @returns {Object} Validation result
 * 
 * @example
 * const result = validateResponse(featuresSchema, apiData);
 * if (!result.success) {
 *   console.error('Validation errors:', result.errors);
 * }
 */
export function validateResponse(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Log validation errors in development
    if (env.isDevelopment) {
      console.error('Schema validation failed:', {
        errors: result.error.errors,
        data,
      });
    }

    return {
      success: false,
      errors: result.error.errors,
      data: null,
    };
  }

  return {
    success: true,
    errors: null,
    data: result.data,
  };
}

/**
 * Assert response matches schema (throws on failure)
 * @param {import('zod').ZodSchema} schema - Zod schema
 * @param {*} data - Data to validate
 * @returns {*} Validated data
 * @throws {Error} If validation fails
 */
export function assertValidResponse(schema, data) {
  const result = validateResponse(schema, data);
  
  if (!result.success) {
    throw new Error(
      `Response validation failed: ${JSON.stringify(result.errors)}`
    );
  }
  
  return result.data;
}
