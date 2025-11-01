// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  toggleFavorite,
  getMyFavorites,
  updateUserProfile,  // <-- YENİ
  updateUserPassword  // <-- YENİ
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public Rotalar
router.post('/register', registerUser);
router.post('/login', loginUser);

// === Private Rotalar ===

// 'favorites' Rotaları
router.put('/favorites', protect, toggleFavorite);
router.get('/favorites', protect, getMyFavorites);

// 'profile' Rotaları
// GET /api/users/profile (Profil Bilgilerini Getir)
router.get('/profile', protect, getUserProfile); 
// PUT /api/users/profile (Profil Bilgilerini Güncelle)
router.put('/profile', protect, updateUserProfile); // <-- YENİ ROTA

// 'change-password' Rotası
// PUT /api/users/change-password
router.put('/change-password', protect, updateUserPassword); // <-- YENİ ROTA

module.exports = router;