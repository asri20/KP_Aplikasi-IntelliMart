import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';


import { Button } from '@shared/components/atoms';
import { FormField } from '@shared/components/molecules';

import { resetPasswordSchema } from '../../schemas/authSchema';

/**
 * ResetPasswordForm Component - Atomic Design: Molecule
 * Form for resetting password with token
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Submit handler
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {string} [props.error] - Error message from server
 */
function ResetPasswordForm({ onSubmit, isLoading = false, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
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

      <p className="text-sm text-zinc-600 dark:text-zinc-400">Masukkan password baru Anda.</p>

      {/* Password Field */}
      <FormField
        label="Password Baru"
        type={showPassword ? 'text' : 'password'}
        placeholder="Minimal 6 karakter"
        error={errors.password?.message}
        disabled={isLoading}
        autoComplete="new-password"
        {...register('password')}
      />

      {/* Confirm Password Field */}
      <FormField
        label="Konfirmasi Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Masukkan ulang password"
        error={errors.confirmPassword?.message}
        disabled={isLoading}
        autoComplete="new-password"
        {...register('confirmPassword')}
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

      {/* Submit Button */}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Mereset...' : 'Reset Password'}
      </Button>
    </form>
  );
}

ResetPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default ResetPasswordForm;
