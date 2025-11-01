// client/src/components/common/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    // Sayfanın tamamını kaplayan bir yükleyici
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Sadece component'in yerinde dönen küçük yükleyici
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default LoadingSpinner;