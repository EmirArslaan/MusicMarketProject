import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Hakkımızda */}
          <div>
            <h3 className="text-xl font-bold mb-4">MüzikPazar</h3>
            <p className="text-gray-400">
              Türkiye'nin en güvenilir müzik aleti alım-satım platformu.
            </p>
            <div className="flex space-x-4 mt-4">
              <FaFacebook className="text-2xl hover:text-primary cursor-pointer transition" />
              <FaTwitter className="text-2xl hover:text-primary cursor-pointer transition" />
              <FaInstagram className="text-2xl hover:text-primary cursor-pointer transition" />
              <FaYoutube className="text-2xl hover:text-primary cursor-pointer transition" />
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li><Link to="/ilanlar" className="text-gray-400 hover:text-white transition">İlanlar</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
              <li><Link to="/grup-ara" className="text-gray-400 hover:text-white transition">Grup Ara</Link></li>
              <li><Link to="/hakkimizda" className="text-gray-400 hover:text-white transition">Hakkımızda</Link></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              <li><Link to="/kategori/gitar" className="text-gray-400 hover:text-white transition">Gitarlar</Link></li>
              <li><Link to="/kategori/davul" className="text-gray-400 hover:text-white transition">Davullar</Link></li>
              <li><Link to="/kategori/klavye" className="text-gray-400 hover:text-white transition">Klavyeler</Link></li>
              <li><Link to="/kategori/ses-sistemi" className="text-gray-400 hover:text-white transition">Ses Sistemleri</Link></li>
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Destek</h3>
            <ul className="space-y-2">
              <li><Link to="/iletisim" className="text-gray-400 hover:text-white transition">İletişim</Link></li>
              <li><Link to="/sss" className="text-gray-400 hover:text-white transition">SSS</Link></li>
              <li><Link to="/gizlilik" className="text-gray-400 hover:text-white transition">Gizlilik Politikası</Link></li>
              <li><Link to="/kullanim-kosullari" className="text-gray-400 hover:text-white transition">Kullanım Koşulları</Link></li>
            </ul>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MüzikPazar. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;