import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

async function bootstrap() {
  const rootElement = document.getElementById('root');
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    document.body.classList.add('admin-body');
    const { default: AdminApp } = await import('./admin/AdminApp.jsx');
    createRoot(rootElement).render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    );
    return;
  }

  await import('./index.css');
  const { default: App } = await import('./App.jsx');

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
