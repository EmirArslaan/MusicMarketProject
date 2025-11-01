// server/controllers/userController.js
const User = require('../models/userMOdel');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler'); 

// ... (registerUser, loginUser, getUserProfile, toggleFavorite, getMyFavorites fonksiyonları aynı kaldı) ...
// ... (Tüm bu fonksiyonları aşağıya ekliyorum ki tam kod olsun) ...

// @desc    Yeni kullanıcı kaydı
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    res.status(400);
    throw new Error('Bu e-posta adresi zaten kullanılıyor');
  }
  const user = await User.create({ name, email, password });
  if (user) {
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: token,
      favoriteListings: user.favoriteListings,
    });
  } else {
    res.status(400);
    throw new Error('Kullanıcı oluşturulamadı');
  }
});

// @desc    Kullanıcı girişi
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email }).select('+password');
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: token,
      favoriteListings: user.favoriteListings,
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz e-posta veya şifre');
  }
});

// @desc    Kullanıcının profilini al
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = req.user; 
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      favoriteListings: user.favoriteListings,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Bir ilanı favorilere ekle/çıkar
const toggleFavorite = asyncHandler(async (req, res, next) => {
  const { listingId } = req.body;
  if (!listingId) {
    res.status(400);
    throw new Error('İlan ID\'si (listingId) eksik');
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
  const index = user.favoriteListings.findIndex(id => id.toString() === listingId);
  if (index > -1) { user.favoriteListings.splice(index, 1); } 
  else { user.favoriteListings.push(listingId); }
  const updatedUser = await user.save();
  res.status(200).json({
    message: index > -1 ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi',
    favoriteListings: updatedUser.favoriteListings 
  });
});

// @desc    Kullanıcının favori ilanlarını getir
const getMyFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'favoriteListings',
      populate: { path: 'user', select: 'name avatar' } 
    });
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
  res.status(200).json(user.favoriteListings);
});


// === YENİ FONKSİYON 1: PROFİL GÜNCELLE ===
// @desc    Kullanıcı profilini (isim, bio, avatar) güncelle
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // 'protect' middleware'inden gelen kullanıcıyı bul
  const user = await User.findById(req.user._id);

  if (user) {
    // req.body'den gelen yeni verileri al
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    // (Avatar güncellemesi şimdilik eklenmedi, o da 'form-data' gerektirir)
    // if (req.body.avatar) { user.avatar = req.body.avatar; }

    const updatedUser = await user.save();
    
    // YENİ BİR TOKEN OLUŞTURMAYA GEREK YOK, AMA
    // FRONTEND'İN STATE'İNİ GÜNCELLEMESİ İÇİN YENİ BİLGİLERİ DÖN
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      favoriteListings: updatedUser.favoriteListings,
      // NOT: Token'ı geri döndürmüyoruz, çünkü state'te zaten var
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// === YENİ FONKSİYON 2: ŞİFRE GÜNCELLE ===
// @desc    Kullanıcı şifresini güncelle
// @route   PUT /api/users/change-password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Mevcut ve yeni şifre alanları zorunludur');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Yeni şifre en az 6 karakter olmalı');
  }

  // Kullanıcıyı, şifresiyle birlikte çekmeliyiz (.select('+password'))
  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(currentPassword))) {
    // Mevcut şifre doğru, yenisini ata
    user.password = newPassword;
    // 'pre-save' hook'u (userModel'de) şifreyi otomatik hash'leyecektir
    await user.save();
    
    res.status(200).json({ message: 'Şifre başarıyla güncellendi' });
  } else {
    res.status(401);
    throw new Error('Mevcut şifre yanlış');
  }
});


// --- EXPORTS (TÜM FONKSİYONLAR) ---
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  toggleFavorite,
  getMyFavorites,
  updateUserProfile,  // <-- YENİ
  updateUserPassword, // <-- YENİ
};