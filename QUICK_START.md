# 🚀 Quick Start Guide - InteliMart POS

## Cara Menjalankan Project

### 1. Development Mode
```bash
npm run dev
```
Buka http://localhost:3000

### 2. Production Build
```bash
npm run build
npm run preview
```

### 3. Lint & Format
```bash
npm run lint
npm run format
```

## 🎨 Cara Menambah Fitur Baru

### Menambah Feature Card Baru
Edit `src/features/landing/constants/features.js`:

```javascript
export const FEATURES_DATA = Object.freeze([
  // ... existing features
  {
    id: 'new-feature',
    icon: 'icon-name', // pilih dari ICON_PATHS
    title: 'Judul Fitur',
    description: 'Deskripsi fitur...',
    highlight: 'Badge highlight', // optional
  },
]);
```

### Menambah Pricing Plan
Edit `src/features/landing/constants/pricing.js`:

```javascript
export const PRICING_PLANS = Object.freeze([
  // ... existing plans
  {
    id: 'plan-id',
    name: 'Nama Plan',
    price: 299000,
    // ... dst
  },
]);
```

### Membuat Component Baru

**Atom Component:**
```javascript
// src/shared/components/atoms/NewAtom.jsx
import PropTypes from 'prop-types';
import { cn } from '@shared/lib/utils/cn';

function NewAtom({ children, variant = 'default', className, ...props }) {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {children}
    </div>
  );
}

NewAtom.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'secondary']),
  className: PropTypes.string,
};

export default NewAtom;
```

**Custom Hook:**
```javascript
// src/shared/hooks/useCustom.js
import { useState } from 'react';

/**
 * Custom hook description
 * @returns {Object} Hook result
 * @property {boolean} isActive - Active state
 * @property {function} toggle - Toggle function
 */
export function useCustom() {
  const [isActive, setIsActive] = useState(false);
  
  const toggle = () => setIsActive(!isActive);
  
  return { isActive, toggle };
}
```

## 🎨 Theming

### Mengubah Brand Color
Edit `tailwind.config.js`:

```javascript
colors: {
  brand: {
    500: '#YOUR_COLOR', // Primary brand color
    // ... generate full scale
  },
}
```

### Menambah Semantic Token
Edit `src/shared/styles/tokens.css`:

```css
:root {
  --color-surface-new: 255 255 255;
}

.dark {
  --color-surface-new: 24 24 27;
}
```

## 🔌 API Integration

### Mengganti Mock API dengan Real API

1. **Update environment:**
```bash
# .env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENABLE_MOCK_API=false
```

2. **Update service:**
```javascript
// src/features/landing/services/landingService.js
export async function fetchFeatures() {
  const response = await axiosClient.get(ENDPOINTS.LANDING.FEATURES);
  const validation = validateResponse(featuresSchema, response.data);
  return validation.data;
}
```

## 📱 Responsive Breakpoints

```javascript
// Gunakan useMediaQuery hook
const isMobile = useMediaQuery('(max-width: 768px)');
const isDesktop = useMediaQuery('LG'); // >= 1024px
```

## 🌙 Dark Mode

```javascript
// Di component
const { theme, setTheme, toggleTheme } = useTheme();

// Set specific theme
setTheme('dark'); // 'light' | 'dark' | 'system'

// Toggle
toggleTheme();
```

## 📝 Form dengan Validation

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        error={errors.email?.message}
        {...register('email')}
      />
    </form>
  );
}
```

## 🎯 Best Practices

1. **Selalu gunakan PropTypes** di setiap component
2. **JSDoc** untuk fungsi publik dan hooks
3. **Zod schema** untuk API response validation
4. **Object.freeze()** untuk constants
5. **Semantic HTML** daripada div
6. **ARIA attributes** untuk accessibility
7. **useTheme** untuk dark mode aware components
8. **React Query** untuk server state
9. **Atomic Design** untuk struktur component
10. **CUBE CSS** untuk styling methodology

## 🐛 Troubleshooting

### Build Error
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ESLint Error
```bash
npm run lint:fix
```

### Port sudah digunakan
Edit `vite.config.js`:
```javascript
server: {
  port: 3001, // ubah port
}
```

---

**Need help?** Check README.md and CHECKLIST.md
