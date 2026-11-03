import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';


import { Button } from '@shared/components/atoms';
import { FormField } from '@shared/components/molecules';

import { loginSchema } from '../../schemas/authSchema';

/**
 * LoginForm Component - Atomic Design: Molecule
 * Form for user login with validation
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Submit handler
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {string} [props.error] - Error message from server
 */
function LoginForm({ onSubmit, isLoading = false, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Server Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <FormField
        label="Email"
        type="email"
        placeholder="nama@example.com"
        error={errors.email?.message}
        disabled={isLoading}
        autoComplete="email"
        {...register('email')}
      />

      {/* Password Field */}
      <div className="space-y-2">
        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Masukkan password"
          error={errors.password?.message}
          disabled={isLoading}
          autoComplete="current-password"
          {...register('password')}
        />

        {/* Show Password Toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            disabled={isLoading}
            className="rounded border-zinc-300 dark:border-zinc-600 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
          />
          <span className="text-zinc-600 dark:text-zinc-400">Tampilkan password</span>
        </label>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          to="/forgot-password"
          className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
        >
          Lupa password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Masuk...' : 'Masuk'}
      </Button>

      {/* Register Link */}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Belum punya akun?{' '}
        <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default LoginForm;
