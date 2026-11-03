import { useState } from 'react';

import { ForgotPasswordForm } from '../components/molecules';
import { AuthLayout } from '../components/organisms';
import { forgotPassword as forgotPasswordService } from '../services/authService';


/**
 * ForgotPasswordPage Component
 * Page for requesting password reset
 */
function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle forgot password form submission
   * @param {Object} data - Form data
   * @param {string} data.email - User email
   */
  const handleForgotPassword = async (data) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Call forgot password service
      const response = await forgotPasswordService(data);

      // Show success message
      setSuccess(response.message);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Lupa Password?" subtitle="Kami akan kirimkan link reset ke email Anda">
      <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} error={error} success={success} />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
