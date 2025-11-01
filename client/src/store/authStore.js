// client/src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// localStorage'dan veriyi almayı dene
const getInitialUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("localStorage'dan userInfo alınırken hata:", error);
    return null;
  }
};

const useAuthStore = create(
  persist(
    (set) => ({
      // === STATE ===
      userInfo: getInitialUserInfo(),

      // === ACTIONS (State'i değiştirecek fonksiyonlar) ===
      
      // Kullanıcı giriş yaptığında (veya kayıt olduğunda)
      login: (userData) => {
        // (Backend'den artık 'favoriteListings' de geliyor)
        try {
          localStorage.setItem('userInfo', JSON.stringify(userData));
          set({ userInfo: userData });
        } catch (error) {
          console.error("localStorage'a userInfo yazılırken hata:", error);
        }
      },

      // Kullanıcı çıkış yaptığında
      logout: () => {
        try {
          localStorage.removeItem('userInfo');
          set({ userInfo: null });
        } catch (error) {
          console.error("localStorage'dan userInfo silinirken hata:", error);
        }
      },
      
      // === YENİ FONKSİYON: Sadece Favorileri Güncelle ===
      updateFavorites: (newFavoriteList) => {
        set((state) => {
          // 1. Mevcut userInfo null ise bir şey yapma
          if (!state.userInfo) {
            return state;
          }
          // 2. Yeni userInfo objesini oluştur
          const newUserInfo = { 
            ...state.userInfo, 
            favoriteListings: newFavoriteList 
          };
          // 3. Hem localStorage'ı hem de state'i güncelle
          try {
            localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
            return { userInfo: newUserInfo };
          } catch (error) {
            console.error("localStorage'a favoriler yazılırken hata:", error);
            return state; // Hata olursa state'i değiştirme
          }
        });
      },

    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;