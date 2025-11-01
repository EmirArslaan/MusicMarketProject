// server/models/blogPostModel.js
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    // Yazının yazarı (Kullanıcıya referans)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Başlık zorunludur'],
      trim: true,
    },
    // İçerik (Markdown veya HTML olarak saklanabilir)
    content: {
      type: String,
      required: [true, 'İçerik zorunludur'],
    },
    // Yazının kapak fotoğrafı (Cloudinary'den)
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    // Kategori (Rehberler, Teknik, Stüdyo vb.)
    category: {
      type: String,
      required: [true, 'Kategori zorunludur'],
    },
    // Okunma süresi (Örn: "5 dakika")
    readTime: {
      type: String,
      required: true,
    },
    // Beğeniler (Hangi kullanıcıların beğendiğini tutar)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Yorumlar (Şimdilik basit tutuyoruz, ileride ayrı bir model olabilir)
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        avatar: { type: String },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // createdAt ve updatedAt'i otomatik ekle
  }
);

// Model çakışmasını önle (OverwriteModelError)
module.exports = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);