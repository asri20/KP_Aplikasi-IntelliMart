/**
 * Landing Page - Pricing Plans
 * Konten dinamis untuk Pricing Section
 */

export const PRICING_PLANS = Object.freeze([
  {
    id: 'free',
    name: 'Gratis',
    tagline: 'Untuk pemula',
    price: 0,
    period: 'selamanya',
    description: 'Cocok untuk UMKM yang baru memulai bisnis',
    popular: false,
    features: [
      '1 Outlet',
      '1 Kasir aktif',
      'Transaksi unlimited',
      'Laporan dasar',
      'Mode offline',
      'Support email',
    ],
    limitations: [
      'Tanpa integrasi payment gateway',
      'Export data terbatas',
      'Tanpa prioritas support',
    ],
    cta: {
      label: 'Mulai Gratis',
      href: '/register?plan=free',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Paling populer',
    price: 199000,
    period: 'per bulan',
    description: 'Untuk UMKM yang ingin berkembang',
    popular: true,
    features: [
      'Hingga 5 Outlet',
      'Unlimited kasir',
      'Transaksi unlimited',
      'Laporan lengkap & export',
      'Mode offline',
      'Integrasi QRIS & payment gateway',
      'Manajemen karyawan',
      'Multi-pembayaran',
      'Support prioritas (chat)',
    ],
    limitations: [],
    cta: {
      label: 'Coba 30 Hari Gratis',
      href: '/register?plan=pro',
    },
    discount: {
      annual: '2 bulan gratis untuk pembayaran tahunan',
    },
  },
  {
    id: 'business',
    name: 'Bisnis',
    tagline: 'Untuk enterprise',
    price: 499000,
    period: 'per bulan',
    description: 'Solusi lengkap untuk bisnis skala besar',
    popular: false,
    features: [
      'Unlimited Outlet',
      'Unlimited kasir',
      'Transaksi unlimited',
      'Advanced analytics & forecasting',
      'Mode offline',
      'Semua integrasi payment',
      'Manajemen karyawan + shift',
      'Multi-pembayaran',
      'API akses',
      'Dedicated account manager',
      'Support prioritas 24/7 (phone + chat)',
      'Custom domain',
      'White-label (opsional)',
    ],
    limitations: [],
    cta: {
      label: 'Hubungi Sales',
      href: '/contact-sales',
    },
    discount: {
      annual: '3 bulan gratis untuk pembayaran tahunan',
    },
  },
]);

/**
 * Pricing FAQ
 */
export const PRICING_FAQ = Object.freeze([
  {
    question: 'Apakah ada biaya setup?',
    answer: 'Tidak ada biaya setup. Langsung aktif setelah registrasi.',
  },
  {
    question: 'Bisa upgrade/downgrade kapan saja?',
    answer: 'Ya, Anda bisa upgrade atau downgrade paket kapan saja.',
  },
  {
    question: 'Apakah data saya aman?',
    answer:
      'Sangat aman. Data dienkripsi dan backup otomatis setiap hari ke multiple server.',
  },
  {
    question: 'Apakah ada kontrak jangka panjang?',
    answer: 'Tidak ada. Anda bisa berhenti kapan saja tanpa penalti.',
  },
]);
