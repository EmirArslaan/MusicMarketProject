// client/src/pages/EditListingPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaGuitar, FaTags, FaDollarSign, FaImage } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';

// 1. Mevcut ilanın verisini çeken fonksiyon
const fetchListing = async (listingId) => {
  const { data } = await axios.get(`/api/listings/${listingId}`);
  return data;
};

// 2. Güncelleme API isteğini yapacak fonksiyon
const updateListingFn = async ({ listingId, data, token }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json', // Resim göndermediğimiz için JSON
      Authorization: `Bearer ${token}`,
    },
  };
  // PUT isteği at
  const res = await axios.put(`/api/listings/${listingId}`, data, config);
  return res.data;
};


function EditListingPage() {
  const { id: listingId } = useParams(); // URL'den ilanın ID'sini al
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();

  // 3. Mevcut ilan verisini çekmek için useQuery
  const { 
    data: listingData, 
    isLoading: isLoadingListing,
    isError,
    error
  } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => fetchListing(listingId),
  });

  // 4. react-hook-form'u ayarla
  const {
    register,
    handleSubmit,
    reset, // Formu resetlemek için
    formState: { errors, isSubmitting },
  } = useForm();

  // 5. Veri yüklendiğinde, formu o verilerle DOLDUR
  useEffect(() => {
    if (listingData) {
      reset(listingData); // Formu backend'den gelen veriyle doldur
    }
  }, [listingData, reset]);

  // 6. Güncelleme (UPDATE) MUTATION'INI AYARLA
  const updateMutation = useMutation({
    mutationFn: updateListingFn,
    onSuccess: (updatedListing) => {
      toast.success('İlan başarıyla güncellendi!');

      // Önbelleği (cache) temizle ki değişiklikler görünsün
      queryClient.invalidateQueries(['listing', updatedListing._id]);
      queryClient.invalidateQueries(['myListings', userInfo?._id]);

      // Kullanıcıyı güncellenen ilanın detay sayfasına yönlendir
      navigate(`/ilan/${updatedListing._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İlan güncellenirken bir hata oluştu');
    },
  });

  // 7. FORM GÖNDERME (SUBMIT) MANTIĞI
  const onSubmit = (data) => {
    // 'data' react-hook-form'dan gelen güncel veridir
    // Resim verisi göndermediğimiz için FormData'ya gerek yok
    updateMutation.mutate({ listingId, data, token: userInfo.token });
  };

  if (isLoadingListing) {
    return <LoadingSpinner fullPage />;
  }
  if (isError) {
    return <p className="text-red-500">Hata: {error.message}</p>;
  }

  // isSubmitting'i hem formun hem de mutation'ın durumuna bağla
  const isSaving = isSubmitting || updateMutation.isLoading;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          İlanı Düzenle
        </h1>

        {/* Formun onSubmit'i artık updateMutation'ı tetikliyor */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* 1. Kategori Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaGuitar className="text-primary" /> Kategori Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kategori */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  id="category"
                  {...register("category", { required: "Kategori seçimi zorunudur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                >
                  <option value="">Kategori Seçin...</option>
                  <option value="gitar">Gitar</option>
                  <option value="davul">Davul & Perküsyon</option>
                  {/* ... diğer kategoriler ... */}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>
              {/* Alt Kategori */}
              <div>
                <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-700 mb-2">
                  Alt Kategori (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="subcategory"
                  {...register("subcategory")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* 2. İlan Detayları */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaTags className="text-primary" /> İlan Detayları
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

              {/* Marka ve Durum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="condition" className="block text-sm font-semibold text-gray-700 mb-2">Durum</label>
                  <select
                    id="condition"
                    {...register("condition", { required: "Durum seçimi zorunludur" })}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.condition ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    disabled={isSaving}
                  >
                    <option value="sifir">Sıfır</option>
                    <option value="sifir-gibi">Sıfır Gibi</option>
                    <option value="az-kullanilmis">Az Kullanılmış</option>
                    <option value="iyi-durumda">İyi Durumda</option>
                  </select>
                  {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">Marka</label>
                  <input
                    type="text"
                    id="brand"
                    {...register("brand", { required: "Marka zorunludur" })}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.brand ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    disabled={isSaving}
                  />
                  {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fiyat ve Konum */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaDollarSign className="text-primary" /> Fiyat ve Konum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fiyat */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">Fiyat (₺)</label>
                <input
                  type="number"
                  id="price"
                  {...register("price", { required: "Fiyat zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>
              {/* Konum */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">Konum (Şehir)</label>
                <select
                  id="location"
                  {...register("location", { required: "Konum seçimi zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                >
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  {/* ... diğer şehirler ... */}
                </select>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>
            </div>
          </div>

          {/* 4. Resim Yükleme (ŞİMDİLİK DEVRE DIŞI) */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaImage className="text-primary" /> Resimler
            </h2>
            <p className="text-gray-600">
              Mevcut resimleriniz (Resim düzenleme özelliği yakında eklenecektir):
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {listingData?.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Önizleme ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg shadow"
                />
              ))}
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

export default EditListingPage;