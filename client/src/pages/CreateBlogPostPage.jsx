// client/src/pages/CreateBlogPostPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPenAlt, FaImage, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// API isteğini yapacak fonksiyon
const createPostFn = async ({ formData, token }) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data', // Resim olduğu için
      Authorization: `Bearer ${token}`,
    },
  };
  // POST isteği at
  const res = await axios.post('/api/blogs', formData, config);
  return res.data;
};


function CreateBlogPostPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
     defaultValues: {
        category: 'Rehberler',
        readTime: '5 dakika',
     }
  });

  // Resim önizlemesi için (sonsuz döngü hatası düzeltilmiş hali)
  const imageFile = watch('image');
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    } else {
        setImagePreview(null);
    }
  }, [imageFile]);


  // Blog Yazısı Oluşturma (Mutation)
  const createMutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: (createdPost) => {
      toast.success('Yazı başarıyla yayınlandı!');
      queryClient.invalidateQueries(['blogPosts']);
      navigate(`/blog/${createdPost._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Yazı oluşturulurken bir hata oluştu');
    },
  });

  // FORM GÖNDERME (SUBMIT) MANTIĞI
  const onSubmit = (data) => {
    // 1. FORM DATASINI OLUŞTUR (Resim olduğu için)
    const formData = new FormData();

    // 2. Metin verilerini FormData'ya ekle
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);
    formData.append('readTime', data.readTime);

    // 3. Resim dosyasını FormData'ya ekle
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]); // 'image' (tekil), backend'deki upload.single('image') ile eşleşmeli
    } else {
      toast.error('Kapak fotoğrafı zorunludur');
      return;
    }

    // 4. Mutation'ı tetikle
    createMutation.mutate({ formData, token: userInfo.token });
  };

  const isSaving = createMutation.isLoading;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Yeni Blog Yazısı Oluştur
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
                  placeholder="Örn: En İyi 5 Akustik Gitar Teli"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSaving}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              {/* İçerik */}
              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                  İçerik (Markdown destekler)
                </label>
                <textarea
                  id="content"
                  {...register("content", { required: "İçerik zorunludur", minLength: { value: 100, message: "İçerik en az 100 karakter olmalı"} })}
                  rows="15"
                  placeholder="Yazınızı buraya yazın..."
                  className={`w-full px-4 py-3 border rounded-lg ${errors.content ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary resize-vertical`}
                  disabled={isSaving}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
              </div>
            </div>
          </div>

          {/* 2. Kapak Fotoğrafı */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaImage className="text-primary" /> Kapak Fotoğrafı
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <label 
                htmlFor="image" 
                className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Kapak Fotoğrafı Seç
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  {...register("image", { required: "Kapak fotoğrafı zorunludur" })}
                  className="hidden"
                  disabled={isSaving}
                />
              </label>
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
            </div>

            {/* Önizleme */}
            {imagePreview && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Önizleme:</p>
                <img
                  src={imagePreview}
                  alt="Kapak fotoğrafı önizlemesi"
                  className="w-full max-w-sm h-auto object-cover rounded-lg shadow"
                />
              </div>
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
                  placeholder="Örn: 5 dakika"
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
              {isSaving ? 'Yazı Yayınlanıyor...' : 'Yazıyı Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlogPostPage;