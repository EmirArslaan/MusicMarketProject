// server/middleware/asyncHandler.js
// Bu, bizim async fonksiyonlarımızı (controller'ları) saran bir yardımcıdır.
// Herhangi bir hata olursa, onu yakalar ve 'next(error)' ile
// bizim errorMiddleware'imize gönderir.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;