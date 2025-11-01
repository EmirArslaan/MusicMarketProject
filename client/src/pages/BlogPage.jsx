// client/src/pages/BlogPage.jsx
import { useState } from 'react';
import BlogCard from '../components/common/BlogCard';
import { FaSearch, FaPenAlt } from 'react-icons/fa'; // <-- 1. FaPenAlt eklendi
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom'; // <-- 2. Link import edildi (zaten olmalı)

// API'dan veri çekme fonksiyonu
const fetchBlogPosts = async (category) => {
  const params = new URLSearchParams();
  if (category && category !== 'all') {
    params.append('category', category);
  }
  const { data } = await axios.get(`/api/blogs?${params.toString()}`);
  return data;
};

function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['Tümü', 'Rehberler', 'Teknik', 'Stüdyo', 'Bakım', 'Sosyal', 'İnceleme'];

  // React Query ile veriyi çek
  const { 
    data: blogPosts, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['blogPosts', selectedCategory], 
    queryFn: () => fetchBlogPosts(selectedCategory),
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Müzik Blog</h1>
          <p className="text-xl text-gray-100">
            Müzik dünyasından haberler, rehberler ve ipuçları
          </p>

          {/* === 3. YENİ BUTON BURAYA EKLENDİ === */}
          <Link
            to="/blog-yazisi-olustur"
            className="mt-6 inline-block bg-white text-primary px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            <FaPenAlt className="inline mr-2" />
            Yazı Yaz
          </Link>
          {/* === YENİ BUTON SONU === */}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Arama Çubuğu */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Blog yazılarında ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
          </div>
          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'Tümü' ? 'all' : cat)}
                className={`px-4 py-2 rounded-full transition font-semibold ${
                  (cat === 'Tümü' && selectedCategory === 'all') || selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Yükleniyor / Hata / Başarı Durumları */}
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <p className="text-center text-red-500">
            Yazılar yüklenirken bir hata oluştu: {error.message}
          </p>
        ) : blogPosts.length === 0 ? (
          <p className="text-center text-gray-600">Bu kategoride yazı bulunamadı.</p>
        ) : (
          // Başarılıysa: Gerçek veriyi listele
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {blogPosts.map((post) => (
                <BlogCard key={post._id} post={post} />
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
  );
}

export default BlogPage;