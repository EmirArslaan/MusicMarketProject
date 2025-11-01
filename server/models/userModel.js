// server/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Ad Soyad
    name: {
      type: String,
      required: [true, 'Lütfen adınızı girin'],
    },
    // E-posta
    email: {
      type: String,
      required: [true, 'Lütfen e-posta adresinizi girin'],
      unique: true, // Her e-posta adresi benzersiz olmalı
      match: [ // E-posta formatını doğrula
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Lütfen geçerli bir e-posta adresi girin',
      ],
    },
    // Şifre
    password: {
      type: String,
      required: [true, 'Lütfen bir şifre belirleyin'],
      minlength: 6, // Şifre en az 6 karakter olmalı
      select: false, // API'den kullanıcı verisi çekerken şifreyi GÖNDERME
    },
    // Profil Fotoğrafı (opsiyonel)
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=K+U&background=random&color=fff', // Varsayılan avatar
    },
    // Biyografi (opsiyonel)
    bio: {
      type: String,
      maxlength: 500,
    },
    // Favori ilanlar (opsiyonel)
    favoriteListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing', // 'Listing' modeline referans veriyoruz
      },
    ],
    // Müzik tarzı, çaldığı enstrümanlar vb. eklenebilir
  },
  {
    // Bu ayar, `createdAt` (oluşturulma tarihi) ve `updatedAt` (güncellenme tarihi)
    // alanlarını otomatik olarak ekler.
    timestamps: true,
  }
);

// ŞİFRE ŞİFRELEME (PRE-SAVE HOOK)
// Bir kullanıcı veritabanına kaydedilmeden ("save") ÖNCE çalışır.
userSchema.pre('save', async function (next) {
  // Eğer şifre alanı değiştirilmediyse (örn: profil güncelliyorsa)
  // şifreyi tekrar hash'leme, devam et.
  if (!this.isModified('password')) {
    next();
  }

  // Yeni şifreyi veya güncellenen şifreyi hash'le
  const salt = await bcrypt.genSalt(10); // 10 "tur" ile salt oluştur
  this.password = await bcrypt.hash(this.password, salt); // Şifreyi hash'le
});

// ŞİFRE KARŞILAŞTIRMA METODU
// Kullanıcı giriş yaparken girilen şifre ile DB'deki hash'lenmiş şifreyi karşılaştır.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Şemayı kullanarak 'User' adında bir model oluştur ve export et
// Eğer model zaten derlenmişse onu kullan, değilse yenisini derle
module.exports = mongoose.models.User || mongoose.model('User', userSchema);