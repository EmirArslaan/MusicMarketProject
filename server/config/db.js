// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // process.env.MONGO_URI'yi .env dosyasından alır
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1); // Hata varsa uygulamayı durdur
  }
};

module.exports = connectDB;