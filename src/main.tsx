import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Telegram WebApp SDK if available
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
      };
    };
  }
}

try {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    if (window.Telegram.WebApp.setHeaderColor) {
      window.Telegram.WebApp.setHeaderColor('#0a0714');
    }
    if (window.Telegram.WebApp.setBackgroundColor) {
      window.Telegram.WebApp.setBackgroundColor('#0a0714');
    }
  }
} catch (e) {
  console.warn('Telegram WebApp init bypassed:', e);
}

createRoot(document.getElementById('root')!).render(<App />);
