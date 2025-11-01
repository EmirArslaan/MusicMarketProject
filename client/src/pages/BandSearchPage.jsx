// client/src/pages/BandSearchPage.jsx
import { useState } from 'react';
import BandCard from '../components/common/BandCard';
import { FaFilter, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // 1. Import
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner'; // 2. Import

// 3. API'dan veri çekme fonksiyonu (Filtrelerle)
const fetchBandPosts = async (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all' && value !== '') {
      params.append(key, value);
    }
  });
  
  const { data } = await axios.get(`/api/bands?${params.toString()}`);
  return data;
};

function BandSearchPage() {
  // 4. Filtreler için tek state
  const [filters, setFilters] = useState({
    type: 'all',
    genres: 'all',
    lookingFor: 'all',
    location: 'all',
  });

  // 5. React Query ile veri çek
  const {
    data: bandPosts, // 'bands' yerine 'bandPosts'
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['bandPosts', filters], // Filtreler değişince yeniden çek
    queryFn: () => fetchBandPosts(filters),
    keepPreviousData: true,
  });

  // 6. SAHTE VERİYİ SİLDİK

  // 7. Filtre 'select' kutuları değiştiğinde çalışacak fonksiyon
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Grup Ara & Müzisyen Bul</h1>
          <p className="text-xl text-gray-100 mb-8">
            Hayalindeki grubu kur veya grubuna yeni üyeler bul
          </p>
          <Link
            to="/grup-ilani-ver" // (Bu sayfayı henüz oluşturmadık)
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            <FaPlus />
            İlan Ver
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Başlık */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Aktif İlanlar</h2>
          {!isLoading && bandPosts && (
            <p className="text-gray-600 mt-1">{bandPosts.length} ilan bulundu</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol Taraf - Filtreler (GÜNCELLENDİ) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaFilter className="text-primary" /> Filtreler
              </h3>
              
              {/* İlan Tipi */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İlan Tipi
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tümü</option>
                  <option value="Müzisyen Aranıyor">Müzisyen Aranıyor</option>
                  <option value="Grup Kuruluyor">Grup Kuruluyor</option>
                  <option value="Partner Aranıyor">Partner Aranıyor</option>
                </select>
              </div>

              {/* Müzik Türü */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Müzik Türü
                </label>
                <select
                  name="genres"
                  value={filters.genres}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm Türler</option>
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Blues">Blues</option>
                  <option value="Metal">Metal</option>
                  <option value="Funk">Funk</option>
                  <option value="Indie">Indie</option>
                </select>
              </div>

              {/* Aranan Enstrüman */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aranan Pozisyon
                </label>
                <select
                  name="lookingFor"
                  value={filters.lookingFor}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tümü</option>
                  <option value="Gitarist">Gitarist</option>
                  <option value="Basçı">Basçı</option>
                  <option value="Davulcu">Davulcu</option>
                  <option value="Klavyeci">Klavyeci</option>
                  <option value="Vokal">Vokal</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              {/* Şehir */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şehir
                </label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm Şehirler</option>
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                  <option value="bursa">Bursa</option>
                  <option value="antalya">Antalya</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - İlanlar (GÜNCELLENDİ) */}
          <div className="lg:col-span-3">
            {/* 8. YÜKLENİYOR / HATA / BAŞARI DURUMLARI */}
            {isLoading ? (
              <LoadingSpinner />
            ) : isError ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-red-600">Hata Oluştu</h3>
                <p className="text-gray-600">{error.response?.data?.message || error.message}</p>
              </div>
            ) : bandPosts.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-700">İlan Bulunamadı</h3>
                <p className="text-gray-600">Bu filtrelere uygun grup ilanı bulunamadı.</p>
              </div>
            ) : (
              // Başarılıysa: Gerçek veriyi listele
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {bandPosts.map((band) => (
                    <BandCard key={band._id} band={band} />
                  ))}
                </div>
                {/* Pagination (Şimdilik sahte) */}
                <div className="flex justify-center gap-2">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BandSearchPage;