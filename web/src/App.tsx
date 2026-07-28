import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import SiteLayout from '@/components/layout/SiteLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

import HomePage from '@/pages/HomePage';
import BotsPage from '@/pages/BotsPage';
import BotDetailPage from '@/pages/BotDetailPage';
import WebsitesPage from '@/pages/WebsitesPage';
import WebsiteDetailPage from '@/pages/WebsiteDetailPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import BotAddPage from '@/pages/admin/BotAddPage';
import BotEditPage from '@/pages/admin/BotEditPage';
import WebsiteAddPage from '@/pages/admin/WebsiteAddPage';
import WebsiteEditPage from '@/pages/admin/WebsiteEditPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Bot and website detail pages render full-bleed, so they sit
              outside SiteLayout rather than inside the header/footer chrome. */}
          <Route path="/bot/:slug" element={<BotDetailPage />} />
          <Route path="/website/:slug" element={<WebsiteDetailPage />} />

          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/bots" element={<BotsPage />} />
            <Route path="/websites" element={<WebsitesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/add" element={<BotAddPage />} />
            <Route path="/admin/edit/:id" element={<BotEditPage />} />
            <Route path="/admin/websites/add" element={<WebsiteAddPage />} />
            <Route path="/admin/websites/edit/:id" element={<WebsiteEditPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
