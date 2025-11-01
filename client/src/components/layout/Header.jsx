// client/src/components/layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { FaGuitar, FaSearch, FaUser, FaHeart } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react'; 

function Header() {
  const { userInfo, logout } = useAuthStore();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('Başarıyla çıkış yaptınız');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    if (keyword.trim()) {
      navigate(`/ilanlar?keyword=${keyword.trim()}`);
      setKeyword(''); 
    } else {
      navigate('/ilanlar');
    }
  };


  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === ÜST KISIM (Logo, Nav, Arama, Kullanıcı Menüsü) === */}
        <div className="flex justify-between items-center h-16">
          
          {/* --- Sol Taraf: Logo + Ana Navigasyon --- */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <FaGuitar className="text-primary text-3xl" />
              <span className="text-2xl font-bold text-gray-800">
                MüzikPazar
              </span>
            </Link>

            {/* === YENİ ANA NAVİGASYON (Orta ve Geniş Ekran) === */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/ilanlar" 
                className="text-gray-600 hover:text-primary font-semibold transition"
              >
                İlanlar
              </Link>
              <Link 
                to="/grup-ara" 
                className="text-gray-600 hover:text-primary font-semibold transition"
              >
                Grup Ara
              </Link>
              <Link 
                to="/blog" 
                className="text-gray-600 hover:text-primary font-semibold transition"
              >
                Blog
              </Link>
            </nav>
            {/* === YENİ ANA NAVİGASYON SONU === */}
          </div>

          {/* --- Sağ Taraf: Arama + Kullanıcı Menüsü --- */}
          <div className="flex items-center space-x-4">
            {/* Arama Çubuğu (Geniş ekranda) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-xs">
              <div className="relative w-full">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ara..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="absolute left-3 top-3 text-gray-400 hover:text-primary transition">
                  <FaSearch />
                </button>
              </div>
            </form>

            {/* Kullanıcı Menüsü (İkonlar ve Giriş) */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {userInfo ? (
                // === GİRİŞ YAPMIŞSA ===
                <>
                  <Link to="/favorilerim" className="text-gray-600 hover:text-primary transition">
                    <FaHeart className="text-2xl" />
                  </Link>
                  <Link 
                    to="/ilan-ver" 
                    className="hidden sm:block bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    İlan Ver
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => navigate('/profil')}
                      className="flex items-center gap-2 text-gray-700 font-semibold"
                    >
                      <img 
                        src={userInfo.avatar} 
                        alt={userInfo.name} 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                      <span className="hidden sm:inline">Hoş geldin, {userInfo.name.split(' ')[0]}</span>
                    </button>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="hidden sm:inline text-gray-600 hover:text-primary transition font-semibold"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                // === GİRİŞ YAPMAMIŞSA ===
                <>
                  <Link to="/favorilerim" className="text-gray-600 hover:text-primary transition">
                    <FaHeart className="text-2xl" />
                  </Link>
                  <Link to="/login" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-primary transition">
                    <FaUser className="text-2xl" />
                    <span>Giriş Yap</span>
                  </Link>
                  <Link 
                    to="/login"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    İlan Ver
                  </Link> 
                </>
              )}
            </div>
          </div>
        </div>

        {/* === ALT KISIM (Mobil Arama ve Navigasyon) === */}
        <div className="md:hidden pt-2 pb-3 border-t border-gray-100">
          {/* Mobil Arama */}
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enstrüman, marka veya kategori ara..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="absolute left-3 top-3 text-gray-400 hover:text-primary transition">
                <FaSearch />
              </button>
            </div>
          </form>
          {/* === YENİ MOBİL NAVİGASYON === */}
          <nav className="flex justify-around">
            <Link 
              to="/ilanlar" 
              className="text-gray-600 hover:text-primary font-semibold transition"
            >
              İlanlar
            </Link>
            <Link 
              to="/grup-ara" 
              className="text-gray-600 hover:text-primary font-semibold transition"
            >
              Grup Ara
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-600 hover:text-primary font-semibold transition"
            >
              Blog
            </Link>
          </nav>
          {/* === YENİ MOBİL NAVİGASYON SONU === */}
        </div>
      </div>
    </header>
  );
}

export default Header;