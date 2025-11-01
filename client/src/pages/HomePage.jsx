import { Link } from 'react-router-dom';
import { FaGuitar, FaDrum, FaMusic, FaSearch } from 'react-icons/fa';
import ListingCard from '../components/common/ListingCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// (import'ların altında)
// DEĞİŞİKLİK BURADA BAŞLIYOR: Fonksiyonu daha güvenli hale getirdik.
const fetchRecentListings = async () => {
  const { data } = await axios.get('/api/listings');

  // 1. Gelen 'data' doğrudan bir dizi (array) mi diye kontrol et
  if (Array.isArray(data)) {
    return data.slice(0, 4);
  }

  // 2. Değilse, 'data' içinde 'listings' adında bir dizi var mı diye kontrol et
  // (Backend'den genelde { listings: [...] } şeklinde gelir)
  if (Array.isArray(data.listings)) {
    return data.listings.slice(0, 4);
  }

  // 3. 'data' içinde 'data' adında bir dizi var mı diye kontrol et (diğer yaygın kalıp)
  if (Array.isArray(data.data)) {
    return data.data.slice(0, 4);
  }

  // 4. Hiçbirini bulamazsa, konsola hata bas ve boş bir dizi döndür.
  // Bu, .slice() hatası alıp 'isError' durumuna düşmeyi engeller.
  console.error("API'den beklenen veri yapısı alınamadı:", data);
  return []; 
};
// DEĞİŞİKLİK BURADA BİTİYOR

function LoadingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  
  const { 
    data: recentListings, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['recentListings'],
    queryFn: fetchRecentListings,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Müzik Aletini Al, Sat, Kirala
          </h1>
          <p className="text-xl mb-8 text-gray-100">
            Türkiye'nin en güvenilir müzik aleti pazarında binlerce ilan
          </p>
          

          {/* Hızlı Kategoriler */}
          
        </div>
      </section>

      {/* Kategoriler Section */}
      {/* Son İlanlar Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Son Eklenen İlanlar</h2>
          <Link to="/ilanlar" className="text-primary hover:underline font-semibold">
            Tümünü Gör →
          </Link>
        </div>

        {/* İlan Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Yüklenirken 4 tane iskelet (skeleton) göster
          <>
            <LoadingCardSkeleton />
            <LoadingCardSkeleton />
            <LoadingCardSkeleton />
            <LoadingCardSkeleton />
          </>
        ) : isError ? (
          // Hata varsa
          <p className="text-red-500">İlanlar yüklenirken bir hata oluştu.</p>
        ) : (
          // DEĞİŞİKLİK BURADA:
          // 'recentListings' null veya undefined ise hata vermemesi için
          // (recentListings ?? []) kullanarak boş bir diziye map yapmasını sağladık.
          (recentListings ?? []).map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))
        )}
      </div>
      </section>

      {/* Özellikler Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Neden MüzikPazar?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Özellik 1 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🔒
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenli Alışveriş</h3>
              <p className="text-gray-600">
                Doğrulanmış satıcılar ve güvenli ödeme sistemi
              </p>
            </div>

            {/* Özellik 2 */}
            <div className="text-center">
              <div className="bg-secondary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-2">Hızlı İletişim</h3>
              <p className="text-gray-600">
                Anlık mesajlaşma ile satıcıyla direkt iletişim
              </p>
            </div>

            {/* Özellik 3 */}
            <div className="text-center">
              <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🎵
              </div>
              <h3 className="text-xl font-semibold mb-2">Grup Bulma</h3>
              <p className="text-gray-600">
                Müzisyen arkadaşlar bul, grup kur
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Hemen İlan Ver, Sat!
          </h2>
          <p className="text-xl mb-8">
            Kullanmadığın enstrümanını değerinde sat, yeni alana bütçe oluştur
          </p>
          <Link 
            to="/ilan-ver" 
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Ücretsiz İlan Ver
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;