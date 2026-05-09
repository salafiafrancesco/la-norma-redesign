import { useState } from 'react';
import './admin.css';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentEditor from './pages/ContentEditor';
import BlogManager from './pages/BlogManager';
import ImagesPage from './pages/ImagesPage';
import CateringManager from './pages/CateringManager';
import ExperiencesManager from './pages/ExperiencesManager';
import HomepageManager from './pages/HomepageManager';
import InquiriesManager from './pages/InquiriesManager';
import MenuManager from './pages/MenuManager';
import NavigationManager from './pages/NavigationManager';
import FooterManager from './pages/FooterManager';
import NewsletterManager from './pages/NewsletterManager';
import ThemeManager from './pages/ThemeManager';

function AdminContent() {
  const { admin, checking } = useAdmin();
  const [page, setPage] = useState('dashboard');

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#6B7280' }}>
        <div className="adm-spinner" style={{ marginRight: '0.75rem' }} />
        Loading…
      </div>
    );
  }

  if (!admin) return <Login />;

  const pages = {
    dashboard:  <Dashboard setPage={setPage} />,
    homepage:   <HomepageManager />,
    menu:       <MenuManager />,
    content:    <ContentEditor />,
    navigation: <NavigationManager />,
    footer:     <FooterManager />,
    theme:      <ThemeManager />,
    blog:       <BlogManager />,
    images:     <ImagesPage />,
    experiences: <ExperiencesManager />,
    catering:   <CateringManager />,
    inquiries:  <InquiriesManager />,
    newsletter: <NewsletterManager />,
  };

  return (
    <AdminLayout page={page} setPage={setPage}>
      {pages[page] || pages.dashboard}
    </AdminLayout>
  );
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}
