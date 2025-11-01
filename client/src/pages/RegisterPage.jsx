// client/src/pages/RegisterPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

function RegisterPage() {
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
    watch, 
    formState: { errors, isSubmitting } 
  } = useForm();

  // 'password' alanını izle (şifre tekrarı kontrolü için)
  const password = watch('password');

  const onSubmit = async (data) => {
    const { name, email, password } = data;
    
    // API isteği
    try {
      // PROXY sayesinde tam URL yazmıyoruz
      const res = await axios.post('/api/users/register', {
        name,
        email,
        password,
      });

      // 1. API'den gelen veriyi (user + token) al
      const userData = res.data;
      
      // 2. Global state'i (Zustand store) güncelle
      login(userData);

      // 3. Başarı bildirimi göster
      toast.success(`Hoş geldin, ${userData.name}!`);

      // 4. Ana sayfaya yönlendir
      navigate('/');

    } catch (error) {
      // 5. Hata bildirimi göster (Backend'den gelen mesajı kullan)
      toast.error(
        error.response?.data?.message || 'Kayıt sırasında bir hata oluştu'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Hesap Oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            veya{' '}
            <Link to="/login" className="font-medium text-primary hover:text-blue-700">
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>
        
        {/* 'handleSubmit' form doğrulamasını yapar ve sonra 'onSubmit'i çağırır */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Ad Soyad */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="full-name"
              type="text"
              {...register("name", { required: "Ad soyad zorunludur" })}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Ad Soyad"
              disabled={isSubmitting} // İstek atılırken formu kilitle
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email-address"
              type="email"
              {...register("email", { 
                required: "Email zorunludur",
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Geçerli bir email adresi girin"
                }
              })}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Email adresi"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Şifre */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              {...register("password", { 
                required: "Şifre zorunludur",
                minLength: { value: 6, message: "Şifre en az 6 karakter olmalı" }
              })}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Şifre"
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          {/* Şifre Tekrar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirm-password"
              type="password"
              {...register("confirmPassword", { 
                required: "Şifre onayı zorunludur",
                validate: value => value === password || "Şifreler eşleşmiyor" 
              })}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Şifrenizi Onaylayın"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="text-xs text-gray-500 text-center">
            ...
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-50"
              disabled={isSubmitting} // İstek atılırken butonu kilitle
            >
              {isSubmitting ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;