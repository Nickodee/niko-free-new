import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './mobile-optimizations.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

// Remove initial loader after React renders
setTimeout(() => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      loader.remove();
    }, 300);
  }
}, 100);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
