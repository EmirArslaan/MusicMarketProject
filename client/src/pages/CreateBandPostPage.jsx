// client/src/pages/CreateBandPostPage.jsx
import { useForm, Controller } from 'react-hook-form';
import { FaUsers, FaMusic, FaMapMarkerAlt, FaDrum } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Select from 'react-select'; // Çoklu seçim için 'react-select' kullanacağız

// 1. react-select için stil objesi (opsiyonel)
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

// 2. Çoklu seçim opsiyonları
const genreOptions = [
  { value: 'Rock', label: 'Rock' },
  { value: 'Pop', label: 'Pop' },
  { value: 'Jazz', label: 'Jazz' },
  { value: 'Blues', label: 'Blues' },
  { value: 'Metal', label: 'Metal' },
  { value: 'Funk', label: 'Funk' },
  { value: 'Indie', label: 'Indie' },
  { value: 'Akustik', label: 'Akustik' },
];

const instrumentOptions = [
  { value: 'Gitarist', label: 'Gitarist' },
  { value: 'Basçı', label: 'Basçı' },
  { value: 'Davulcu', label: 'Davulcu' },
  { value: 'Vokal', label: 'Vokal' },
  { value: 'Klavyeci', label: 'Klavyeci' },
  { value: 'Saksafoncu', label: 'Saksafoncu' },
  { value: 'Diğer', label: 'Diğer' },
];


// 3. API isteğini yapacak fonksiyon
const createBandPostFn = async ({ data, token }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json', // Bu kez JSON (resim yok)
      Authorization: `Bearer ${token}`,
    },
  };
  // POST isteği at
  const res = await axios.post('/api/bands', data, config);
  return res.data;
};


function CreateBandPostPage() {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control, // react-select için
    formState: { errors },
  } = useForm({
     defaultValues: {
        type: 'Müzisyen Aranıyor',
        location: 'istanbul',
        experienceLevel: 'Farketmez',
        currentMembers: 1,
     }
  });

  // 4. Grup İlanı Oluşturma (Mutation)
  const createMutation = useMutation({
    mutationFn: createBandPostFn,
    onSuccess: (createdPost) => {
      toast.success('Grup ilanı başarıyla yayınlandı!');
      // İlgili sorguları geçersiz kıl (yenilensinler)
      queryClient.invalidateQueries(['bandPosts']);
      // Kullanıcıyı yeni ilanın detay sayfasına yönlendir
      navigate(`/grup-ara/${createdPost._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu');
    },
  });

  // 5. FORM GÖNDERME (SUBMIT) MANTIĞI
  const onSubmit = (data) => {
    // react-select'ten gelen veriyi (örn: [{value: 'Rock', label: 'Rock'}])
    // backend'in beklediği formata (örn: ['Rock']) dönüştür
    const formattedData = {
      ...data,
      genres: data.genres ? data.genres.map(g => g.value) : [],
      lookingFor: data.lookingFor ? data.lookingFor.map(i => i.value) : [],
    };

    createMutation.mutate({ data: formattedData, token: userInfo.token });
  };

  const isSaving = createMutation.isLoading;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Grup İlanı Oluştur
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* 1. Temel Bilgiler */}
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
                  placeholder="Örn: Rock Grubu İçin Acil Bas Gitarist Aranıyor"
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
                  placeholder="Grubunuzu tanıtın, ne aradığınızı, prova sıklığınızı vb. detayları yazın..."
                  className={`w-full px-4 py-3 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                  disabled={isSaving}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* 2. Detaylar */}
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
                  defaultValue="1"
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
              {isSaving ? 'İlan Yayınlanıyor...' : 'Grup İlanı Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBandPostPage;