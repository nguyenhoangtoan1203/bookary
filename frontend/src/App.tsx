import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Login from './pages/Login';
import Books from './pages/Books';
import Readers from './pages/Readers';
import Borrow from './pages/Borrow';
import Return from './pages/Return';
import Renew from './pages/Renew';
import Dashboard from './pages/Dashboard';
import BorrowHistory from './pages/BorrowHistory';
import BorrowStatus from './pages/BorrowStatus';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/" />;
};

const TitleUpdater = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  return null;
};

function AppContent() {
  return (
    <>
      <TitleUpdater />
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Books />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/readers" element={<AdminRoute><Readers /></AdminRoute>} />
                  <Route path="/borrow" element={<AdminRoute><Borrow /></AdminRoute>} />
                  <Route path="/return" element={<AdminRoute><Return /></AdminRoute>} />
                  <Route path="/renew" element={<AdminRoute><Renew /></AdminRoute>} />
                  <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  <Route path="/borrow-history" element={<BorrowHistory />} />
                  <Route path="/borrow-status" element={<BorrowStatus />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
