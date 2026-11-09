import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getHomeByRole } from '@core/auth/roles';

import { LoginForm } from '../components/molecules';
import { AuthLayout } from '../components/organisms';
import { useAuth } from '../hooks';
import { login as loginService } from '../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await loginService(data);

      setAuth({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      });

      navigate(getHomeByRole(response.user), { replace: true });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Masuk ke Akun Anda"
      subtitle="Kelola bisnis Anda dengan mudah"
    >
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
}

export default LoginPage;