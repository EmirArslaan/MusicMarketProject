// client/src/pages/EditBandPostPage.jsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FaUsers, FaMusic, FaDrum } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Select from 'react-select'; // Çoklu seçim için

// --- (react-select ayarları ve opsiyonları) ---
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    padding: '0.35rem',
    borderColor: '#d1d5db',
    borderRadius: '0.5rem',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e0e7ff',
  }),
};
const genreOptions = [
  { value: 'Rock', label: 'Rock' }, { value: 'Pop', label: 'Pop' }, { value: 'Jazz', label: 'Jazz' },
  { value: 'Blues', label: 'Blues' }, { value: 'Metal', label: 'Metal' }, { value: 'Funk', label: 'Funk' },
  { value: 'Indie', label: 'Indie' }, { value: 'Akustik', label: 'Akustik' },
];
const instrumentOptions = [
  { value: 'Gitarist', label: 'Gitarist' }, { value: 'Basçı', label: 'Basçı' }, { value: 'Davulcu', label: 'Davulcu' },
  { value: 'Vokal', label: 'Vokal' }, { value: 'Klavyeci', label: 'Klavyeci' }, { value: 'Saksafoncu', label: 'Saksafoncu' },
  { value: 'Diğer', label: 'Diğer' },
];
// --------------------------------------------------------------------

// Mevcut ilanın verisini çeken fonksiyon
const fetchBandPost = async (postId) => {
  const { data } = await axios.get(`/api/bands/${postId}`);
  return data;
};

// Güncelleme API isteğini yapacak fonksiyon
const updateBandPostFn = async ({ postId, data, token }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await axios.put(`/api/bands/${postId}`, data, config);
  return res.data;
};


function EditBandPostPage() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();

  // Mevcut ilan verisini çekmek için useQuery
  const { 
    data: postData, 
    isLoading: isLoadingPost,
    isError,
    error
  } = useQuery({
    queryKey: ['bandPost', postId],
    queryFn: () => fetchBandPost(postId),
  });

  // react-hook-form'u ayarla
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  // Veri yüklendiğinde, formu o verilerle DOLDUR
  useEffect(() => {
    if (postData) {
      // react-select'in anlayacağı formata (örn: ['Rock']) 
      // (örn: [{value: 'Rock', label: 'Rock'}]) dönüştür
      const formattedData = {
        ...postData,
        genres: postData.genres.map(g => ({ value: g, label: g })),
        lookingFor: postData.lookingFor.map(i => ({ value: i, label: i })),
      };
      reset(formattedData); // Formu backend'den gelen veriyle doldur
    }
  }, [postData, reset]);
  
  // Güncelleme (UPDATE) MUTATION'INI AYARLA
  const updateMutation = useMutation({
    mutationFn: updateBandPostFn,
    onSuccess: (updatedPost) => {
      toast.success('Grup ilanı başarıyla güncellendi!');
      
      // Önbelleği temizle
      queryClient.invalidateQueries(['bandPost', updatedPost._id]);
      queryClient.invalidateQueries(['myBandPosts', userInfo?._id]);
      
      navigate(`/grup-ara/${updatedPost._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İlan güncellenirken bir hata oluştu');
    },
  });

  // FORM GÖNDERME (SUBMIT) MANTIĞI
  const onSubmit = (data) => {
    // react-select'ten gelen veriyi (örn: [{value: 'Rock', label: 'Rock'}])
    // backend'in beklediği formata (örn: ['Rock']) geri dönüştür
    const formattedData = {
      ...data,
      genres: data.genres.map(g => g.value),
      lookingFor: data.lookingFor.map(i => i.value),
    };
    
    updateMutation.mutate({ postId, data: formattedData, token: userInfo.token });
  };

  if (isLoadingPost) {
    return <LoadingSpinner fullPage />;
  }
  if (isError) {
    return <p className="text-red-500">Hata: {error.message}</p>;
  }

  const isSaving = updateMutation.isLoading;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Grup İlanını Düzenle
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. Temel Bilgiler (EKSİKSİZ) */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaDrum className="text-primary" /> Temel Bilgiler
            </h2>
            <div className="space-y-6">
              {/* Başlık */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  İlan Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title", { required: "İlan başlığı zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              {/* Açıklama */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  {...register("description", { required: "Açıklama zorunludur" })}
                  rows="6"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                  disabled={isSaving}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* 2. Detaylar (EKSİKSİZ) */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaMusic className="text-primary" /> İlan Detayları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İlan Tipi */}
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">İlan Tipi</label>
                <select
                  id="type"
                  {...register("type", { required: "İlan tipi zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.type ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                >
                  <option value="Müzisyen Aranıyor">Müzisyen Aranıyor</option>
                  <option value="Grup Kuruluyor">Grup Kuruluyor</option>
                  <option value="Partner Aranıyor">Partner Aranıyor</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
              </div>
              
              {/* Konum */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">Konum (Şehir)</label>
                <select
                  id="location"
                  {...register("location", { required: "Konum zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                >
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                  <option value="bursa">Bursa</option>
                  <option value="antalya">Antalya</option>
                </select>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>
              
              {/* Aranan Pozisyonlar (Çoklu Seçim) */}
              <div>
                <label htmlFor="lookingFor" className="block text-sm font-semibold text-gray-700 mb-2">Aranan Pozisyon(lar)</label>
                <Controller
                  name="lookingFor"
                  control={control}
                  rules={{ required: "En az bir pozisyon seçmelisiniz" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      options={instrumentOptions}
                      styles={customSelectStyles}
                      placeholder="Pozisyon seçin..."
                      isDisabled={isSaving}
                    />
                  )}
                />
                {errors.lookingFor && <p className="text-red-500 text-sm mt-1">{errors.lookingFor.message}</p>}
              </div>

              {/* Müzik Türleri (Çoklu Seçim) */}
              <div>
                <label htmlFor="genres" className="block text-sm font-semibold text-gray-700 mb-2">Müzik Tür(ler)i</label>
                <Controller
                  name="genres"
                  control={control}
                  rules={{ required: "En az bir müzik türü seçmelisiniz" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      options={genreOptions}
                      styles={customSelectStyles}
                      placeholder="Müzik türü seçin..."
                      isDisabled={isSaving}
                    />
                  )}
                />
                {errors.genres && <p className="text-red-500 text-sm mt-1">{errors.genres.message}</p>}
              </div>
              
              {/* Deneyim Seviyesi */}
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-semibold text-gray-700 mb-2">Deneyim Seviyesi</label>
                <select
                  id="experienceLevel"
                  {...register("experienceLevel")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSaving}
                >
                  <option value="Farketmez">Farketmez</option>
                  <option value="Başlangıç">Başlangıç</option>
                  <option value="Orta">Orta</option>
                  <option value="İleri">İleri</option>
                </select>
              </div>
              
              {/* Mevcut Üye Sayısı */}
              <div>
                <label htmlFor="currentMembers" className="block text-sm font-semibold text-gray-700 mb-2">Mevcut Üye Sayısı</label>
                <input
                  type="number"
                  id="currentMembers"
                  {...register("currentMembers", { min: 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Gönder Butonu */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-accent hover:bg-yellow-600 text-white px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBandPostPage;