// server/routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllPosts, 
  getPostById, 
  createPost,
  createBlogComment,
  getMyBlogPosts,
  deleteBlogPost,
  updateBlogPost // <-- YENİ
} = require('../controllers/blogController');
    
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// === GENEL ROTALAR ===
router.get('/', getAllPosts);

// === ÖZEL (SPESİFİK) ROTALAR ===
router.get('/my-posts', protect, getMyBlogPosts);

// === YAZI OLUŞTURMA ===
router.post(
  '/',
  protect,
  upload.single('image'),
  createPost
);

// === DİNAMİK (ID'ye GÖRE) ROTALAR ===

// GET /api/blogs/:id
router.get('/:id', getPostById); 

// POST /api/blogs/:id/comments
router.post('/:id/comments', protect, createBlogComment);

// DELETE /api/blogs/:id
router.delete('/:id', protect, deleteBlogPost);

// PUT /api/blogs/:id (GÜNCELLEME)
router.put('/:id', protect, updateBlogPost); // <-- YENİ ROTA

module.exports = router;