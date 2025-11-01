// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Rota dosyalarını import et
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const blogRoutes = require('./routes/blogRoutes'); 
const bandRoutes = require('./routes/bandRoutes');

// Hata middleware'ini import et
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Veritabanına bağlan
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Rotası
app.get('/', (req, res) => {
  res.json({ message: '🎸 Müzik Marketplace API Çalışıyor! 🎉' });
});

// === ANA ROTALARIMIZ ===
// Biri '/api/users' ile başlayan bir istek atarsa, 
// onu 'userRoutes' dosyasına yönlendir
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/bands', bandRoutes);
// (Daha sonra /api/listings, /api/blogs vb. eklenecek)


// === HATA YÖNETİMİ ===
// 404 Not Found (Eşleşen rota yoksa)
app.use(notFound);

// Genel Hata Yakalayıcı (Herhangi bir rotada 'next(error)' çağrılırsa)
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});