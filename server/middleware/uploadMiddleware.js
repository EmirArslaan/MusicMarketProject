// server/middleware/uploadMiddleware.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// .env dosyasındaki anahtarları kullanarak Cloudinary'yi yapılandır
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary için bir depolama alanı (storage) yapılandırması oluştur
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // Resimlerin yükleneceği klasör
    folder: 'music-marketplace',
    // İzin verilen formatlar
    allowed_formats: ['jpeg', 'png', 'jpg'],
    // (Opsiyonel) Resimleri yüklerken otomatik olarak optimize et
    transformation: [{ width: 1024, height: 768, crop: 'limit' }],
  },
});

// Multer'ı bu depolama yapılandırmasıyla yapılandır
const upload = multer({
  storage: storage,
  // Dosya boyutu limiti (örn: 5MB)
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  // Dosya filtresi (sadece resimlere izin ver)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Dosya kabul edildi
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false); // Hata
    }
  },
});

module.exports = upload;