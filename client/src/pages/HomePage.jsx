import { Link } from 'react-router-dom';
import { FaGuitar, FaDrum, FaMusic, FaSearch } from 'react-icons/fa';
import ListingCard from '../components/common/ListingCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// (import'ların altında)
const fetchRecentListings = async () => {
  // Sadece en son 4 ilanı çekmek için bir query param ekleyebiliriz (backend'de henüz yok ama ekleyeceğiz)
  // Şimdilik /api/listings'i kullanıyoruz
  const { data } = await axios.get('/api/listings');
  // Sadece en son 4 tanesini al
  return data.slice(0, 4); 
};

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
          
          {/* Arama Kutusu */}
          <div className="max-w-2xl mx-auto">
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
              <input
                type="text"
                placeholder="Ne aramıştınız? (Gitar, davul, klavye...)"
                className="flex-1 px-6 py-4 text-gray-800 focus:outline-none"
              />
              <button className="bg-accent text-white px-8 py-4 hover:bg-yellow-600 transition font-semibold">
                <FaSearch className="inline mr-2" />
                Ara
              </button>
            </div>
          </div>

          {/* Hızlı Kategoriler */}
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            <Link to="/kategori/gitar" className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full transition">
              Gitarlar
            </Link>
            <Link to="/kategori/davul" className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full transition">
              Davullar
            </Link>
            <Link to="/kategori/klavye" className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full transition">
              Klavyeler
            </Link>
            <Link to="/kategori/ses-sistemi" className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full transition">
              Ses Sistemleri
            </Link>
          </div>
        </div>
      </section>

      {/* Kategoriler Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Popüler Kategoriler
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Kategori Kartı 1 */}
          <Link to="/kategori/gitar" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition">
                <FaGuitar className="text-4xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gitarlar</h3>
              <p className="text-gray-600">250+ ilan</p>
            </div>
          </Link>

          {/* Kategori Kartı 2 */}
          <Link to="/kategori/davul" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 text-center">
              <div className="bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition">
                <FaDrum className="text-4xl text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Davullar</h3>
              <p className="text-gray-600">180+ ilan</p>
            </div>
          </Link>

          {/* Kategori Kartı 3 */}
          <Link to="/kategori/klavye" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 text-center">
              <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition">
                <FaMusic className="text-4xl text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Klavyeler</h3>
              <p className="text-gray-600">120+ ilan</p>
            </div>
          </Link>

          {/* Kategori Kartı 4 */}
          <Link to="/kategori/ses-sistemi" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <FaMusic className="text-4xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ses Sistemleri</h3>
              <p className="text-gray-600">95+ ilan</p>
            </div>
          </Link>
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

      {/* Son İlanlar Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Son Eklenen İlanlar</h2>
          <Link to="/ilanlar" className="text-primary hover:underline font-semibold">
            Tümünü Gör →
          </Link>
        </div>

        {/* İlan Grid */}
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
          // Başarılıysa: Veriyi map'le (döngüye al)
          recentListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))
        )}
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