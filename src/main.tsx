import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './index.css';

console.log('🚀 [main.tsx] Script loaded.');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ [main.tsx] Root element not found!');
  } else {
    console.log('✅ [main.tsx] Root element found. Mounting React...');
    
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('🎉 [main.tsx] root.render() executed.');
  }
} catch (e: any) {
  console.error('💥 [main.tsx] Render crash:', e);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: red; padding: 30px; font-family: monospace; background: white;">
        <h2>💥 Render Crash caught in main.tsx</h2>
        <pre>${e?.message || e}</pre>
        <pre>${e?.stack || ''}</pre>
      </div>
    `;
  }
}

