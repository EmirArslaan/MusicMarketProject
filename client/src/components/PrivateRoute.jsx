// client/src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function PrivateRoute() {
  // 1. Zustand store'dan kullanıcı bilgisini al
  const { userInfo } = useAuthStore();

  // 2. Kullanıcı giriş yapmış mı?
  if (userInfo) {
    // 3. Evet, yapmış. İstenen sayfayı (Outlet) göster.
    return <Outlet />;
  } else {
    // 4. Hayır, yapmamış. /login sayfasına yönlendir.
    // 'replace' anahatarı, tarayıcı geçmişinde "geri" tuşuna basmasını engeller.
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;