// client/src/components/common/BandCard.jsx
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaMusic, FaUsers, FaClock } from 'react-icons/fa';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

function BandCard({ band }) { // 'band' prop'u artık backend'den geliyor

  // Tarihi formatla
  const timeAgo = band.createdAt
    ? formatDistanceToNow(parseISO(band.createdAt), { addSuffix: true, locale: tr })
    : '';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden h-full flex flex-col">
      <div className="p-6 flex-grow">
        {/* Üst Kısım - Tür ve Tarih */}
        <div className="flex justify-between items-start mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
            {band.type} {/* <-- Gerçek veri */}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <FaClock className="mr-1 text-xs" />
            <span>{timeAgo}</span> {/* <-- GÜNCELLENDİ */}
          </div>
        </div>

        {/* Başlık */}
        <Link to={`/grup-ara/${band._id}`}> {/* <-- GÜNCELLENDİ (band.id -> band._id) */}
          <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-primary transition">
            {band.title} {/* <-- Gerçek veri */}
          </h3>
        </Link>

        {/* Açıklama */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {band.description} {/* <-- Gerçek veri */}
        </p>

        {/* Aranan Enstrümanlar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FaMusic className="text-primary" />
            <span className="font-semibold">Aranan:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {band.lookingFor.map((instrument, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {instrument} {/* <-- Gerçek veri */}
              </span>
            ))}
          </div>
        </div>

        {/* Müzik Türleri */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {band.genres.map((genre, index) => (
              <span
                key={index}
                className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-semibold"
              >
                {genre} {/* <-- Gerçek veri */}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Alt Kısım - Footer of the card */}
      <div className="p-6 border-t border-gray-100">
        {/* Konum ve Üye Sayısı */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600 text-sm capitalize">
            <FaMapMarkerAlt className="mr-2 text-primary" />
            <span>{band.location}</span> {/* <-- Gerçek veri */}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaUsers className="mr-2 text-secondary" />
            <span>{band.currentMembers} kişi</span> {/* <-- Gerçek veri */}
          </div>
        </div>

        {/* İletişim Butonu */}
        <Link 
          to={`/grup-ara/${band._id}`}
          className="w-full block text-center bg-primary hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold"
        >
          İletişime Geç
        </Link>
      </div>
    </div>
  );
}

export default BandCard;