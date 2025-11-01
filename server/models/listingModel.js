// server/models/listingModel.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    // Bu ilanı hangi kullanıcı yayınladı?
    // 'User' modeline bir referans (ilişki) kuruyoruz.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // 'User' modeline referans
    },
    // İlan Başlığı
    title: {
      type: String,
      required: [true, 'İlan başlığı zorunludur'],
      trim: true, // Başındaki/sonundaki boşlukları sil
    },
    // Açıklama
    description: {
      type: String,
      required: [true, 'Açıklama zorunludur'],
    },
    // Kategori (Gitar, Davul vb.)
    category: {
      type: String,
      required: [true, 'Kategori zorunludur'],
    },
    // Alt Kategori (Opsiyonel, Örn: Elektro Gitar)
    subcategory: {
      type: String,
    },
    // Marka
    brand: {
      type: String,
      required: [true, 'Marka zorunludur'],
    },
    // Durum (Sıfır, Az Kullanılmış vb.)
    condition: {
      type: String,
      required: [true, 'Durum zorunludur'],
      enum: [ // Sadece bu değerleri kabul et
        'sifir',
        'sifir-gibi',
        'az-kullanilmis',
        'iyi-durumda',
        'eski',
        'arizali',
      ],
      default: 'iyi-durumda',
    },
    // Fiyat
    price: {
      type: Number,
      required: [true, 'Fiyat zorunludur'],
      min: 0,
    },
    // Konum (Şehir)
    location: {
      type: String,
      required: [true, 'Konum zorunludur'],
    },
    // Resimler (Birden fazla resim URL'si)
    images: [
      {
        public_id: { type: String, required: true }, // Cloudinary'den gelen ID
        url: { type: String, required: true },       // Cloudinary'den gelen URL
      },
    ],
    // İlanın aktif olup olmadığı (örn: satıldı)
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Görüntülenme sayısı (opsiyonel)
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt'i otomatik ekle
  }
);

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;