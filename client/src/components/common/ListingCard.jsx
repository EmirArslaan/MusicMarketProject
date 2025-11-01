// client/src/components/common/ListingCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // useQueryClient eklendi
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

// Favori toggle API isteğini yapacak fonksiyon
const toggleFavoriteFn = async ({ listingId, token }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  // Yol /api/users/favorites olmalı
  const { data: userData } = await axios.put(`/api/users/favorites`, { listingId }, config);
  return userData; // Backend'den güncel favori listesini içeren objeyi döndür
};


function ListingCard({ listing }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Query Client'ı al
  
  // Global state'ten GEREKLİ bilgileri al
  const { userInfo, updateFavorites } = useAuthStore();
  const token = userInfo?.token;

  // Bu karttaki ilan favorilerde mi?
  // (Kapsamlı kontrol: 'fav' bir string ID olabilir veya populate edilmiş bir obje olabilir)
  const isFavorited = !!userInfo?.favoriteListings?.find(
    (fav) => (fav._id || fav).toString() === listing._id.toString()
  );
  
  // Favori Ekle/Çıkar MUTATION'ını ayarla
  const favoriteMutation = useMutation({
    mutationFn: toggleFavoriteFn,
    onSuccess: (data) => {
      // 1. Zustand state'ini (anlık UI için) güncelle
      updateFavorites(data.favoriteListings);
      toast.success(data.message);
      
      // 2. 'myFavorites' sorgusunu (Favorilerim sayfası) geçersiz kıl
      queryClient.invalidateQueries(['myFavorites', userInfo?._id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    },
  });

  // Kalp ikonuna tıklama fonksiyonu
  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Link'e tıklamayı engelle
    e.stopPropagation(); // Olayın dışarı taşmasını engelle

    // Giriş yapmış mı?
    if (!token) {
      toast.error('Favorilere eklemek için giriş yapmalısınız.');
      navigate('/login');
      return;
    }
    
    // Mutation'ı tetikle
    favoriteMutation.mutate({ listingId: listing._id, token });
  };


  // --- JSX (Görünüm) ---
  
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0].url
    : 'https://via.placeholder.com/400x300?text=Enstrüman';

  const timeAgo = listing.createdAt
    ? formatDistanceToNow(parseISO(listing.createdAt), { addSuffix: true, locale: tr })
    : '';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">
      {/* Resim Bloğu (EKSİKSİZ) */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img 
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
        
        <button 
          onClick={handleFavoriteClick}
          disabled={favoriteMutation.isLoading}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full transition disabled:opacity-50"
        >
          <FaHeart 
            className={`text-xl ${
              isFavorited ? 'text-red-500' : 'text-gray-400'
            } hover:text-red-500 transition`} 
          />
        </button>
        
        {listing.condition && (
          <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
            {listing.condition.replace('-', ' ')}
          </span>
        )}
      </div>

      {/* İçerik Bloğu (EKSİKSİZ) */}
      <Link to={`/ilan/${listing._id}`} className="block p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition">
          {listing.title}
        </h3>
        <div className="flex items-center text-gray-500 text-sm mb-3 capitalize">
          <FaMapMarkerAlt className="mr-1" />
          <span>{listing.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">
            {listing.price.toLocaleString('tr-TR')} ₺
          </span>
          <span className="text-sm text-gray-400">
            {timeAgo}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default ListingCard;