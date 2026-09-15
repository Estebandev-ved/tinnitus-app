import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAdminAuth } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgressBar from './components/ScrollProgressBar';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import CookieBanner from './components/CookieBanner';
import Page from './components/Page';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Descargas from './pages/Descargas';
import Faq from './pages/Faq';
import Contacto from './pages/Contacto';
import Planes from './pages/Planes';
import LegalPage from './pages/Legal';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsuariosPage from './pages/admin/UsuariosPage';
import ContentPage from './pages/admin/ContentPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AlertsPage from './pages/admin/AlertsPage';
import ExportPage from './pages/admin/ExportPage';
import PushPage from './pages/admin/PushPage';
import DescargasAdmin from './pages/admin/DescargasAdmin';
import UserDetail from './pages/admin/UserDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Asistente from './pages/Asistente';
import Cuidador from './pages/Cuidador';

function PublicLayout({ children }) {
  return (
    <div className="site">
      <Navbar />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}

function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useUserAuth();
  const { isAuthenticated } = useAdminAuth();

  if (!currentUser) return <Navigate to="/ingresar" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  if (!isAuthenticated) {
    return (
      <div className="admin-shell">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
          <p>Preparando panel administrativo…</p>
          <p className="muted">Si no se carga, verifica que el backend esté corriendo en :8080</p>
        </div>
      </div>
    );
  }

  return children;
}

function UserRoute({ children }) {
  const { currentUser } = useUserAuth();
  if (!currentUser) return <Navigate to="/ingresar" replace />;
  return children;
}

function AdminArea() {
  return (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserAuthProvider>
          <ScrollProgressBar />
          <ScrollToTop />
          <BackToTop />
          <CookieBanner />
          <AnimatePresence mode="wait">
            <Routes>
            <Route path="/" element={<PublicLayout><Page><Home /></Page></PublicLayout>} />
            <Route path="/descargas" element={<PublicLayout><Page><Descargas /></Page></PublicLayout>} />
            <Route path="/faq" element={<PublicLayout><Page><Faq /></Page></PublicLayout>} />
            <Route path="/planes" element={<PublicLayout><Page><Planes /></Page></PublicLayout>} />
            <Route path="/contacto" element={<PublicLayout><Page><Contacto /></Page></PublicLayout>} />
            <Route path="/aviso-medico" element={<PublicLayout><Page><LegalPage kind="aviso" /></Page></PublicLayout>} />
            <Route path="/privacidad" element={<PublicLayout><Page><LegalPage kind="privacidad" /></Page></PublicLayout>} />
            <Route path="/terminos" element={<PublicLayout><Page><LegalPage kind="terminos" /></Page></PublicLayout>} />
            <Route path="/ingresar" element={<PublicLayout><Page><Login /></Page></PublicLayout>} />
            <Route path="/registro" element={<PublicLayout><Page><Signup /></Page></PublicLayout>} />
            <Route path="/perfil" element={<UserRoute><PublicLayout><Page><Profile /></Page></PublicLayout></UserRoute>} />
            <Route path="/asistente" element={<PublicLayout><Page><Asistente /></Page></PublicLayout>} />
            <Route path="/cuidador" element={<PublicLayout><Page><Cuidador /></Page></PublicLayout>} />
            <Route path="/admin" element={<AdminArea />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="usuarios/:id" element={<UserDetail />} />
              <Route path="contenido" element={<ContentPage />} />
              <Route path="analitica" element={<AnalyticsPage />} />
              <Route path="alertas" element={<AlertsPage />} />
              <Route path="exportar" element={<ExportPage />} />
              <Route path="push" element={<PushPage />} />
              <Route path="descargas" element={<DescargasAdmin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        </UserAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
