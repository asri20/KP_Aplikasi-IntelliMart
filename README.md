# 🛒 InteliMart — Template React Multi-POS

> **Solusi Point of Sale Modern untuk UMKM Indonesia**
> Multi-Tenant · Multi-Outlet · Offline-First · Real-Time Reports

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Filosofi & Standar Ahli](#️-filosofi--standar-ahli)
- [Quick Start](#-quick-start)
- [Struktur Proyek](#-struktur-proyek)
- [Dokumentasi Standar](#-dokumentasi-standar)
  - [1. Semantic HTML](#1-semantic-html--html5-spec)
  - [2. Atomic Design](#2-atomic-design--brad-frost)
  - [3. CUBE CSS](#3-cube-css--andy-bell)
  - [4. JS Design Patterns](#4-js-design-patterns--addy-osmani)
  - [5. UX States](#5-ux-states--vitaly-friedman)
  - [6. Inclusive Components](#6-inclusive-components--heydon-pickering)
  - [7. WAI-ARIA](#7-wai-aria--scott-ohara--steve-faulkner)
- [Konvensi Kode](#-konvensi-kode)
- [Roadmap](#️-roadmap)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang Proyek

**InteliMart** adalah template React JS profesional untuk membangun aplikasi Point of Sale (POS) multi-tenant dan multi-outlet. Dirancang khusus untuk UMKM Indonesia dengan fokus pada **kemudahan penggunaan**, **performa**, dan **aksesibilitas**.

### Fitur Utama

- ✅ **Multi-Tenant & Multi-Outlet** — Kelola banyak bisnis dan cabang dalam satu platform
- ✅ **Offline-First** — Tetap bisa transaksi tanpa internet
- ✅ **Real-Time Dashboard** — Laporan penjualan dan stok secara real-time
- ✅ **Dark Mode Native** — Dukungan penuh tema gelap via semantic tokens
- ✅ **Responsive Design** — Optimasi untuk desktop, tablet, dan mobile
- ✅ **Accessibility (WCAG AA)** — Dapat digunakan oleh semua orang
- ✅ **Type-Safe Runtime** — Validasi Zod + PropTypes + JSDoc IntelliSense
- ✅ **Production Ready** — ESLint, Prettier, Husky pre-commit hooks

### Stack Teknologi

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **UI** | React | 18.3 | Component library |
| **Build** | Vite | 5.4 | Dev server & bundler |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **State** | Zustand | 4.5 | Lightweight global state |
| **Data** | TanStack React Query | 5.56 | Server state & caching |
| **Form** | React Hook Form | 7.53 | Performant forms |
| **Validasi** | Zod | 3.23 | Runtime type checking |
| **HTTP** | Axios | 1.7 | API requests + interceptors |
| **Routing** | React Router | 6.26 | Client-side routing |
| **Type Safety** | PropTypes + JSDoc | — | Runtime checks + IDE hints |

---

## 🏛️ Filosofi & Standar Ahli

InteliMart dibangun dengan menerapkan **7 standar ahli frontend** yang saling melengkapi:

| # | Standar | Ahli | Lapisan | Fokus |
|---|---------|------|---------|-------|
| 1 | **Semantic HTML** | HTML5 Spec | Struktur | Aksesibilitas & SEO |
| 2 | **Atomic Design** | Brad Frost | Komponen | Reusability & Scalability |
| 3 | **CUBE CSS** | Andy Bell | Styling | Maintainability & Dark Mode |
| 4 | **JS Design Patterns** | Addy Osmani | Logic | Clean Code & Performance |
| 5 | **UX States** | Vitaly Friedman | Interaksi | User Feedback |
| 6 | **Inclusive Components** | Heydon Pickering | Komponen | Usability untuk Semua |
| 7 | **WAI-ARIA** | Scott O'Hara & Steve Faulkner | Aksesibilitas | Screen Reader Support |

### Mengapa 7 Standar Ini?

Ketujuh standar ini **tidak saling bertentangan**, melainkan **saling melengkapi** secara vertikal:

- **Semantic HTML** memberi fondasi struktur yang kokoh
- **Atomic Design** mengatur komponen dari atom hingga page
- **CUBE CSS** mengelola styling dengan design tokens dan dark mode
- **JS Design Patterns** memastikan kode JavaScript yang bersih
- **UX States** memberikan feedback jelas di setiap interaksi
- **Inclusive Components** menjamin komponen bisa dipakai semua orang
- **WAI-ARIA** melengkapi semantik HTML untuk screen reader

Hasilnya: aplikasi yang **performant**, **maintainable**, **accessible**, dan **scalable** untuk Multi-POS.

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/username/intelimart-pos.git
cd intelimart-pos

# 2. Install dependencies
npm install

# 3. Salin env (sesuaikan API URL)
cp .env.example .env

# 4. Start development server
npm run dev
# → http://localhost:3000
```

### Scripts Tersedia

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Build production |
| `npm run preview` | Preview production build |
| `npm run lint` | Cek ESLint (0 errors wajib) |
| `npm run lint:fix` | Auto-fix ESLint |
| `npm run format` | Format kode (Prettier) |
| `npm run format:check` | Cek format tanpa mengubah |

---

## 📁 Struktur Proyek

```
intelimart-pos/
├── src/
│   ├── app/                       # App bootstrap
│   │   ├── App.jsx               #   Root component
│   │   ├── router.jsx            #   Route definitions
│   │   ├── providers.jsx         #   QueryClient, ErrorBoundary
│   │   └── ErrorBoundary.jsx     #   Global error boundary
│   │
│   ├── core/                      # Logika inti (lintas-fitur)
│   │   ├── auth/                 #   Auth store, guards
│   │   ├── config/               #   Environment config
│   │   └── tenant/               #   Multi-tenant (planned)
│   │
│   ├── features/                  # Modul fitur (self-contained)
│   │   ├── landing/              #   Landing page
│   │   │   ├── components/       #     molecules + organisms
│   │   │   ├── hooks/            #     useFeatures, usePricing
│   │   │   ├── services/         #     API calls
│   │   │   ├── schemas/          #     Zod validation
│   │   │   ├── constants/        #     Static data
│   │   │   └── pages/            #     LandingPage
│   │   │
│   │   └── auth/                 #   Authentication
│   │       ├── components/       #     LoginForm, RegisterForm
│   │       ├── hooks/            #     useAuth, useAuthRedirect
│   │       ├── services/         #     authService
│   │       ├── schemas/          #     loginSchema, registerSchema
│   │       ├── constants/        #     AUTH_ROUTES, ROLES
│   │       └── pages/            #     Login, Register, ForgotPw
│   │
│   ├── shared/                    # Resource global
│   │   ├── components/
│   │   │   ├── atoms/            #     Button, Input, Badge, etc.
│   │   │   ├── molecules/        #     FormField, CardHeader
│   │   │   └── feedback/         #     ErrorState, EmptyState
│   │   ├── hooks/                #     useTheme, useMediaQuery
│   │   ├── lib/
│   │   │   ├── api/              #     axiosClient, interceptors
│   │   │   ├── utils/            #     cn(), format, storage
│   │   │   └── constants/        #     app, queryKeys
│   │   └── styles/               #     tokens.css, app.css
│   │
│   └── main.jsx                   # Entry point
│
├── .eslintrc.cjs                  # ESLint config
├── .prettierrc                    # Prettier config
├── tailwind.config.js             # Tailwind + brand colors
├── vite.config.js                 # Vite + path aliases
├── jsconfig.json                  # JS path aliases (IDE)
└── package.json
```

### Penjelasan Singkat

| Folder | Fungsi |
|--------|--------|
| `app/` | Bootstrap: routing, providers, error boundary |
| `core/` | Logika bisnis inti yang dipakai banyak fitur |
| `features/` | Modul fitur — setiap fitur punya components, hooks, services, schemas sendiri |
| `shared/` | Atoms, molecules, hooks, utils, dan styles yang dipakai di seluruh app |


---

## 📚 Dokumentasi Standar

### 1. Semantic HTML — HTML5 Spec

**Prinsip:** Gunakan elemen sesuai makna konten, bukan tampilan.

**Penerapan:**

```jsx
// ❌ Salah — div onClick tidak keyboard-accessible
<div onClick={handleClick}>Submit</div>

// ✅ Benar — button native
<section aria-labelledby="hero-heading">
  <h1 id="hero-heading">POS Modern untuk UMKM Indonesia</h1>
  <button onClick={handleClick}>Daftar Gratis</button>
</section>
```

**Manfaat Multi-POS:** SEO, screen reader navigasi antar landmark, kode self-documenting.

---

### 2. Atomic Design — Brad Frost

**Prinsip:** Bangun design system, bukan halaman.

**Hierarki:**

| Level | Lokasi | Contoh |
|-------|--------|--------|
| Atoms | `shared/components/atoms/` | Button, Input, Badge |
| Molecules | `shared/components/molecules/` | FormField, CardHeader |
| Organisms | `features/*/components/organisms/` | HeroSection, Navbar |
| Pages | `features/*/pages/` | LandingPage, LoginPage |

**Atom:**

```jsx
// src/shared/components/atoms/Button.jsx
const BUTTON_VARIANTS = Object.freeze({
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
  outline: 'border-2 border-brand-500 text-brand-600',
  ghost: 'text-zinc-700 hover:bg-zinc-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
});

const Button = forwardRef(({ children, variant = 'primary', loading, ...props }, ref) => (
  <button
    ref={ref}
    disabled={props.disabled || loading}
    className={cn('inline-flex items-center gap-2 rounded-lg focus-ring', BUTTON_VARIANTS[variant])}
    aria-busy={loading}
    {...props}
  >
    {children}
  </button>
));
```

**Molecule:**

```jsx
// src/shared/components/molecules/FormField.jsx
const FormField = forwardRef(({ label, error, id, ...inputProps }, ref) => {
  const fieldId = id || inputProps.name;
  const errorId = `${fieldId}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId}>{label}</label>
      <Input ref={ref} id={fieldId} error={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps} />
      {error && <p id={errorId} role="alert">{error}</p>}
    </div>
  );
});
```

**Manfaat Multi-POS:** Komponen reusable lintas fitur, konsistensi UI di seluruh halaman.

---

### 3. CUBE CSS — Andy Bell

**Prinsip:** Composition over inheritance, utility over specificity.

**4 Lapisan:**

| Lapisan | Fungsi | Contoh |
|---------|--------|--------|
| Composition | Layout pattern | `.container-app`, `.section-padding` |
| Utility | Class kecil 1 tugas | `mt-4`, `text-center` |
| Block | Komponen utuh | `.card`, `.button` |
| Exception | Variasi khusus | `.card--brand` |

**Design Tokens:**

```css
/* src/shared/styles/tokens.css */
@layer base {
  :root {
    --color-brand-500: 249 115 22;
    --color-surface-base: 255 255 255;
    --color-content-primary: 24 24 27;
    --color-border-default: 212 212 216;
    --space-section: 5rem;
  }

  .dark {
    --color-surface-base: 9 9 11;
    --color-content-primary: 250 250 250;
    --color-border-default: 63 63 70;
  }
}
```

**Hard-coded vs Tokens:**

```css
/* ❌ Salah — duplikasi & tidak scalable */
.button { background: #f97316; }
.header-cta { background: #f97316; }

/* ✅ Benar — 1 sumber kebenaran */
.button { background: rgb(var(--color-brand-500)); }
.header-cta { background: rgb(var(--color-brand-500)); }
```

Multi-tenant: Setiap tenant punya 1 file token berbeda (`tenant-warung.css`, `tenant-toko.css`). Komponen tetap sama, hanya token yang berubah.

**cn() Utility:**

```js
// src/shared/lib/utils/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- `clsx` → gabung class kondisional
- `twMerge` → selesaikan konflik Tailwind (`bg-blue-500 bg-red-500` → `bg-red-500`)

**Manfaat Multi-POS:** Theming per tenant, dark mode dengan 1 set token, konsistensi.

---

### 4. JS Design Patterns — Addy Osmani

**Prinsip:** Tulis JavaScript yang scalable dan maintainable.

**5 Pattern:**

| Pattern | Lokasi | Fungsi |
|---------|--------|--------|
| Factory | `axiosClient.js` | HTTP client config standar |
| Observer | `useTheme.js`, store | Reactive state |
| Module | Setiap file ES6 | Isolasi scope |
| Custom Hook | `hooks/*.js` | Encapsulate logic |
| Singleton | `axiosClient`, `queryClient` | 1 instance per app |

**Factory Pattern:**

```js
// ❌ Salah — duplikasi & global mutable
let apiUrl = 'https://api.example.com';
function fetchData() { return fetch(apiUrl + '/data'); }

// ✅ Benar — 1 sumber konfigurasi
// src/shared/lib/api/axiosClient.js
export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

// Pemakaian:
import { axiosClient } from '@shared/lib/api/axiosClient';
export const fetchFeatures = () => axiosClient.get('/features');
```

**Observer Pattern:**

```js
// src/shared/hooks/useTheme.js
const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'system',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    }),
    { name: STORAGE_KEYS.THEME }
  )
);

export function useTheme() {
  return useThemeStore();
}
// Semua komponen yang pakai useTheme() otomatis re-render
```

**Custom Hook Pattern:**

```js
// src/features/landing/hooks/useFeatures.js
export function useFeatures() {
  return useQuery({
    queryKey: QUERY_KEYS.FEATURES,
    queryFn: fetchFeatures,
    staleTime: 10 * 60 * 1000,
  });
}
```

**Manfaat Multi-POS:** Separation of concerns, caching otomatis, testability.

---

### 5. UX States — Vitaly Friedman

**Prinsip:** Desain semua state, bukan hanya happy path.

**State wajib:**

| State | Komponen | Trigger |
|-------|----------|---------|
| Loading | Skeleton, Spinner | Fetch berjalan |
| Error | ErrorState | Fetch gagal |
| Empty | EmptyState | Data kosong |
| Disabled | Button, Input | Form invalid/loading |
| Success | Komponen utama | Fetch berhasil |

**Implementasi:**

```jsx
// ❌ Salah — hanya happy path, crash saat loading
function FeatureList() {
  const { data } = useFeatures();
  return data.map((f) => <FeatureCard key={f.id} {...f} />);
}

// ✅ Benar — handle semua state
function FeaturesSection() {
  const { data, isLoading, isError, error, refetch } = useFeatures();

  if (isLoading) return <Skeleton className="h-64" />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState title="Belum ada fitur" />;

  return data.map((f) => <FeatureCard key={f.id} {...f} />);
}
```

**ErrorState Component:**

```jsx
// src/shared/components/feedback/ErrorState.jsx
function ErrorState({ title, message, onRetry }) {
  return (
    <div role="alert" aria-live="assertive" className="text-center py-12">
      <svg aria-hidden="true" className="w-16 h-16 text-red-500" />
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Coba Lagi</Button>}
    </div>
  );
}
```

**Manfaat Multi-POS:** Trust (kasir tahu status data), recovery (retry tanpa refresh), perceived speed.

---

### 6. Inclusive Components — Heydon Pickering

**Prinsip:** Komponen harus bisa dipakai semua orang secara default.

**5 Prinsip:**

1. Keyboard Navigation — Semua elemen interaktif dijangkau via Tab
2. Focus Ring — Indikator fokus jelas
3. Label & Error Asosiasi — `htmlFor`/`id` + `aria-describedby`
4. Color Contrast — WCAG AA (4.5:1)
5. Disabled Feedback — `opacity-50` + `cursor-not-allowed`

**Keyboard Navigation:**

| Elemen | Bisa di-Tab? | Bisa diaktifkan? |
|--------|-------------|------------------|
| `<button>` | ✅ | Enter, Space |
| `<a href>` | ✅ | Enter |
| `<input>` | ✅ | Ketik |
| `<div>` | ❌ | — |
| `<span>` | ❌ | — |

```jsx
// ❌ Salah — div tidak bisa di-Tab
<div onClick={handleClick}>Submit</div>

// ✅ Benar — button native
<button onClick={handleClick}>Submit</button>
```

**Focus Ring:**

```css
/* src/shared/styles/app.css */
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus-ring:focus-visible {
  outline: 2px solid rgb(249 115 22); /* brand-500 */
  outline-offset: 2px;
}
.dark .focus-ring:focus-visible {
  outline-color: rgb(251 146 60); /* brand-400 */
}
```

`:focus-visible` muncul hanya saat keyboard navigation, tidak saat klik mouse.

**Input dengan Label + Error:**

```jsx
// ❌ Salah — tanpa label, error tidak terasosiasi
<input placeholder="Email" />
{error && <span style={{color: 'red'}}>{error}</span>}

// ✅ Benar
<label htmlFor="email">Email</label>
<input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
  className="focus-ring"
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

**Manfaat Multi-POS:** Kasir dengan keterbatasan fisik tetap bisa kerja, power user bisa input cepat tanpa mouse, memenuhi WCAG AA.

---

### 7. WAI-ARIA — Scott O'Hara & Steve Faulkner

**Prinsip:** Pakai semantic HTML dulu, ARIA hanya jika HTML native tidak cukup.

**5 Aturan ARIA:**

1. HTML dulu, ARIA kemudian
2. Jangan ubah semantik native
3. ARIA interaktif harus keyboard-accessible
4. Jangan sembunyikan elemen fokusable
5. Semua elemen interaktif harus punya nama

**ARIA Attributes:**

| Attribute | Lokasi | Fungsi |
|-----------|--------|--------|
| `aria-labelledby` | HeroSection | Hubungkan section ke heading |
| `aria-busy` | Button | Announce loading |
| `aria-invalid` | Input, FormField | Announce invalid field |
| `aria-describedby` | FormField | Link input ke error text |
| `aria-hidden` | Icon SVG, Spinner | Sembunyikan dekorasi |
| `aria-live` | ErrorState, EmptyState | Announce perubahan |
| `aria-label` | Required indicator | Label untuk elemen tanpa text |
| `role="alert"` | Error messages | Immediate announcement |

**❌ Salah:**

```jsx
// role="button" hanya label, tidak menambah behavior
<div role="button" onClick={handleClick}>Click</div>
// ↑ Tidak bisa di-Tab, tidak bisa diaktifkan dengan Enter

// aria-live="assertive" terlalu agresif untuk loading
<div aria-live="assertive">Loading...</div>
```

**✅ Benar:**

```jsx
// Button dengan loading state
<button disabled={loading} aria-busy={loading} {...props}>
  {loading && <svg aria-hidden="true" />}
  {children}
</button>

// ErrorState — assertive karena error kritis
<div role="alert" aria-live="assertive">
  <svg aria-hidden="true" />
  <h3>{title}</h3>
  <p>{message}</p>
</div>

// EmptyState — polite karena info ringan
<div role="status" aria-live="polite">
  {icon && <div aria-hidden="true">{icon}</div>}
  <h3>{title}</h3>
  <p>{description}</p>
</div>
```

**Perbedaan aria-live:**

- `polite` → tunggu user selesai baca (info ringan: empty state)
- `assertive` → langsung potong (error kritis)

**Manfaat Multi-POS:** Screen reader support untuk tunanetra, error announcement langsung, live region untuk perubahan stok/harga.

---

## 🧭 Konvensi Kode

### Naming Convention

| Element | Convention | Contoh |
|---------|-----------|--------|
| Component | PascalCase | `Button`, `HeroSection` |
| File component | PascalCase.jsx | `Button.jsx` |
| File utility | camelCase.js | `cn.js`, `format.js` |
| Function | camelCase | `handleSubmit` |
| Constant | UPPER_SNAKE_CASE | `BUTTON_VARIANTS` |
| Hook | use + PascalCase | `useTheme`, `useFeatures` |
| Prop | camelCase | `variant`, `isLoading` |
| CSS Token | kebab-case | `--color-brand-500` |

### Type Safety 3 Lapis

| Lapis | Kapan Aktif | Tugas |
|-------|------------|-------|
| JSDoc | Saat menulis kode | IDE IntelliSense |
| PropTypes | Runtime development | Validasi props |
| Zod | Runtime | Validasi data API & form |

**1. JSDoc:**

```jsx
/**
 * Button Component - Atomic Design: Atom
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant
 */
function Button({ children, variant = 'primary' }) { /* ... */ }
```

**2. PropTypes:**

```jsx
import PropTypes from 'prop-types';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};
```

**3. Zod:**

```js
// Validasi form
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Validasi response API
const featuresResponseSchema = z.object({
  data: z.array(featureSchema),
  total: z.number(),
});

const parsed = featuresResponseSchema.safeParse(raw.data);
if (!parsed.success) throw new Error('Response API tidak sesuai schema');
```

### ESLint + Prettier

| Tool | Tugas | Fokus |
|------|-------|-------|
| ESLint | Cek kualitas kode | Benar/salah logika |
| Prettier | Rapikan format | Konsistensi visual |

```js
// .eslintrc.cjs
{
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  rules: {
    'react/prop-types': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'import/order': ['warn', { 'newlines-between': 'always' }],
  },
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Path Aliases

```jsx
// ❌ Salah — panjang & mudah salah
import { Button } from '../../../../shared/components/atoms/Button';

// ✅ Benar — pendek & jelas
import { Button } from '@shared/components/atoms';
```

Setup 2 file:

```js
// vite.config.js — untuk build tool
resolve: {
  alias: {
    '@app': path.resolve(__dirname, './src/app'),
    '@features': path.resolve(__dirname, './src/features'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@core': path.resolve(__dirname, './src/core'),
  },
}
```

```json
// jsconfig.json — untuk IDE
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@core/*": ["src/core/*"]
    }
  }
}
```

**Alias tersedia:**

| Alias | Path |
|-------|------|
| `@app` | `./src/app` |
| `@features` | `./src/features` |
| `@shared` | `./src/shared` |
| `@core` | `./src/core` |

#### Penerapan di InteliMart

- `<section>` dengan `aria-labelledby` untuk setiap blok konten
- `<nav>` untuk navigasi, `<button>` untuk aksi, `<a>` untuk link
- Heading hierarchy (`h1` → `h2` → `h3`) konsisten di setiap halaman
- `<form>`, `<label>`, `<input>` dengan asosiasi `htmlFor`/`id` yang benar

#### ❌ Salah

```jsx
<div onClick={handleClick}>Submit</div>
<div className="title">Judul Halaman</div>
<span onClick={goTo}>Lihat detail</span>
```

#### ✅ Benar

```jsx
// src/features/landing/components/organisms/HeroSection.jsx
<section
  className="relative pt-32 pb-20 lg:pt-40 lg:pb-28"
  aria-labelledby="hero-heading"
>
  <div className="container-app">
    <h1
      id="hero-heading"
      className="text-4xl md:text-5xl lg:text-6xl font-bold"
    >
      POS Modern untuk
      <span className="text-brand-500">UMKM Indonesia</span>
    </h1>

    <p className="text-lg text-zinc-600 dark:text-zinc-400">
      Kelola penjualan, stok, dan laporan bisnis Anda.
    </p>

    <Button variant="primary" size="lg">
      Daftar Gratis Sekarang
    </Button>
  </div>
</section>



## 🗺️ Roadmap

| Iterasi | Status | Fitur | Target |
|---------|--------|-------|--------|
| **1** | ✅ Selesai | Landing Page + API Setup | Sep 2026 |
| **2** | ✅ Selesai | Authentication (Login, Register, Forgot/Reset Password) | Sep 2026 |
| **3** | ⏳ Berikutnya | Dashboard Multi-Outlet + Tenant Management | Okt 2026 |
| **4** | 📅 Planned | POS Core (Transaksi, Kasir, Printer) | Nov 2026 |
| **5** | 📅 Planned | Inventory Management (Stok, Transfer, Opname) | Des 2026 |
| **6** | 📅 Planned | Reports & Analytics (Dashboard, Export) | Jan 2027 |

### Iterasi 1 — Landing Page ✅

- [x] Hero section dengan CTA
- [x] Features section (API integration + React Query)
- [x] Pricing section dengan loading/error states
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark mode support (semantic tokens)
- [x] Accessibility (WCAG AA)
- [x] ESLint 0 errors

### Iterasi 2 — Authentication ✅

- [x] Login page (email + password)
- [x] Register page (nama, email, password, konfirmasi)
- [x] Forgot password page
- [x] Reset password page (token-based)
- [x] Auth store (Zustand + persist ke localStorage)
- [x] Protected routes → redirect ke `/login`
- [x] Public routes → redirect ke `/dashboard` jika sudah login
- [x] Token refresh interceptor (401 handling)
- [x] Form validation (Zod + React Hook Form)
- [x] Loading / error / success states

### Iterasi 3 — Dashboard Multi-Outlet (Berikutnya)

- [ ] Dashboard layout dengan sidebar navigation
- [ ] Multi-tenant architecture
- [ ] Outlet management (CRUD)
- [ ] User management (invite, roles)
- [ ] Profile settings
- [ ] Role-based access control (RBAC)

---

## 📄 Lisensi

MIT License — Copyright © 2026 InteliMart

Lihat file [LICENSE](LICENSE) untuk detail.

---

<p align="center">
  Dibuat dengan ❤️ untuk UMKM Indonesia
</p>

# templating_react_multiPOS
