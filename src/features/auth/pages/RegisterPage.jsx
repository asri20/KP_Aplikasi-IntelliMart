import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { RegisterForm } from '../components/molecules';
import { AuthLayout } from '../components/organisms';
import { useAuth } from '../hooks';
import { register as registerService } from '../services/authService';


/**
 * RegisterPage Component
 * Registration page with form and validation
 */
function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle registration form submission
   * @param {Object} data - Form data
   * @param {string} data.name - User name
   * @param {string} data.email - User email
   * @param {string} data.password - User password
   */
  const handleRegister = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      // Call register service
      const response = await registerService({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Set auth state
      setAuth({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      });

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Buat Akun Baru" subtitle="Mulai kelola bisnis Anda hari ini">
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}

export default RegisterPage;
