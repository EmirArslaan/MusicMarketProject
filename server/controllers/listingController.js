// server/controllers/listingController.js
const asyncHandler = require('../middleware/asyncHandler');
const Listing = require('../models/listingModel');
const User = require('../models/userMOdel'); 
const cloudinary = require('cloudinary').v2; 

// @desc    Yeni bir ilan oluştur
// @route   POST /api/listings
// @access  Private (Sadece giriş yapanlar)
const createListing = asyncHandler(async (req, res) => {
  // 1. Metin verilerini req.body'den al
  const { 
    title, 
    description, 
    category, 
    subcategory, 
    brand, 
    condition, 
    price, 
    location 
  } = req.body;

  // 2. Resim verilerini req.files'dan al (uploadMiddleware sayesinde)
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('En az 1 resim yüklemelisiniz');
  }

  // 3. Resim dizisini modelimize uygun formata getir
  const images = req.files.map((file) => ({
    url: file.path,          // Cloudinary'nin verdiği URL
    public_id: file.filename,  // Cloudinary'nin verdiği silme ID'si
  }));

  // 4. Yeni ilanı oluştur
  const listing = new Listing({
    // 5. İlanın sahibini req.user'dan al (protect middleware sayesinde)
    user: req.user._id,
    title,
    description,
    category,
    subcategory,
    brand,
    condition,
    price,
    location,
    images, // Formatlanmış resim dizisi
  });

  // 6. İlanı veritabanına kaydet
  const createdListing = await listing.save();

  // 7. Başarılı cevabı (201 - Created) gönder
  res.status(201).json(createdListing);
});


// @desc    Tüm ilanları getir (Filtreleme, Sıralama ve Min/Max Fiyat ile)
// @route   GET /api/listings
// @access  Public (Herkes erişebilir)
// @desc    Tüm ilanları getir (Filtreleme, Sıralama ve SAYFALAMA ile)
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  // 1. Sayfalama için ayar
  const pageSize = 8; // Sayfa başına kaç ilan gösterilecek
  // URL'den ?page=X parametresini al (varsayılan: 1)
  const page = Number(req.query.page) || 1;

  // 2. Filtreleme için sorgu (query) parametrelerini al
  const { 
    category, 
    brand, 
    condition, 
    location, 
    keyword, 
    minPrice, 
    maxPrice 
  } = req.query;

  // 3. Filtre objesini oluştur
  const filter = {};
  filter.price = {}; 
  if (category && category !== 'all') { filter.category = category; }
  if (brand) { filter.brand = { $regex: brand, $options: 'i' }; }
  if (condition && condition !== 'all') { filter.condition = condition; }
  if (location && location !== 'all') { filter.location = location; }
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }
  if (minPrice) { filter.price.$gte = Number(minPrice); }
  if (maxPrice) { filter.price.$lte = Number(maxPrice); }
  if (Object.keys(filter.price).length === 0) {
    delete filter.price;
  }
  
  // 4. Sıralama (Sorting)
  const { sortBy } = req.query;
  let sortOptions = {};
  if (sortBy === 'price-low') { sortOptions = { price: 1 }; }
  else if (sortBy === 'price-high') { sortOptions = { price: -1 }; }
  else if (sortBy === 'oldest') { sortOptions = { createdAt: 1 }; }
  else { sortOptions = { createdAt: -1 }; }

  try {
    // 5. Önce, filtreye uyan TOPLAM ilan sayısını bul
    const totalListings = await Listing.countDocuments(filter);
    
    // 6. Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil(totalListings / pageSize);
    
    // 7. Veritabanı sorgusunu SAYFALAMA ile çalıştır
    const listings = await Listing.find(filter)
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(pageSize) // Sadece 'pageSize' kadar (örn: 8) ilan al
      .skip(pageSize * (page - 1)); // Önceki sayfaları atla (örn: Sayfa 2 için 8 * (2-1) = 8 ilanı atla)

    // 8. Frontend'e sadece ilanları değil, sayfa bilgilerini de gönder
    res.status(200).json({
      listings,       // O sayfadaki ilanlar
      page,           // Mevcut sayfa numarası
      totalPages,     // Toplam kaç sayfa var
      totalListings,  // Filtreye uyan toplam ilan sayısı
    });

  } catch (error) {
    // Hata oluşursa (örn: veritabanı bağlantı hatası)
    res.status(500);
    throw new Error('İlanlar getirilirken sunucu hatası oluştu: ' + error.message);
  }
});

// @desc    Giriş yapmış kullanıcının kendi ilanlarını getir
// @route   GET /api/listings/my-listings
// @access  Private (Sadece giriş yapanlar)
const getMyListings = asyncHandler(async (req, res) => {
  // 1. 'protect' middleware'i sayesinde req.user._id'yi biliyoruz
  // 2. Veritabanında 'user' alanı req.user._id ile eşleşen TÜM ilanları bul
  const listings = await Listing.find({ user: req.user._id })
    .sort({ createdAt: -1 }); // En yeniden eskiye sırala

  // 3. Kullanıcının ilanlarını gönder
  res.status(200).json(listings);
});

// @desc    Bir ilanı sil
// @route   DELETE /api/listings/:id
// @access  Private (Sadece ilan sahibi)
const deleteListing = asyncHandler(async (req, res) => {
  // 1. İlanı ID'sine göre bul
  const listing = await Listing.findById(req.params.id);

  // 2. İlan var mı?
  if (!listing) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }

  // 3. GÜVENLİK KONTROLÜ: İlanı silmek isteyen kullanıcı, ilanın sahibi mi?
  //    'protect' middleware'inden gelen req.user._id'yi, ilanın user'ıyla karşılaştır.
  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401); // 401 Unauthorized
    throw new Error('Yetkisiz işlem. Bu ilanı silemezsiniz.');
  }

  // 4. Cloudinary'den Resimleri Sil
  //    Bir hata olursa bile devam et, en azından DB'den silinsin.
  try {
    if (listing.images && listing.images.length > 0) {
      // Resimlerin 'public_id'lerini al
      const publicIds = listing.images.map(img => img.public_id);
      // Cloudinary'ye bu ID'leri silmesi için istek at
      await cloudinary.api.delete_resources(publicIds);
    }
  } catch (cloudinaryError) {
    console.warn('Cloudinary resimleri silinirken bir hata oluştu:', cloudinaryError.message);
    // Hata olsa bile ilanı DB'den silmeye devam et
  }

  // 5. İlanı Veritabanından Sil
  //    Mongoose 6 ve sonrası için: await listing.deleteOne();
  //    Veya:
  await Listing.findByIdAndDelete(req.params.id);

  // 6. Başarı mesajı gönder
  res.status(200).json({ message: 'İlan başarıyla silindi' });
});

// @desc    Bir ilanı güncelle
// @route   PUT /api/listings/:id
// @access  Private (Sadece ilan sahibi)
const updateListing = asyncHandler(async (req, res) => {
  // 1. İlanı ID'sine göre bul
  const listing = await Listing.findById(req.params.id);

  // 2. İlan var mı?
  if (!listing) {
    res.status(404);
    throw new Error('İlan bulunamadı');
  }

  // 3. GÜVENLİK KONTROLÜ: İlanı güncellemek isteyen, ilanın sahibi mi?
  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Yetkisiz işlem. Bu ilanı güncelleyemezsiniz.');
  }

  // 4. Güncellenecek metin verilerini req.body'den al
  const { 
    title, 
    description, 
    category, 
    subcategory, 
    brand, 
    condition, 
    price, 
    location 
  } = req.body;

  // 5. İlan objesini güncelle
  // (Resim güncellemesi şimdilik eklenmedi)
  listing.title = title || listing.title;
  listing.description = description || listing.description;
  listing.category = category || listing.category;
  listing.subcategory = subcategory || listing.subcategory;
  listing.brand = brand || listing.brand;
  listing.condition = condition || listing.condition;
  listing.price = price || listing.price;
  listing.location = location || listing.location;

  // 6. Güncellenmiş ilanı veritabanına kaydet
  const updatedListing = await listing.save();

  // 7. Başarılı cevabı gönder
  res.status(200).json(updatedListing);
});

// @desc    ID'ye göre tek bir ilan getir
// @route   GET /api/listings/:id
// @access  Public (Herkes erişebilir)
const getListingById = asyncHandler(async (req, res) => {
  // 1. URL'den ilanın ID'sini al (req.params.id)
  const listing = await Listing.findById(req.params.id)
    .populate('user', 'name avatar email bio memberSince'); // Satıcı bilgilerini doldur

  // 2. İlan veritabanında var mı?
  if (listing) {
    // 3. (Opsiyonel) Görüntülenme sayısını artır (henüz yapmıyoruz)
    // listing.views += 1;
    // await listing.save();

    // 4. İlanı JSON olarak gönder
    res.status(200).json(listing);
  } else {
    // 5. İlan yoksa 404 (Not Found) hatası ver
    res.status(404);
    throw new Error('İlan bulunamadı');
  }
});


// --- EXPORTS ---
// Bu blok, TÜM fonksiyon tanımlamalarından SONRA gelmeli
// ... en altta
// ... en altta
module.exports = {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  deleteListing,
  updateListing
};