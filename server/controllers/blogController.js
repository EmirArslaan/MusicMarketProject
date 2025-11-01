// server/controllers/blogController.js
const asyncHandler = require('../middleware/asyncHandler');
const BlogPost = require('../models/blogPostModel');
const cloudinary = require('cloudinary').v2;

// ... (getAllPosts, getPostById, createPost, createBlogComment, getMyBlogPosts, deleteBlogPost fonksiyonları aynı kaldı) ...
// ... (Tüm bu fonksiyonları aşağıya ekliyorum ki tam kod olsun) ...

// @desc    Tüm blog yazılarını getir
const getAllPosts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category && category !== 'all') {
    filter.category = category;
  }
  const posts = await BlogPost.find(filter)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// @desc    ID'ye göre tek bir blog yazısı getir
const getPostById = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id)
    .populate('user', 'name avatar');
  if (post) {
    res.status(200).json(post);
  } else {
    res.status(404);
    throw new Error('Blog yazısı bulunamadı');
  }
});

// @desc    Yeni bir blog yazısı oluştur
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, readTime } = req.body;
  if (!req.file) {
    res.status(400);
    throw new Error('Kapak fotoğrafı zorunludur');
  }
  const image = {
    url: req.file.path,
    public_id: req.file.filename,
  };
  const post = new BlogPost({
    user: req.user._id,
    title,
    content,
    category,
    readTime,
    image,
  });
  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc    Bir blog yazısına yeni yorum ekle
const createBlogComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  if (!comment || comment.trim() === '') {
    res.status(400);
    throw new Error('Yorum metni boş olamaz');
  }
  const post = await BlogPost.findById(req.params.id);
  if (post) {
    const newComment = {
      user: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      comment: comment,
    };
    post.comments.push(newComment);
    await post.save();
    res.status(201).json({ message: 'Yorum başarıyla eklendi' });
  } else {
    res.status(404);
    throw new Error('Blog yazısı bulunamadı');
  }
});

// @desc    Giriş yapmış kullanıcının kendi blog yazılarını getir
const getMyBlogPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// @desc    Bir blog yazısını sil
const deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Yazı bulunamadı');
  }
  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Yetkisiz işlem. Bu yazıyı silemezsiniz.');
  }
  try {
    if (post.image && post.image.public_id) {
      await cloudinary.api.delete_resources([post.image.public_id]);
    }
  } catch (cloudinaryError) {
    console.warn('Cloudinary resmi silinirken bir hata oluştu:', cloudinaryError.message);
  }
  await BlogPost.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Yazı başarıyla silindi' });
});


// === YENİ FONKSİYON: YAZI GÜNCELLE ===
// @desc    Bir blog yazısını güncelle
// @route   PUT /api/blogs/:id
// @access  Private (Sadece yazı sahibi)
const updateBlogPost = asyncHandler(async (req, res) => {
  // 1. Yazıyı ID'sine göre bul
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Yazı bulunamadı');
  }

  // 2. Güvenlik Kontrolü: Yazan kişi mi güncelliyor?
  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Yetkisiz işlem. Bu yazıyı güncelleyemezsiniz.');
  }

  // 3. Güncellenecek metin verilerini req.body'den al
  const { title, content, category, readTime } = req.body;

  // (Resim güncellemesi şimdilik eklenmedi)

  // 4. Yazı objesini güncelle
  post.title = title || post.title;
  post.content = content || post.content;
  post.category = category || post.category;
  post.readTime = readTime || post.readTime;

  // 5. Güncellenmiş yazıyı kaydet
  const updatedPost = await post.save();

  // 6. Başarılı cevabı gönder
  res.status(200).json(updatedPost);
});


// --- EXPORTS (TÜM FONKSİYONLAR) ---
module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  createBlogComment,
  getMyBlogPosts,
  deleteBlogPost,
  updateBlogPost, // <-- YENİ
};