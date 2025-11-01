// server/middleware/errorMiddleware.js

// 404 - Bulunamadı Hatası
// Biri API'de var olmayan bir yola (route) istek atarsa burası çalışır
const notFound = (req, res, next) => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404);
  next(error); // Hatayı bir sonraki middleware'e (errorHandler'a) pasla
};

// Genel Hata Yakalayıcı
// Kodun herhangi bir yerinde "throw new Error(...)" çalışırsa bu fonksiyon tetiklenir
const errorHandler = (err, req, res, next) => {
  // Bazen 200 (OK) status koduyla hata gelebilir, bunu düzeltelim
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose (MongoDB) 'CastError' hatası (örn: ID formatı yanlışsa)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Kaynak bulunamadı (Geçersiz ID)';
  }

  res.status(statusCode).json({
    message: message,
    // Sadece geliştirme modundayken hatanın tamamını göster
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };