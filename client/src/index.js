// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'; // 1. React Query'yi import et

// 2. Yeni bir Query Client (veri çekme yöneticisi) oluştur
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 3. Tüm uygulamayı (App) QueryClientProvider ile sar */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);