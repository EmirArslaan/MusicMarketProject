// client/src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaEdit, FaTrash, FaClipboardList, FaPenSquare, FaUsers } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast'; 

// === API FONKSİYONLARI ===

// Profil bilgilerini çeken
const fetchProfile = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/users/profile', config);
  return data;
};
// Kullanıcının İLANLARINI çeken
const fetchMyListings = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/listings/my-listings', config);
  return data;
};
// Kullanıcının BLOG YAZILARINI çeken
const fetchMyBlogPosts = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/blogs/my-posts', config);
  return data;
};
// Kullanıcının GRUP İLANLARINI çeken
const fetchMyBandPosts = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/bands/my-posts', config);
  return data;
};
// İlan SİLME
const deleteListingFn = async ({ listingId, token }) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.delete(`/api/listings/${listingId}`, config);
  return data;
};
// Blog Yazısı SİLME
const deleteBlogPostFn = async ({ postId, token }) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.delete(`/api/blogs/${postId}`, config);
  return data;
};
// Grup İlanı SİLME
const deleteBandPostFn = async ({ postId, token }) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.delete(`/api/bands/${postId}`, config);
  return data;
};


function ProfilePage() {
  const [activeTab, setActiveTab] = useState('listings'); // Varsayılan sekme
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // === SORGULAR (QUERIES) ===
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', userInfo?._id],
    queryFn: () => fetchProfile(userInfo.token),
    enabled: !!userInfo,
  });

  const { data: myListings, isLoading: isLoadingListings } = useQuery({
    queryKey: ['myListings', userInfo?._id],
    queryFn: () => fetchMyListings(userInfo.token),
    enabled: !!userInfo,
  });

  const { data: myBlogPosts, isLoading: isLoadingBlogPosts } = useQuery({
    queryKey: ['myBlogPosts', userInfo?._id],
    queryFn: () => fetchMyBlogPosts(userInfo.token),
    enabled: !!userInfo,
  });
  
  const { data: myBandPosts, isLoading: isLoadingBandPosts } = useQuery({
    queryKey: ['myBandPosts', userInfo?._id],
    queryFn: () => fetchMyBandPosts(userInfo.token),
    enabled: !!userInfo,
  });

  // === MUTASYONLAR (MUTATIONS) ===
  const deleteListingMutation = useMutation({
    mutationFn: deleteListingFn,
    onSuccess: (data) => {
      toast.success(data.message || 'İlan silindi');
      queryClient.invalidateQueries(['myListings', userInfo?._id]);
      queryClient.invalidateQueries(['profile', userInfo?._id]);
    },
    onError: (error) => { // <-- DÜZELTİLDİ (Boş değildi)
      toast.error(error.response?.data?.message || 'İlan silinirken bir hata oluştu');
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: deleteBlogPostFn,
    onSuccess: (data) => {
      toast.success(data.message || 'Yazı silindi');
      queryClient.invalidateQueries(['myBlogPosts', userInfo?._id]);
    },
    onError: (error) => { // <-- DÜZELTİLDİ (Boş değildi)
      toast.error(error.response?.data?.message || 'Yazı silinirken bir hata oluştu');
    },
  });
  
  const deleteBandPostMutation = useMutation({
    mutationFn: deleteBandPostFn,
    onSuccess: (data) => {
      toast.success(data.message || 'Grup ilanı silindi');
      queryClient.invalidateQueries(['myBandPosts', userInfo?._id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Grup ilanı silinirken bir hata oluştu');
    },
  });

  // === HANDLER (İŞLEV) FONKSİYONLARI ===
  const handleListingDelete = (listingId) => {
    if (window.confirm('İlanı silmek istediğinizden emin misiniz?')) {
      deleteListingMutation.mutate({ listingId, token: userInfo.token });
    }
  };
  const handleBlogDelete = (postId) => {
    if (window.confirm('Blog yazısını silmek istediğinizden emin misiniz?')) {
      deleteBlogPostMutation.mutate({ postId, token: userInfo.token });
    }
  };
  const handleBandPostDelete = (postId) => {
    if (window.confirm('Grup ilanını silmek istediğinizden emin misiniz?')) {
      deleteBandPostMutation.mutate({ postId, token: userInfo.token });
    }
  };

  // Yüklenme durumları
  const isLoading = isLoadingProfile || isLoadingListings || isLoadingBlogPosts || isLoadingBandPosts;
  const isDeletingListing = deleteListingMutation.isLoading;
  const isDeletingBlogPost = deleteBlogPostMutation.isLoading;
  const isDeletingBandPost = deleteBandPostMutation.isLoading;

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }
  if (!profileData) {
     navigate('/login');
     return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* === Sol Taraf: Profil Bilgileri (EKSİKSİZ) === */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary object-cover"
              />
              <h2 className="text-2xl font-bold text-center mb-2">{profileData.name}</h2>
              <p className="text-center text-gray-600 mb-6">{profileData.email}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Üyelik Tarihi:</span>
                  <span className="font-semibold">
                    {profileData.createdAt 
                      ? format(parseISO(profileData.createdAt), 'dd MMMM yyyy', { locale: tr })
                      : 'Bilinmiyor'
                    }
                  </span>
                </div>
                {activeTab === 'listings' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam İlan:</span>
                    <span className="font-semibold">{myListings ? myListings.length : 0}</span>
                  </div>
                )}
                {activeTab === 'blog' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Yazı:</span>
                    <span className="font-semibold">{myBlogPosts ? myBlogPosts.length : 0}</span>
                  </div>
                )}
                {activeTab === 'bands' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Grup İlanı:</span>
                    <span className="font-semibold">{myBandPosts ? myBandPosts.length : 0}</span>
                  </div>
                )}
              </div>
              
              <button 
              onClick={() => navigate(`/profil/duzenle`)} 
              className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition font-semibold"
            >
              Profili Düzenle
            </button>
            </div>
          </div>

          {/* === Sağ Taraf: Sekmeli İçerik (EKSİKSİZ) === */}
          <div className="md:col-span-2">
            
            {/* Sekmeler (TAB'lar) */}
            <div className="mb-6 flex border-b">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold ${
                  activeTab === 'listings' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaClipboardList /> İlanlarım
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold ${
                  activeTab === 'blog' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaPenSquare /> Blog Yazılarım
              </button>
              <button
                onClick={() => setActiveTab('bands')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold ${
                  activeTab === 'bands' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaUsers /> Grup İlanlarım
              </button>
            </div>

            {/* === KOŞULLU RENDER (İçerik) === */}
            
            {/* === "İlanlarım" Sekmesi === */}
            {activeTab === 'listings' && (
              <div className="space-y-4">
                {myListings && myListings.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold">Henüz ilanınız yok</h3>
                    <Link to="/ilan-ver" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                      İlk İlanını Ver
                    </Link>
                  </div>
                )}
                {myListings && myListings.map((listing) => (
                  <div key={listing._id} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                    <img src={listing.images[0].url} alt={listing.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold hover:text-primary transition">
                        <Link to={`/ilan/${listing._id}`}>{listing.title}</Link>
                      </h3>
                      <p className="text-primary font-bold text-xl">{listing.price.toLocaleString('tr-TR')} ₺</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(listing.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => navigate(`/ilan-duzenle/${listing._id}`)} 
                        className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition"
                      >
                        <FaEdit /> <span>Düzenle</span>
                      </button>
                      <button 
                        onClick={() => handleListingDelete(listing._id)}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                        disabled={isDeletingListing}>
                        <FaTrash /> <span>{isDeletingListing ? 'Siliniyor...' : 'Sil'}</span> 
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* === "Blog Yazılarım" Sekmesi === */}
            {activeTab === 'blog' && (
              <div className="space-y-4">
                {myBlogPosts && myBlogPosts.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold">Henüz blog yazınız yok</h3>
                    <Link to="/blog-yazisi-olustur" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                      İlk Yazını Oluştur
                    </Link>
                  </div>
                )}
                {myBlogPosts && myBlogPosts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                    <img src={post.image.url} alt={post.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold hover:text-primary transition">
                        <Link to={`/blog/${post._id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{post.category}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(post.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => navigate(`/blog-duzenle/${post._id}`)} // <-- GÜNCELLENDİ
                        className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition">
                        <FaEdit />
                        <span>Düzenle</span>
                      </button>
                      <button 
                        onClick={() => handleBlogDelete(post._id)}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                        disabled={isDeletingBlogPost}
                      >
                        <FaTrash /> <span>{isDeletingBlogPost ? 'Siliniyor...' : 'Sil'}</span> 
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* === "Grup İlanlarım" Sekmesi === */}
            {activeTab === 'bands' && (
              <div className="space-y-4">
                {myBandPosts && myBandPosts.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold">Henüz grup ilanınız yok</h3>
                    <Link to="/grup-ilani-ver" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                      İlk Grup İlanını Ver
                    </Link>
                  </div>
                )}
                {myBandPosts && myBandPosts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold hover:text-primary transition">
                        <Link to={`/grup-ara/${post._id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{post.type} - {post.location}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(post.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => navigate(`/grup-ilani-duzenle/${post._id}`)} // <-- GÜNCELLENDİ
                        className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition">
                        <FaEdit /> <span>Düzenle</span>
                      </button>
                      <button 
                        onClick={() => handleBandPostDelete(post._id)}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                        disabled={isDeletingBandPost}
                      >
                        <FaTrash /> <span>{isDeletingBandPost ? 'Siliniyor...' : 'Sil'}</span> 
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;