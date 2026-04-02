import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './i18n';

window.onerror = (msg, url, line, col, error) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:99999;padding:20px;';
  errDiv.innerHTML = `Fatal JS Error: ${msg} [${line}:${col}]`;
  document.body.appendChild(errDiv);
  return false;
};

document.getElementById('root').innerHTML = '<div style="color:white;padding:20px;">Main logic starting...</div>';

console.log('Main.jsx entry point initialized...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);

console.log('Main.jsx: createRoot.render called.');
