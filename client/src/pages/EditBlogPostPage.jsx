// client/src/pages/EditBlogPostPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPenAlt, FaImage, FaClock } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';

// 1. Mevcut yazının verisini çeken fonksiyon
const fetchPost = async (postId) => {
  const { data } = await axios.get(`/api/blogs/${postId}`);
  return data;
};

// 2. Güncelleme API isteğini yapacak fonksiyon
const updatePostFn = async ({ postId, data, token }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json', // Resim göndermediğimiz için JSON
      Authorization: `Bearer ${token}`,
    },
  };
  // PUT isteği at
  const res = await axios.put(`/api/blogs/${postId}`, data, config);
  return res.data;
};


function EditBlogPostPage() {
  const { id: postId } = useParams(); // URL'den post ID'sini al
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();

  // 3. Mevcut yazı verisini çekmek için useQuery
  const { 
    data: postData, 
    isLoading: isLoadingPost,
    isError,
    error
  } = useQuery({
    queryKey: ['blogPost', postId], // Zaten detay sayfasından cache'lenmiş olabilir
    queryFn: () => fetchPost(postId),
  });

  // 4. react-hook-form'u ayarla
  const {
    register,
    handleSubmit,
    reset, // Formu resetlemek için
    formState: { errors },
  } = useForm();

  // 5. Veri yüklendiğinde, formu o verilerle DOLDUR
  useEffect(() => {
    if (postData) {
      reset(postData); // Formu backend'den gelen veriyle doldur
    }
  }, [postData, reset]);

  // 6. Güncelleme (UPDATE) MUTATION'INI AYARLA
  const updateMutation = useMutation({
    mutationFn: updatePostFn,
    onSuccess: (updatedPost) => {
      toast.success('Yazı başarıyla güncellendi!');

      // Önbelleği (cache) temizle
      queryClient.invalidateQueries(['blogPost', updatedPost._id]);
      queryClient.invalidateQueries(['myBlogPosts', userInfo?._id]);

      navigate(`/blog/${updatedPost._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Yazı güncellenirken bir hata oluştu');
    },
  });

  // 7. FORM GÖNDERME (SUBMIT) MANTIĞI
  const onSubmit = (data) => {
    // 'data' react-hook-form'dan gelen güncel veridir
    updateMutation.mutate({ postId, data, token: userInfo.token });
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
          Blog Yazısını Düzenle
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* 1. İçerik Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaPenAlt className="text-primary" /> Yazı İçeriği
            </h2>
            <div className="space-y-6">
              {/* Başlık */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Yazı Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title", { required: "Başlık zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              {/* İçerik */}
              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                  İçerik
                </label>
                <textarea
                  id="content"
                  {...register("content", { required: "İçerik zorunludur" })}
                  rows="15"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.content ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary resize-vertical`}
                  disabled={isSaving}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
              </div>
            </div>
          </div>

          {/* 2. Kapak Fotoğrafı (DEVRE DIŞI) */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaImage className="text-primary" /> Kapak Fotoğrafı
            </h2>
            <p className="text-gray-600">
              Mevcut kapak fotoğrafı (Resim düzenleme yakında eklenecektir):
            </p>
            {postData?.image && (
              <img
                src={postData.image.url}
                alt="Kapak fotoğrafı"
                className="mt-4 w-full max-w-sm h-auto object-cover rounded-lg shadow"
              />
            )}
          </div>

          {/* 3. Detaylar */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaClock className="text-primary" /> Yazı Detayları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kategori */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <select
                  id="category"
                  {...register("category", { required: "Kategori zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                >
                  <option value="Rehberler">Rehberler</option>
                  <option value="Teknik">Teknik</option>
                  <option value="Stüdyo">Stüdyo</option>
                  <option value="Bakım">Bakım</option>
                  <option value="Sosyal">Sosyal</option>
                  <option value="İnceleme">İnceleme</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              {/* Okunma Süresi */}
              <div>
                <label htmlFor="readTime" className="block text-sm font-semibold text-gray-700 mb-2">Okunma Süresi</label>
                <input
                  type="text"
                  id="readTime"
                  {...register("readTime", { required: "Okunma süresi zorunludur" })}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.readTime ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                />
                {errors.readTime && <p className="text-red-500 text-sm mt-1">{errors.readTime.message}</p>}
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

export default EditBlogPostPage;