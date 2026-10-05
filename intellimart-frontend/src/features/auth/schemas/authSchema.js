import { z } from 'zod';

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

/**
 * Register schema
 */
export const registerSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
    email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
    password: z.string().min(6, 'Password minimal 6 karakter').max(100, 'Password maksimal 100 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password minimal 6 karakter').max(100, 'Password maksimal 100 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

/**
 * Auth response schema
 */
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'cashier', 'owner']).optional(),
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
});

/**
 * @typedef {z.infer<typeof loginSchema>} LoginInput
 * @typedef {z.infer<typeof registerSchema>} RegisterInput
 * @typedef {z.infer<typeof forgotPasswordSchema>} ForgotPasswordInput
 * @typedef {z.infer<typeof resetPasswordSchema>} ResetPasswordInput
 * @typedef {z.infer<typeof authResponseSchema>} AuthResponse
 */
