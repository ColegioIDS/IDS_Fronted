// components/common/Toaster.tsx
'use client';

import { ToastContainer } from 'react-toastify';
import { useTheme } from '@/context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

export default function Toaster() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      theme={theme === 'dark' ? 'dark' : 'light'}
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}