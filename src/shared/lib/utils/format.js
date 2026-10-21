/**
 * Format utilities
 * Helper functions untuk formatting data
 */

/**
 * Format number ke currency IDR
 * @param {number} value - Nilai yang akan diformat
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number dengan thousand separator
 * @param {number} value - Nilai yang akan diformat
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Format date ke format Indonesia
 * @param {Date|string} date - Date object atau ISO string
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date
 */
export function formatDate(date, includeTime = false) {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('id-ID', options).format(d);
}

/**
 * Truncate text dengan ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)  }...`;
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
