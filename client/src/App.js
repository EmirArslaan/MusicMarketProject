// client/src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Public Pages
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BandSearchPage from './pages/BandSearchPage';
import BandDetailPage from './pages/BandDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Private Pages
import PrivateRoute from './components/PrivateRoute';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import EditListingPage from './pages/EditListingPage';
import CreateBandPostPage from './pages/CreateBandPostPage';
import CreateBlogPostPage from './pages/CreateBlogPostPage';
import FavoritesPage from './pages/FavoritesPage';
import EditBlogPostPage from './pages/EditBlogPostPage';
import EditBandPostPage from './pages/EditBandPostPage';
import EditProfilePage from './pages/EditProfilePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          
          {/* === Public Rotalar === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/ilanlar" element={<ListingsPage />} />
          <Route path="/ilan/:id" element={<ListingDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/grup-ara" element={<BandSearchPage />} />
          <Route path="/grup-ara/:id" element={<BandDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* === Private Rotalar (Giriş Gerekli) === */}
          <Route path="" element={<PrivateRoute />}>
            <Route path="/ilan-ver" element={<CreateListingPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/ilan-duzenle/:id" element={<EditListingPage />} />
            <Route path="/grup-ilani-ver" element={<CreateBandPostPage />} />
            <Route path="/blog-yazisi-olustur" element={<CreateBlogPostPage />} />
            <Route path="/favorilerim" element={<FavoritesPage />} /> 
            <Route path="/blog-duzenle/:id" element={<EditBlogPostPage />} />
            <Route path="/grup-ilani-duzenle/:id" element={<EditBandPostPage />} />
            <Route path="/profil/duzenle" element={<EditProfilePage />} />
          </Route>

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;