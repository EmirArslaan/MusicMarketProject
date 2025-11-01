// client/src/pages/CreateListingPage.jsx
import { useState, useEffect } from 'react'; // <-- 1. useEffect'i import et
import { useForm } from 'react-hook-form';
import { FaUpload, FaGuitar, FaTags, FaDollarSign, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function CreateListingPage() {
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();
  const { userInfo } = useAuthStore(); 

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      category: '',
      condition: 'sifir-gibi',
      location: 'istanbul',
    },
  });

  const images = watch('images'); // 'images' input'unu izle

  // === HATA BURADAYDI - DÜZELTME ===
  // Resim önizlemelerini GÜVENLİ bir şekilde güncellemek için useEffect kullan
  useEffect(() => {
    if (images && images.length > 0) {
      if (images.length > 8) {
        toast.error('En fazla 8 resim yükleyebilirsiniz');
      }
      
      // Seçilen dosyalardan (File objects) URL oluştur
      const previews = Array.from(images)
        .map(file => URL.createObjectURL(file))
        .slice(0, 8); // Sadece ilk 8'i al

      // 'imagePreviews' state'ini güncelle
      setImagePreviews(previews);

      // (Opsiyonel) useEffect'ten çıkarken (unmount)
      // bellek sızıntısını önlemek için oluşturulan URL'leri temizle
      return () => {
        previews.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      // Resim seçilmemişse veya temizlenmişse önizlemeleri boşalt
      setImagePreviews([]);
    }
  }, [images]); // Bu useEffect'i SADECE 'images' (watch'tan gelen) değiştiğinde çalıştır
  // === DÜZELTME SONU ===


  // === FORM GÖNDERME (SUBMIT) MANTIĞI ===
  const onSubmit = async (data) => {
    // 1. Gerekli yetki (token) var mı?
    if (!userInfo || !userInfo.token) {
      toast.error('İlan vermek için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    // 2. FORM DATASINI OLUŞTUR
    const formData = new FormData();

    // 3. Metin verilerini FormData'ya ekle
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('subcategory', data.subcategory || '');
    formData.append('brand', data.brand);
    formData.append('condition', data.condition);
    formData.append('price', data.price);
    formData.append('location', data.location);

    // 4. Resim dosyalarını FormData'ya ekle
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < Math.min(data.images.length, 8); i++) {
        formData.append('images', data.images[i]);
      }
    } else {
      toast.error('En az 1 resim yüklemelisiniz');
      return;
    }

    // 5. API İSTEĞİNİ AT
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${userInfo.token}`, 
        },
      };

      const res = await axios.post('/api/listings', formData, config);

      // 6. BAŞARILI
      const createdListing = res.data;
      toast.success('İlan başarıyla oluşturuldu!');
      
      // 7. Kullanıcıyı oluşturulan yeni ilanın detay sayfasına yönlendir
      navigate(`/ilan/${createdListing._id}`);

    } catch (error) {
      // 8. HATA
      console.error('İlan oluşturma hatası:', error);
      toast.error(
        error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu'
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Yeni İlan Oluştur
        </h1>

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
                  disabled={isSubmitting}
                >
                  <option value="">Kategori Seçin...</option>
                  <option value="gitar">Gitar</option>
                  <option value="davul">Davul & Perküsyon</option>
                  <option value="klavye">Klavye</option>
                  <option value="ses-sistemi">Ses Sistemi & Stüdyo</option>
                  <option value="yayli">Yaylı Çalgılar</option>
                  <option value="nefesli">Nefesli Çalgılar</option>
                  <option value="diger">Diğer</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              {/* Alt Kategori (Opsiyonel) */}
              <div>
                <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-700 mb-2">
                  Alt Kategori (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="subcategory"
                  {...register("subcategory")}
                  placeholder="Örn: Elektro Gitar, Akustik Davul..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
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
                  {...register("title", { required: "İlan başlığı zorunludur", minLength: { value: 10, message: "Başlık en az 10 karakter olmalı" } })}
                  placeholder="Örn: Fender Stratocaster - Çok Temiz, Sıfır Ayarında"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSubmitting}
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
                  {...register("description", { required: "Açıklama zorunludur", minLength: { value: 30, message: "Açıklama en az 30 karakter olmalı" } })}
                  rows="6"
                  placeholder="Enstrümanın durumu, özellikleri, neden sattığınız gibi detayları yazın..."
                  className={`w-full px-4 py-3 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    <option value="sifir">Sıfır (Kutusu Açılmamış)</option>
                    <option value="sifir-gibi">Sıfır Gibi (Kutusu Açılmış)</option>
                    <option value="az-kullanilmis">Az Kullanılmış</option>
                    <option value="iyi-durumda">İyi Durumda</option>
                    <option value="eski">Eski (Kusurları var)</option>
                    <option value="arizali">Arızalı (Yedek parça)</option>
                  </select>
                  {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">Marka</label>
                  <input
                    type="text"
                    id="brand"
                    {...register("brand", { required: "Marka zorunludur" })}
                    placeholder="Örn: Fender, Yamaha, Roland..."
                    className={`w-full px-4 py-3 border rounded-lg ${errors.brand ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    disabled={isSubmitting}
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
                  {...register("price", { required: "Fiyat zorunludur", min: { value: 1, message: "Fiyat 0'dan büyük olmalı" } })}
                  placeholder="0"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                  <option value="bursa">Bursa</option>
                  <option value="antalya">Antalya</option>
                </select>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>
            </div>
          </div>

          {/* 4. Resim Yükleme */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaImage className="text-primary" /> Resimler
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <label 
                htmlFor="images" 
                className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Resim Seç (En fazla 8)
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  {...register("images", { required: "En az 1 resim zorunludur" })}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
              <p className="text-sm text-gray-500 mt-3">Sürükleyip bırakabilirsiniz</p>
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>}
            </div>
            
            {/* Önizlemeler */}
            {imagePreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {imagePreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Önizleme ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg shadow"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Gönder Butonu */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-accent hover:bg-yellow-600 text-white px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'İlan Yayınlanıyor...' : 'İlanı Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateListingPage;