// client/src/pages/ListingDetailPage.jsx
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaShareAlt, FaFlag, FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; // 1. useQuery'yi import et
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns'; // 2. Tarih formatı için
import { tr } from 'date-fns/locale'; // 3. Tarih için Türkçe dil desteği

// 4. React Query için veri çekme (fetch) fonksiyonu
const fetchListing = async (listingId) => {
  // Proxy sayesinde tam URL yazmıyoruz
  const { data } = await axios.get(`/api/listings/${listingId}`);
  return data;
};

// 5. Yükleniyor (Loading) durumunda gösterilecek component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function ListingDetailPage() {
  const { id } = useParams(); // URL'den ID'yi al
  const [mainImage, setMainImage] = useState(0);

  // 6. REACT QUERY KULLANIMI
  // 'listing:id' -> Bu sorgu için benzersiz bir anahtar
  // () => fetchListing(id) -> Veriyi çeken fonksiyon
  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id),
  });

  // 7. YÜKLENİYOR DURUMU
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 8. HATA DURUMU
  if (isError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Hata Oluştu</h2>
        <p className="text-gray-600">{error.response?.data?.message || error.message}</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  // 9. BAŞARILI DURUM (Veri yüklendi)
  // 'listing' objesi artık backend'den gelen gerçek veriyi içeriyor.
  
  // Tarihi formatla ("3 gün önce", "5 saat önce" gibi)
  const timeAgo = listing.createdAt 
    ? formatDistanceToNow(parseISO(listing.createdAt), { addSuffix: true, locale: tr })
    : 'Bilinmiyor';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb (Gerçek veriyle) */}
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">Ana Sayfa</Link> / 
          <Link to="/ilanlar" className="hover:underline"> İlanlar</Link> / 
          <span className="text-gray-800 font-semibold"> {listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Taraf - Resimler ve Detaylar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resim Galerisi (Gerçek veriyle) */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Ana Resim */}
              <div className="relative h-96 bg-gray-200">
                <img
                  src={listing.images[mainImage].url} // <- Gerçek veri
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
                {/* Favori ve Paylaş Butonları */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white/90 hover:bg-white p-3 rounded-full transition shadow-lg">
                    <FaHeart className="text-gray-600 hover:text-red-500 transition" />
                  </button>
                  <button className="bg-white/90 hover:bg-white p-3 rounded-full transition shadow-lg">
                    <FaShareAlt className="text-gray-600 hover:text-primary transition" />
                  </button>
                </div>
              </div>
              {/* Thumbnail'ler (Gerçek veriyle) */}
              <div className="p-4 flex gap-2 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={image.public_id} // <- Gerçek veri
                    onClick={() => setMainImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      mainImage === index ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image.url} alt={`Görsel ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Açıklama (Gerçek veriyle) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Açıklama</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Detaylar (Gerçek veriyle) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Detaylar</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Kategori:</span>
                  <p className="font-semibold capitalize">{listing.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Marka:</span>
                  <p className="font-semibold">{listing.brand}</p>
                </div>
                <div>
                  <span className="text-gray-600">Durum:</span>
                  <p className="font-semibold capitalize">{listing.condition.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Konum:</span>
                  <p className="font-semibold capitalize">{listing.location}</p>
                </div>
                <div>
                  <span className="text-gray-600">İlan No:</span>
                  <p className="font-semibold">#{listing._id.slice(-6)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Görüntülenme:</span>
                  <p className="font-semibold">{listing.views} kez</p>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-2 text-red-600 hover:text-red-700 transition">
              <FaFlag />
              <span>Bu ilanı şikayet et</span>
            </button>
          </div>

          {/* Sağ Taraf - Fiyat ve Satıcı (Gerçek veriyle) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Fiyat Kutusu */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="text-4xl font-bold text-primary mb-4">
                {listing.price.toLocaleString('tr-TR')} ₺
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-6">
                <FaClock className="mr-2" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-6">
                <FaMapMarkerAlt className="mr-2" />
                <span className="capitalize">{listing.location}</span>
              </div>
              <button className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mb-3 transition">
                <FaEnvelope className="inline mr-2" /> Mesaj Gönder
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                <FaPhone />
                Ara (Yakında)
              </button>
            </div>

            {/* Satıcı Bilgileri (Gerçek veriyle) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Satıcı Bilgileri</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={listing.user.avatar}
                  alt={listing.user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-lg">{listing.user.name}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-500 mr-1">★</span>
                    {/* (Rating eklendiğinde buraya gelecek) */}
                    Henüz değerlendirme yok
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">E-posta:</span>
                  <span className="font-semibold">{listing.user.email}</span>
                </div>
                {/* ... Diğer satıcı bilgileri ... */}
              </div>
              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition">
                Tüm İlanlarını Gör
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetailPage;