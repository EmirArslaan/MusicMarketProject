// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userMOdel');

const protect = async (req, res, next) => {
  let token;

  // 1. Token'ı request headers (istek başlıkları) içinden oku
  // Token genellikle 'Bearer <token>' formatında gelir
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Token'ı al ('Bearer' yazısını ayır)
      token = req.headers.authorization.split(' ')[1];

      // 3. Token'ı doğrula (verify)
      // .env'deki gizli anahtarı kullanarak token'ı çözümler
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Token'ın içindeki ID ile kullanıcıyı veritabanından bul
      // Şifreyi (-password) hariç tutarak req.user'a ekle
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         res.status(401);
         throw new Error('Kullanıcı bulunamadı, token geçersiz');
      }

      // 5. Her şey yolundaysa, bir sonraki fonksiyona (controller'a) geç
      next();
    } catch (error) {
      console.error(error);
      res.status(401); // 401 Unauthorized
      throw new Error('Giriş yetkisi yok, token başarısız');
    }
  }

  // 6. Eğer token yoksa...
  if (!token) {
    res.status(401);
    throw new Error('Giriş yetkisi yok, token bulunamadı');
  }
};

module.exports = { protect };