// client/src/pages/FavoritesPage.jsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ListingCard from '../components/common/ListingCard'; // 1. İlan kartını kullanacağız

// 2. API'dan favorileri çeken fonksiyon
const fetchMyFavorites = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Yeni API yolumuza (GET /api/users/favorites) istek at
  const { data } = await axios.get('/api/users/favorites', config);
  return data;
};


function FavoritesPage() {
  const { userInfo } = useAuthStore();

  // 3. React Query ile favorileri çek
  const { 
    data: favoriteListings, 
    isLoading, 
    isError,
    error
  } = useQuery({
    // Bu sorgu, 'myFavorites' + kullanıcı ID'si ile benzersiz olmalı
    queryKey: ['myFavorites', userInfo?._id], 
    queryFn: () => fetchMyFavorites(userInfo.token),
    enabled: !!userInfo, // Sadece giriş yapmışsa çalıştır
  });

  // 4. Yüklenme durumu
  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  // 5. Hata durumu
  if (isError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Hata Oluştu</h2>
        <p className="text-gray-600">{error.response?.data?.message || error.message}</p>
      </div>
    );
  }

  // 6. Başarılı durum
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Favori İlanlarım
        </h1>

        {favoriteListings && favoriteListings.length === 0 ? (
          // 7. Favori yoksa
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold">Henüz favori ilanınız yok</h3>
            <p className="text-gray-600 mt-2">İlanları gezin ve beğendiklerinizi favorilerinize ekleyin.</p>
            <Link 
              to="/ilanlar" 
              className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              İlanları Keşfet
            </Link>
          </div>
        ) : (
          // 8. Favoriler varsa (ListingCard kullanarak listele)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteListings && favoriteListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;