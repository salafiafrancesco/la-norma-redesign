import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
const path  = window.location.pathname;
const isAdmin = path.startsWith('/admin');

// Paths that are NOT the root and NOT admin are server 404s shown in the SPA
// (Only matters when deployed; dev Vite always serves index.html)
const isKnownPath = path === '/' || path === '' || isAdmin ||
  path.startsWith('/uploads') || path.startsWith('/api');

if (isAdmin) {
  document.body.classList.add('admin-body');
  import('./admin/AdminApp.jsx').then(({ default: AdminApp }) => {
    createRoot(root).render(<StrictMode><AdminApp /></StrictMode>);
  });
} else {
  import('./index.css');
  import('./App.jsx').then(({ default: App }) => {
    createRoot(root).render(<StrictMode><App /></StrictMode>);
  });
}
