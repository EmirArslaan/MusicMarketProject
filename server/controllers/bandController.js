// server/controllers/bandController.js
const asyncHandler = require('../middleware/asyncHandler');
const BandPost = require('../models/bandPostModel');

// ... (getAllBandPosts, getBandPostById, createBandPost, getMyBandPosts, deleteBandPost fonksiyonları aynı kaldı) ...
// ... (Tüm bu fonksiyonları aşağıya ekliyorum ki tam kod olsun) ...

// @desc    Tüm grup ilanlarını getir
const getAllBandPosts = asyncHandler(async (req, res) => {
  const { location, genres, lookingFor, type } = req.query;
  const filter = {};
  if (location && location !== 'all') { filter.location = location; }
  if (type && type !== 'all') { filter.type = type; }
  if (genres && genres !== 'all') { filter.genres = { $in: [genres] }; }
  if (lookingFor && lookingFor !== 'all') { filter.lookingFor = { $in: [lookingFor] }; }
  const posts = await BandPost.find(filter)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// @desc    ID'ye göre tek bir grup ilanı getir
const getBandPostById = asyncHandler(async (req, res) => {
  const post = await BandPost.findById(req.params.id)
    .populate('user', 'name avatar email createdAt');
  if (post) {
    res.status(200).json(post);
  } else {
    res.status(404);
    throw new Error('Grup ilanı bulunamadı');
  }
});

// @desc    Yeni bir grup ilanı oluştur
const createBandPost = asyncHandler(async (req, res) => {
  const { 
    title, description, type, lookingFor, genres, location, experienceLevel 
  } = req.body;
  if (!lookingFor || lookingFor.length === 0 || !genres || genres.length === 0) {
     res.status(400);
     throw new Error('Aranan pozisyon ve müzik türü alanları zorunludur.');
  }
  const post = new BandPost({
    user: req.user._id,
    title, description, type, lookingFor, genres, location, experienceLevel,
    currentMembers: req.body.currentMembers || 1
  });
  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc    Giriş yapmış kullanıcının kendi grup ilanlarını getir
const getMyBandPosts = asyncHandler(async (req, res) => {
  const posts = await BandPost.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// @desc    Bir grup ilanını sil
const deleteBandPost = asyncHandler(async (req, res) => {
  const post = await BandPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Grup ilanı bulunamadı');
  }
  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Yetkisiz işlem. Bu ilanı silemezsiniz.');
  }
  await BandPost.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Grup ilanı başarıyla silindi' });
});


// === YENİ FONKSİYON: GRUP İLANI GÜNCELLE ===
// @desc    Bir grup ilanını güncelle
// @route   PUT /api/bands/:id
// @access  Private (Sadece ilan sahibi)
const updateBandPost = asyncHandler(async (req, res) => {
  // 1. İlanı ID'sine göre bul
  const post = await BandPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Grup ilanı bulunamadı');
  }

  // 2. Güvenlik Kontrolü
  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Yetkisiz işlem. Bu ilanı güncelleyemezsiniz.');
  }

  // 3. Güncellenecek metin verilerini req.body'den al
  const { 
    title, 
    description, 
    type, 
    lookingFor, 
    genres, 
    location, 
    experienceLevel, 
    currentMembers 
  } = req.body;

  // 4. İlan objesini güncelle
  post.title = title || post.title;
  post.description = description || post.description;
  post.type = type || post.type;
  post.lookingFor = lookingFor || post.lookingFor;
  post.genres = genres || post.genres;
  post.location = location || post.location;
  post.experienceLevel = experienceLevel || post.experienceLevel;
  post.currentMembers = currentMembers || post.currentMembers;

  // 5. Güncellenmiş ilanı kaydet
  const updatedPost = await post.save();

  // 6. Başarılı cevabı gönder
  res.status(200).json(updatedPost);
});


// --- EXPORTS (TÜM FONKSİYONLAR) ---
module.exports = {
  getAllBandPosts,
  getBandPostById,
  createBandPost,
  getMyBandPosts,
  deleteBandPost,
  updateBandPost, // <-- YENİ
};