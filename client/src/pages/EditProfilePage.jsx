// client/src/pages/EditProfilePage.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUserEdit, FaLock, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';

// === API FONKSİYONLARI ===

// Profil bilgilerini çeken
const fetchProfile = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/users/profile', config);
  return data;
};
// Profil (isim, bio) GÜNCELLEYEN
const updateProfileFn = async ({ data, token }) => {
  const config = { 
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    } 
  };
  const res = await axios.put('/api/users/profile', data, config);
  return res.data;
};
// Şifre GÜNCELLEYEN
const updatePasswordFn = async ({ data, token }) => {
  const config = { 
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    } 
  };
  const res = await axios.put('/api/users/change-password', data, config);
  return res.data;
};


function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userInfo, login } = useAuthStore(); // login'i (state güncellemesi için) al

  // === Form 1: Profil Bilgileri Formu ===
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm();
  
  // === Form 2: Şifre Değiştirme Formu ===
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  // Mevcut profil verisini çek (formu doldurmak için)
  const { 
    data: profileData, 
    isLoading: isLoadingProfile 
  } = useQuery({
    queryKey: ['profile', userInfo?._id],
    queryFn: () => fetchProfile(userInfo.token),
    enabled: !!userInfo,
  });

  // Veri yüklendiğinde, Profil Formunu doldur
  useEffect(() => {
    if (profileData) {
      resetProfile({
        name: profileData.name,
        bio: profileData.bio || '', // 'bio' null ise '' yap
      });
    }
  }, [profileData, resetProfile]);

  
  // === MUTASYONLAR ===
  
  // 1. Profil GÜNCELLEME Mutasyonu
  const updateProfileMutation = useMutation({
    mutationFn: updateProfileFn,
    onSuccess: (updatedUserData) => {
      toast.success('Profil başarıyla güncellendi!');
      
      // Global state'i (authStore) yeni bilgilerle güncelle
      // (Token'ı kaybetmemek için mevcut userInfo ile birleştir)
      login({ ...userInfo, ...updatedUserData }); 
      
      queryClient.invalidateQueries(['profile', userInfo?._id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    },
  });

  // 2. Şifre GÜNCELLEME Mutasyonu
  const updatePasswordMutation = useMutation({
    mutationFn: updatePasswordFn,
    onSuccess: (data) => {
      toast.success(data.message || 'Şifre başarıyla güncellendi!');
      resetPassword(); // Şifre formunu temizle
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    },
  });

  // === SUBMIT FONKSİYONLARI ===
  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate({ data, token: userInfo.token });
  };
  const onPasswordSubmit = (data) => {
    updatePasswordMutation.mutate({ data, token: userInfo.token });
  };

  if (isLoadingProfile) {
    return <LoadingSpinner fullPage />;
  }
  
  const isSavingProfile = updateProfileMutation.isLoading;
  const isSavingPassword = updatePasswordMutation.isLoading;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Profili Düzenle
        </h1>

        <div className="space-y-8">
          
          {/* --- FORM 1: PROFİL BİLGİLERİ (EKSİKSİZ) --- */}
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaUserEdit className="text-primary" /> Profil Bilgileri
            </h2>
            <div className="space-y-6">
              {/* Ad Soyad */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  {...registerProfile("name", { required: "Ad soyad zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${profileErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSavingProfile}
                />
                {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>}
              </div>
              {/* Email (Değiştirilemez) */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta (Değiştirilemez)
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileData?.email || ''}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none"
                />
              </div>
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Hakkımda (Bio)
                </label>
                <textarea
                  id="bio"
                  {...registerProfile("bio")}
                  rows="4"
                  placeholder="Kısaca kendinizden, çaldığınız enstrümanlardan bahsedin..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
                  disabled={isSavingProfile}
                />
              </div>
              {/* (Avatar yükleme şimdilik atlandı) */}
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg disabled:opacity-50"
                  disabled={isSavingProfile}
                >
                  <FaSave className="inline mr-2" />
                  {isSavingProfile ? 'Kaydediliyor...' : 'Profili Kaydet'}
                </button>
              </div>
            </div>
          </form>

          {/* --- FORM 2: ŞİFRE DEĞİŞTİRME (EKSİKSİZ) --- */}
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaLock className="text-primary" /> Şifre Değiştir
            </h2>
            <div className="space-y-6">
              {/* Mevcut Şifre */}
              <div>
                <label htmlFor="currentPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  {...registerPassword("currentPassword", { required: "Mevcut şifre zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSavingPassword}
                />
                {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>}
              </div>
              {/* Yeni Şifre */}
              <div>
                <label htmlFor="newPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...registerPassword("newPassword", { 
                    required: "Yeni şifre zorunludur",
                    minLength: { value: 6, message: "Şifre en az 6 karakter olmalı" }
                  })}
                  className={`w-full px-4 py-3 border rounded-lg ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSavingPassword}
                />
                {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
              </div>
              {/* Yeni Şifre Tekrar */}
              <div>
                <label htmlFor="confirmNewPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  {...registerPassword("confirmNewPassword", { 
                    required: "Şifre onayı zorunludur",
                    validate: value => value === watchPassword('newPassword') || "Yeni şifreler eşleşmiyor" 
                  })}
                  className={`w-full px-4 py-3 border rounded-lg ${passwordErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSavingPassword}
                />
                {passwordErrors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmNewPassword.message}</p>}
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-accent hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg disabled:opacity-50"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfilePage;