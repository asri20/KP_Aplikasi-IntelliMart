/**
 * Landing Page - Navigation Links
 */

export const NAVIGATION_LINKS = Object.freeze([
  {
    id: 'features',
    label: 'Fitur',
    href: '#features',
  },
  {
    id: 'pricing',
    label: 'Harga',
    href: '#pricing',
  },
  {
    id: 'contact',
    label: 'Kontak',
    href: '#contact',
  },
]);

/**
 * CTA Links untuk Navbar
 */
export const CTA_LINKS = Object.freeze({
  login: {
    label: 'Masuk',
    href: '/login',
  },
  register: {
    label: 'Daftar Gratis',
    href: '/register',
  },
});

/**
 * Footer Links
 */
export const FOOTER_LINKS = Object.freeze({
  product: [
    { label: 'Fitur', href: '#features' },
    { label: 'Harga', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
    { label: 'Integrasi', href: '#integrations' },
  ],
  company: [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Karir', href: '/careers' },
    { label: 'Kontak', href: '/contact' },
  ],
  support: [
    { label: 'Bantuan', href: '/help' },
    { label: 'Tutorial', href: '/tutorial' },
    { label: 'API Docs', href: '/docs' },
    { label: 'Status', href: '/status' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/security' },
  ],
});

/**
 * Social Media Links
 */
export const SOCIAL_LINKS = Object.freeze([
  {
    name: 'Facebook',
    href: 'https://facebook.com/intelimart',
    icon: 'facebook',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/intelimart',
    icon: 'twitter',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/intelimart',
    icon: 'instagram',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/intelimart',
    icon: 'linkedin',
  },
]);

/**
 * Contact Information
 */
export const CONTACT_INFO = Object.freeze({
  email: 'hello@intelimart.com',
  phone: '+62 812-3456-7890',
  address: 'Jakarta, Indonesia',
});
