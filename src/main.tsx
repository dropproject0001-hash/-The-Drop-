import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './app/App.tsx';
import './index.css';
import { fixLeafletDefaultIcons } from '@/lib/fixLeafletIcons';
import { validateEnvOnStartup } from '@/lib/validateEnv';

// Validate environment variables before rendering the app
validateEnvOnStartup();

fixLeafletDefaultIcons();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
