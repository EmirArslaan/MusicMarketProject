// client/src/components/common/BlogCard.jsx
import { Link } from 'react-router-dom';
import { FaClock, FaUser, FaComment, FaHeart } from 'react-icons/fa';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

function BlogCard({ post }) {

  // Tarihi formatla
  const timeAgo = post.createdAt
    ? formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true, locale: tr })
    : '';

  // Güvenlik kontrolleri
  const imageUrl = post.image?.url || 'https://via.placeholder.com/600x400?text=Blog';
  const authorName = post.user?.name || 'Anonim Yazar'; // .populate('user') sayesinde

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">
      {/* Resim */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={imageUrl} // <-- GÜNCELLENDİ
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
        {/* Kategori Badge */}
        <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
          {post.category}
        </span>
      </div>

      {/* İçerik */}
      <div className="p-5">
        {/* Yazar ve Tarih */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FaUser className="text-xs" />
            <span>{authorName}</span> {/* <-- GÜNCELLENDİ */}
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="text-xs" />
            <span>{timeAgo}</span> {/* <-- GÜNCELLENDİ */}
          </div>
        </div>

        {/* Başlık */}
        <Link to={`/blog/${post._id}`}> {/* <-- GÜNCELLENDİ (post.id -> post._id) */}
          <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition">
            {post.title}
          </h3>
        </Link>

        {/* Açıklama (Backend'e 'excerpt' (özet) eklemedik, o yüzden 'content'i kırpıyoruz) */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.content.substring(0, 100)}... {/* <-- GÜNCELLENDİ (excerpt -> content) */}
        </p>

        {/* Alt Kısım */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Link 
            to={`/blog/${post._id}`}
            className="text-primary hover:text-blue-700 font-semibold text-sm"
          >
            Devamını Oku →
          </Link>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <FaHeart />
              <span>{post.likes ? post.likes.length : 0}</span> {/* <-- GÜNCELLENDİ */}
            </div>
            <div className="flex items-center gap-1">
              <FaComment />
              <span>{post.comments ? post.comments.length : 0}</span> {/* <-- GÜNCELLENDİ */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;