// client/src/pages/LoginPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

function LoginPage() {
  const navigate = useNavigate();
  const { login, userInfo } = useAuthStore(); // login fonksiyonunu ve userInfo'yu store'dan al

  // Eğer kullanıcı zaten giriş yapmışsa, onu ana sayfaya yönlendir
  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const { email, password } = data;

    try {
      // PROXY sayesinde tam URL yazmıyoruz
      const res = await axios.post('/api/users/login', {
        email,
        password,
      });

      // 1. API'den gelen veriyi (user + token) al
      const userData = res.data;

      // 2. Global state'i (Zustand store) güncelle
      login(userData);

      // 3. Başarı bildirimi göster
      toast.success(`Tekrar hoş geldin, ${userData.name}!`);

      // 4. Ana sayfaya yönlendir
      navigate('/');

    } catch (error) {
      // 5. Hata bildirimi göster (Backend'den gelen mesajı kullan)
      toast.error(
        error.response?.data?.message || 'Giriş sırasında bir hata oluştu'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Tekrar Hoş Geldiniz!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            veya{' '}
            <Link to="/register" className="font-medium text-primary hover:text-blue-700">
              yeni hesap oluşturun
            </Link>
          </p>
        </div>

        {/* 'handleSubmit' form doğrulamasını yapar ve sonra 'onSubmit'i çağırır */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-address"
                type="email"
                {...register("email", { 
                  required: "Email zorunludur" 
                })}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Email adresi"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Şifre */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                {...register("password", { 
                  required: "Şifre zorunludur" 
                })}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Şifre"
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* ... Beni Hatırla / Şifremi Unuttum ... (Bunlar şimdilik çalışmıyor) */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni Hatırla
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-blue-700">
                Şifrenizi mi unuttunuz?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          {/* ... Sosyal Medya Butonları ... (Bunlar şimdilik çalışmıyor) */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">veya</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button type="button" className="...">
              <FaGoogle /> Google ile Giriş
            </button>
            <button type="button" className="...">
              <FaFacebook /> Facebook ile Giriş
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;