// client/src/pages/ListingsPage.jsx
import { useState, useEffect } from 'react';
import ListingCard from '../components/common/ListingCard';
import { FaFilter, FaThLarge, FaList } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

// Veri çekme fonksiyonu
const fetchListings = async (filters, page) => {
  const params = new URLSearchParams();
  
  // Filtreleri ekle
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all' && value !== '') {
      params.append(key, value);
    }
  });
  
  // Sayfa numarasını ekle
  params.append('page', page);
  
  // Backend'den artık { listings, page, totalPages, totalListings } objesi dönecek
  const { data } = await axios.get(`/api/listings?${params.toString()}`);
  return data;
};

function ListingsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Sayfa (Page) için state
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  
  const urlKeyword = searchParams.get('keyword') || '';

  // Filtre State'i
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    sortBy: 'newest',
    location: 'all',
    keyword: urlKeyword,
  });

  // URL'deki keyword veya sayfa değişirse, state'i de güncelle
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      keyword: urlKeyword
    }));
    setPage(Number(searchParams.get('page')) || 1);
  }, [urlKeyword, searchParams]);

  // React Query (Veri Çekme)
  const {
    data, // Gelen veri artık { listings, page, totalPages, totalListings }
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['listings', filters, page], // Sorguyu 'page' ve 'filters' değiştiğinde yenile
    queryFn: () => fetchListings(filters, page),
    keepPreviousData: true, // Yeni veri yüklenirken eskisini göstermeye devam et
  });
  
  // Gelen veriyi ayır
  const listings = data?.listings;       // İlanlar dizisi
  const totalPages = data?.totalPages;     // Toplam sayfa
  const totalListings = data?.totalListings; // Toplam ilan sayısı

  // Filtre 'select' VEYA 'input' kutuları değiştiğinde çalışacak fonksiyon
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
    setPage(1); // Filtre değiştiğinde 1. sayfaya dön
  };
  
  // Arama kelimesini temizle
  const clearKeyword = () => {
    setFilters(prev => ({...prev, keyword: ''}));
    setPage(1);
    navigate('/ilanlar'); // URL'i temizle
  };
  
  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Geçersiz sayfa
    setPage(newPage);
    
    // URL'i güncelle (mevcut filtreleri koruyarak)
    const params = new URLSearchParams(filters);
    params.set('page', newPage);
    // (navigate ile yapmak state'i tetikleyecektir, setSearchParams daha iyi olabilir)
    // setSearchParams(params); // Bu da bir yöntem
    navigate(`/ilanlar?${params.toString()}`);
    
    window.scrollTo(0, 0); // Sayfanın başına git
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Başlık ve View Mode (EKSİKSİZ) */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tüm İlanlar</h1>
            {!isLoading && totalListings != null && (
              <p className="text-gray-600 mt-1">{totalListings} ilan bulundu</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaList />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol Taraf - Filtreler (EKSİKSİZ) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaFilter className="text-primary" /> Filtreler
              </h2>
              
              {/* Arama Sonucu Göstergesi */}
              {filters.keyword && (
                <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">Arama sonucu:</p>
                  <strong className="text-primary break-words">{filters.keyword}</strong>
                  <button
                    onClick={clearKeyword}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    (Temizle)
                  </button>
                </div>
              )}

              {/* Kategori Filtresi */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="gitar">Gitarlar</option>
                  <option value="davul">Davullar</option>
                  <option value="klavye">Klavyeler</option>
                  <option value="ses-sistemi">Ses Sistemi</option>
                  <option value="yayli">Yaylı Çalgılar</option>
                  <option value="nefesli">Nefesli Çalgılar</option>
                </select>
              </div>

              {/* Fiyat Aralığı (Min/Max) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fiyat Aralığı (₺)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              
              {/* Konum Filtresi */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Şehir
                </label>
                <select
                  id="location"
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
              
              {/* Durum Filtresi */}
              <div className="mb-6">
                <label htmlFor="condition" className="block text-sm font-semibold text-gray-700 mb-2">Durum</label>
                <select
                  id="condition"
                  name="condition"
                  value={filters.condition}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tümü</option>
                  <option value="sifir">Sıfır</option>
                  <option value="sifir-gibi">Sıfır Gibi</option>
                  <option value="az-kullanilmis">Az Kullanılmış</option>
                  <option value="iyi-durumda">İyi Durumda</option>
                  <option value="eski">Eski</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - İlan Listesi (EKSİKSİZ) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
              <span className="text-gray-600">Sıralama:</span>
              <select
                id="sortBy"
                name="sortBy" 
                value={filters.sortBy} 
                onChange={handleFilterChange} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="price-low">Fiyat (Düşük → Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek → Düşük)</option>
              </select>
            </div>

            {/* Yükleniyor / Hata / Başarı Durumları */}
            {isLoading ? (
              <LoadingSpinner />
            ) : isError ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-red-600">Hata Oluştu</h3>
                <p className="text-gray-600">{error.response?.data?.message || error.message}</p>
              </div>
            ) : !listings || listings.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-700">İlan Bulunamadı</h3>
                <p className="text-gray-600">Bu filtrelere (veya aramanıza) uygun ilan bulunamadı.</p>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {listings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
                
                {/* GERÇEK SAYFALAMA (Pagination) */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    {/* Önceki Butonu */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Önceki
                    </button>
                    
                    {/* Sayfa Numarası Göstergesi */}
                    <span className="text-gray-700 font-semibold">
                      Sayfa {page} / {totalPages}
                    </span>
                    
                    {/* Sonraki Butonu */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingsPage;