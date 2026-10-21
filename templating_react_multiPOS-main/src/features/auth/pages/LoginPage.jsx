import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

      console.log('User login:', response.user);

      const role = String(
        response.user?.role || response.user?.role_name || ''
      ).toLowerCase();
      console.log('ROLE SAAT LOGIN:', role);
      console.log('DATA USER:', response.user);

      // Pastikan role dikenali sebelum menyimpan sesi
      if (!['owner', 'manager', 'cashier'].includes(role)) {
        setError(`Role pengguna tidak dikenali: ${role || 'kosong'}`);
        return;
      }

      setAuth({
        user: {
          ...response.user,
          role,
        },
        token: response.token,
        refreshToken: response.refreshToken,
      });

      // Arahkan pengguna sesuai role
     
if (role === 'owner') {
  console.log('REDIRECT KE OWNER');
  navigate('/dashboard', { replace: true });
} else if (role === 'manager') {
  console.log('REDIRECT KE MANAGER');
  navigate('/manager/dashboard', { replace: true });
} else if (role === 'cashier') {
  console.log('REDIRECT KE KASIR');
  navigate('/kasir/dashboard', { replace: true });
} else {
  setError(`Role pengguna tidak dikenali: ${role || 'kosong'}`);
}

    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
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