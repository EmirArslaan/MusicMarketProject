// client/src/pages/BlogDetailPage.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaClock, FaUser, FaHeart, FaComment, FaShare, FaFacebook, FaTwitter } from 'react-icons/fa';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format, parseISO, formatDistanceToNow } from 'date-fns'; 
import { tr } from 'date-fns/locale';
import { useForm } from 'react-hook-form'; 
import useAuthStore from '../store/authStore'; 
import toast from 'react-hot-toast'; 

// API'dan veri çekme fonksiyonu
const fetchPost = async (postId) => {
  const { data } = await axios.get(`/api/blogs/${postId}`);
  return data;
};

// Yorum EKLEME API isteğini yapacak fonksiyon
const addCommentFn = async ({ postId, comment, token }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.post(`/api/blogs/${postId}/comments`, { comment }, config);
  return data;
};


function BlogDetailPage() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userInfo } = useAuthStore(); 

  // Yorum formu için react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // REACT QUERY (Veri Çekme)
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['blogPost', postId], 
    queryFn: () => fetchPost(postId),
  });

  // YORUM EKLEME (Mutation)
  const addCommentMutation = useMutation({
    mutationFn: addCommentFn,
    onSuccess: (data) => {
      toast.success(data.message || 'Yorumunuz eklendi!');
      queryClient.invalidateQueries(['blogPost', postId]);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Yorum eklenirken bir hata oluştu');
    },
  });

  // Yorum Formu Gönderme (Submit) Fonksiyonu
  const onCommentSubmit = (data) => {
    if (!userInfo) {
      toast.error('Yorum yapmak için giriş yapmalısınız.');
      navigate('/login');
      return;
    }
    addCommentMutation.mutate({ 
      postId, 
      comment: data.comment, 
      token: userInfo.token 
    });
  };

  // YÜKLENİYOR DURUMU
  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  // HATA DURUMU
  if (isError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Hata Oluştu</h2>
        <p className="text-gray-600">{error.response?.data?.message || error.message}</p>
        <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">Blog Sayfasına Dön</Link>
      </div>
    );
  }

  // BAŞARILI DURUM (Veri yüklendi)
  
  // Güvenlik kontrolleri ve tarih formatlama
  const authorName = post.user?.name || 'Anonim Yazar';
  const authorAvatar = post.user?.avatar || 'https://ui-avatars.com/api/?name=A+Y';
  const postDate = post.createdAt 
    ? format(parseISO(post.createdAt), 'dd MMMM yyyy', { locale: tr })
    : 'Bilinmiyor';
    
  const isCommenting = addCommentMutation.isLoading || isSubmitting;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* === EKSİK KISIM 1 (Hero Image) === */}
      <div className="relative h-96 bg-gray-200">
        <img
          src={post.image.url}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold capitalize">
            {post.category}
          </span>
        </div>
      </div>
      {/* === EKSİK KISIM 1 SONU === */}

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        
        {/* === EKSİK KISIM 2 (Başlık Kartı ve İçerik) === */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {post.title}
          </h1>
          {/* Yazar Bilgileri */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b">
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-800">{authorName}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {postDate} 
                  </span>
                  <span>•</span>
                  <span>{post.readTime} okuma</span>
                </div>
              </div>
            </div>
            {/* İstatistikler */}
            <div className="flex items-center gap-4 text-gray-600">
              <button className="flex items-center gap-2 hover:text-red-500 transition">
                <FaHeart />
                <span>{post.likes ? post.likes.length : 0}</span>
              </button>
              <div className="flex items-center gap-2">
                <FaComment />
                <span>{post.comments ? post.comments.length : 0}</span>
              </div>
              <button className="flex items-center gap-2 hover:text-primary transition">
                <FaShare />
              </button>
            </div>
          </div>

          {/* İçerik */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>
          
          {/* Sosyal Medya Paylaşım */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-gray-600 mb-3">Bu yazıyı paylaş:</p>
            <div className="flex gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <FaFacebook /> Facebook
              </button>
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <FaTwitter /> Twitter
              </button>
            </div>
          </div>
        </div>
        {/* === EKSİK KISIM 2 SONU === */}


        {/* === ÇALIŞAN BÖLÜM (Yorumlar) === */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Yorumlar ({post.comments ? post.comments.length : 0})</h2>
          
          {/* Yorum Yaz Formu */}
          {userInfo ? (
            <form onSubmit={handleSubmit(onCommentSubmit)} className="mb-8">
              <div className="flex items-start gap-3">
                <img 
                  src={userInfo.avatar} 
                  alt={userInfo.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    {...register("comment", { required: "Yorum alanı boş bırakılamaz" })}
                    placeholder="Yorumunuzu yazın..."
                    className={`w-full px-4 py-3 border rounded-lg ${errors.comment ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                    rows="4"
                    disabled={isCommenting}
                  />
                  {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button 
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold disabled:opacity-50"
                  disabled={isCommenting}
                >
                  {isCommenting ? 'Gönderiliyor...' : 'Yorum Yap'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-700">
                Yorum yapmak için{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  giriş yapmanız
                </Link> 
                {' '}gerekmektedir.
              </p>
            </div>
          )}
          
          {/* Mevcut Yorumlar */}
          <div className="space-y-6">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <img
                    src={comment.avatar || 'https://ui-avatars.com/api/?name=Y+Y'}
                    alt={comment.name}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{comment.name}</p>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              )).reverse() // Yorumları yeniden eskiye sırala
            ) : (
              <p className="text-gray-500 text-center">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default BlogDetailPage;