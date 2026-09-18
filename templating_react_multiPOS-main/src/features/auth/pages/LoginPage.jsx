import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { LoginForm } from '../components/molecules';
import { AuthLayout } from '../components/organisms';
import { useAuth } from '../hooks';
import { login as loginService } from '../services/authService';


/**
 * LoginPage Component
 * Login page with form and authentication logic
 */
function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle login form submission
   * @param {Object} data - Form data
   * @param {string} data.email - User email
   * @param {string} data.password - User password
   */
  const handleLogin = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      // Call login service
      const response = await loginService(data);

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
    <AuthLayout title="Masuk ke Akun Anda" subtitle="Kelola bisnis Anda dengan mudah">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
    </AuthLayout>
  );
}

export default LoginPage;
