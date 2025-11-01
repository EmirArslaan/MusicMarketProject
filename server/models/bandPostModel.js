// server/models/bandPostModel.js
const mongoose = require('mongoose');

const bandPostSchema = new mongoose.Schema(
  {
    // İlanı kim verdi? (Kullanıcıya referans)
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
    description: {
      type: String,
      required: [true, 'Açıklama zorunludur'],
    },
    // İlan tipi (Frontend'deki sahte veriye uygun)
    type: {
      type: String,
      required: true,
      enum: ['Müzisyen Aranıyor', 'Grup Kuruluyor', 'Partner Aranıyor'],
    },
    // Hangi enstrümanlar/pozisyonlar aranıyor
    lookingFor: [
      {
        type: String,
        required: true,
      },
    ],
    // Hangi müzik türleri
    genres: [
      {
        type: String,
        required: true,
      },
    ],
    // Konum (Şehir)
    location: {
      type: String,
      required: [true, 'Konum zorunludur'],
    },
    // Gerekli deneyim seviyesi
    experienceLevel: {
      type: String,
      enum: ['Başlangıç', 'Orta', 'İleri', 'Farketmez'],
      default: 'Farketmez',
    },
    // Mevcut üye sayısı (Opsiyonel)
    currentMembers: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt'i otomatik ekle
  }
);

// Model çakışmasını önle (OverwriteModelError)
module.exports = mongoose.models.BandPost || mongoose.model('BandPost', bandPostSchema);