import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast'; // <-- 1. İMPORT ET

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Toaster position="top-right" /> {/* <-- 2. BURAYA EKLE */}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;