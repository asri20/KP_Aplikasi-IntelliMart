import { useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { ResetPasswordForm } from '../components/molecules';
import { AuthLayout } from '../components/organisms';
import { resetPassword as resetPasswordService } from '../services/authService';


/**
 * ResetPasswordPage Component
 * Page for resetting password with token from email
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show error if no token
  if (!token) {
    return (
      <AuthLayout title="Link Tidak Valid" subtitle="Token reset password tidak ditemukan">
        <div className="text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Link reset password tidak valid atau sudah kadaluarsa.
          </p>
          <a
            href="/forgot-password"
            className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium hover:underline"
          >
            Minta link baru
          </a>
        </div>
      </AuthLayout>
    );
  }

  /**
   * Handle reset password form submission
   * @param {Object} data - Form data
   * @param {string} data.password - New password
   */
  const handleResetPassword = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      // Call reset password service
      await resetPasswordService({
        token,
        password: data.password,
      });

      // Redirect to login with success message
      navigate('/login?reset=success', { replace: true });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Buat password baru untuk akun Anda">
      <ResetPasswordForm onSubmit={handleResetPassword} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}

export default ResetPasswordPage;
