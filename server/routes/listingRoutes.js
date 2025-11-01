// server/routes/listingRoutes.js
const express = require('express');
const router = express.Router();

// Controller fonksiyonlarını import et
const { 
  createListing, 
  getListings, 
  getListingById, 
  getMyListings,
  deleteListing,
  updateListing
} = require('../controllers/listingController');

// Middleware'leri import et
const { protect } = require('../middleware/authMiddleware'); // Güvenlik (yetki)
const upload = require('../middleware/uploadMiddleware');    // Resim yükleme

/*
 * ROTA SIRALAMASI ÖNEMLİDİR:
 * Spesifik (belirli) rotalar (örn: '/my-listings'),
 * dinamik (değişken) rotalardan (örn: '/:id')
 * DAİMA ÖNCE gelmelidir.
 */

// === GENEL ROTALAR ===

// @route   GET /api/listings
// @desc    Tüm ilanları getir (Filtreleme ve sıralama ile)
// @access  Public
router.get('/', getListings);


// === ÖZEL (SPESİFİK) ROTALAR ===

// @route   GET /api/listings/my-listings
// @desc    Giriş yapmış kullanıcının kendi ilanlarını getir
// @access  Private
router.get('/my-listings', protect, getMyListings);


// === İLAN OLUŞTURMA ROTASI ===

// @route   POST /api/listings
// @desc    Yeni bir ilan oluştur
// @access  Private
router.post(
  '/',
  protect,
  upload.array('images', 8), // 'images' anahtarıyla 8 resme kadar yükle
  createListing
);


// === DİNAMİK (ID'ye GÖRE) ROTALAR ===

// @route   GET /api/listings/:id
// @desc    ID'ye göre tek bir ilan getir
// @access  Public
router.get('/:id', getListingById); 

// @route   DELETE /api/listings/:id
// @desc    Bir ilanı sil
// @access  Private (Sadece ilan sahibi)
router.delete('/:id', protect, deleteListing);

// @route   PUT /api/listings/:id
// @desc    Bir ilanı güncelle
// @access  Private (Sadece ilan sahibi)
router.put('/:id', protect, updateListing);


module.exports = router;