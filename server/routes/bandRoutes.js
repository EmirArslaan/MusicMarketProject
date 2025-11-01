// server/routes/bandRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllBandPosts, 
  getBandPostById, 
  createBandPost,
  getMyBandPosts,
  deleteBandPost,
  updateBandPost // <-- YENİ
} = require('../controllers/bandController');
    
const { protect } = require('../middleware/authMiddleware');

// === GENEL ROTALAR ===
router.get('/', getAllBandPosts);

// === ÖZEL (SPESİFİK) ROTALAR ===
router.get('/my-posts', protect, getMyBandPosts);

// === İLAN OLUŞTURMA ===
router.post('/', protect, createBandPost);

// === DİNAMİK (ID'ye GÖRE) ROTALAR ===

// GET /api/bands/:id
router.get('/:id', getBandPostById); 

// DELETE /api/bands/:id
router.delete('/:id', protect, deleteBandPost);

// PUT /api/bands/:id (GÜNCELLEME)
router.put('/:id', protect, updateBandPost); // <-- YENİ ROTA

module.exports = router;