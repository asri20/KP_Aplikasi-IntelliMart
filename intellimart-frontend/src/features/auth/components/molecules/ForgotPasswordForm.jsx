import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';


import { Button } from '@shared/components/atoms';
import { FormField } from '@shared/components/molecules';

import { forgotPasswordSchema } from '../../schemas/authSchema';

/**
 * ForgotPasswordForm Component - Atomic Design: Molecule
 * Form for requesting password reset
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Submit handler
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {string} [props.error] - Error message from server
 * @param {string} [props.success] - Success message
 */
function ForgotPasswordForm({ onSubmit, isLoading = false, error, success }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Server Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg" role="alert">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
      </p>

      {/* Email Field */}
      <FormField
        label="Email"
        type="email"
        placeholder="nama@example.com"
        error={errors.email?.message}
        disabled={isLoading || !!success}
        autoComplete="email"
        {...register('email')}
      />

      {/* Submit Button */}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading || !!success}>
        {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
      </Button>

      {/* Back to Login Link */}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium hover:underline">
          Kembali ke halaman login
        </Link>
      </p>
    </form>
  );
}

ForgotPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
};

export default ForgotPasswordForm;
