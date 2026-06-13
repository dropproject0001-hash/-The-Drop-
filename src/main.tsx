import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { validateEnv } from './lib/env';
import './index.css';

console.log('🚀 [main.tsx] Script loaded.');

// FIX C-1: Validate environment variables before mounting the app
const envStatus = validateEnv();
if (!envStatus.ok) {
  console.error('❌ [main.tsx] Environment validation failed:', envStatus.missing);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: #ef4444; padding: 40px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background: #000; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 20px; letter-spacing: 0.1em; border-bottom: 1px solid #ef4444; padding-bottom: 10px;">ENVIRONMENT_ERROR</h1>
        <p style="color: #94a3b8; max-width: 500px; line-height: 1.6;">The following required environment variables are missing or invalid:</p>
        <ul style="list-style: none; padding: 0; margin-top: 20px; color: #fff; font-weight: bold;">
          ${envStatus.missing.map(m => `<li style="margin-bottom: 8px;">• ${m}</li>`).join('')}
        </ul>
        <p style="margin-top: 40px; color: #475569; font-size: 12px;">Check your .env file and restart the development server.</p>
      </div>
    `;
  }
}

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

