// client/src/pages/BandDetailPage.jsx
import { useParams, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaMusic, FaUsers, FaClock, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query'; // 1. Import
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner'; // 2. Import
import { format, parseISO } from 'date-fns'; // 3. Import
import { tr } from 'date-fns/locale';

// 4. API'dan veri çekme fonksiyonu
const fetchBandPost = async (postId) => {
  const { data } = await axios.get(`/api/bands/${postId}`);
  return data;
};

function BandDetailPage() {
  const { id: postId } = useParams(); // URL'den post ID'sini al

  // 5. REACT QUERY KULLANIMI
  const {
    data: post, // 'band' yerine 'post' (yazı)
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['bandPost', postId], // Bu sorgu için benzersiz anahtar
    queryFn: () => fetchBandPost(postId), // Veriyi çeken fonksiyon
  });

  // 6. YÜKLENİYOR DURUMU
  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  // 7. HATA DURUMU
  if (isError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Hata Oluştu</h2>
        <p className="text-gray-600">{error.response?.data?.message || error.message}</p>
        <Link to="/grup-ara" className="text-primary hover:underline mt-4 inline-block">Grup Arama Sayfasına Dön</Link>
      </div>
    );
  }

  // 8. BAŞARILI DURUM (Veri yüklendi)
  
  // Güvenlik kontrolleri ve tarih formatlama
  const authorName = post.user?.name || 'Anonim';
  const authorAvatar = post.user?.avatar || 'https://ui-avatars.com/api/?name=K+U';
  const authorJoinDate = post.user?.createdAt 
    ? format(parseISO(post.user.createdAt), 'yyyy', { locale: tr }) 
    : '';
  const postDate = post.createdAt 
    ? format(parseISO(post.createdAt), 'dd MMMM yyyy', { locale: tr })
    : 'Bilinmiyor';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb (Gerçek veriyle) */}
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">Ana Sayfa</Link> / 
          <Link to="/grup-ara" className="hover:underline"> Grup Ara</Link> / 
          <span className="text-gray-800 font-semibold"> {post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Taraf - Detaylar (Gerçek veriyle) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ana Bilgiler */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <span className="inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {post.type}
              </span>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {post.title}
              </h1>
              {/* Bilgiler */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" />
                  <span className="capitalize">{post.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-primary" />
                  <span>{postDate} yayınlandı</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-primary" />
                  <span>{post.currentMembers} mevcut üye</span>
                </div>
              </div>

              {/* Aranan Pozisyonlar */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FaMusic className="text-primary" /> Aranan Pozisyonlar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.lookingFor.map((instrument, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>

              {/* Müzik Türleri */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Müzik Türleri</h3>
                <div className="flex flex-wrap gap-2">
                  {post.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-secondary/10 text-secondary px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Detaylı Açıklama</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Ek Bilgiler */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Ek Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Deneyim Seviyesi:</span>
                  <p className="font-semibold">{post.experienceLevel}</p>
                </div>
                <div>
                  <span className="text-gray-600">Konum:</span>
                  <p className="font-semibold capitalize">{post.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - İletişim (Gerçek veriyle) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-4">İlan Sahibi</h3>
              {/* İlan Sahibi */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-lg">{authorName}</h4>
                  <p className="text-sm text-gray-600">
                    Üyelik: {authorJoinDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    E-posta: {post.user.email}
                  </p>
                </div>
              </div>
              
              {/* İletişim Butonları */}
              <button className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mb-3 transition flex items-center justify-center gap-2">
                <FaEnvelope />
                Mesaj Gönder (Yakında)
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                <FaPhone />
                İletişim Bilgilerini Göster (Yakında)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BandDetailPage;