// server/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // jwt.sign 3 parametre alır:
  // 1. Payload (Token'ın içine ne koymak istiyorsun?): Kullanıcının ID'si
  // 2. Secret Key (.env'den): Bu imzayı doğrulamak için
  // 3. Options (Seçenekler): Token ne kadar süre geçerli olsun? (örn: 30 gün)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;