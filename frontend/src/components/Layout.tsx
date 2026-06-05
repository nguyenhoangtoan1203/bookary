import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const navItems: Array<{ path: string; labelKey: string; icon: string; group: string }> = [
    { path: '/books', labelKey: 'nav.bookManagement', icon: '📚', group: 'management' },
    { path: '/readers', labelKey: 'nav.readerManagement', icon: '👥', group: 'management' },
    { path: '/dashboard', labelKey: 'nav.report', icon: '📊', group: 'management' },
    { path: '/borrow', labelKey: 'nav.borrowBook', icon: '➕', group: 'actions' },
    { path: '/return', labelKey: 'nav.return', icon: '↩️', group: 'actions' },
    { path: '/renew', labelKey: 'nav.renew', icon: '🔄', group: 'actions' },
  ];

  const groupedNavItems = navItems.reduce((acc, item) => {
    const groupName = item.group;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col border-r border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📚</span>
              <h1 className="text-2xl font-bold text-teal-700">Bookary</h1>
            </div>
            <p className="text-sm text-gray-600 ml-8">{t('nav.appName')}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {Object.entries(groupedNavItems).map(([group, items]) => (
            <div key={group}>
              <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <u>{t(`nav.${group}`)}</u>
              </h3>
              <div className="space-y-1">
                {items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                      location.pathname === item.path
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-teal-700'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">{t(item.labelKey)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
            <div className="p-4 bg-gradient-to-br from-teal-700 to-teal-800 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm truncate">{user?.email}</p>
                  <p className="text-xs text-teal-100 mt-1 font-medium">
                    {t('nav.roleAdmin')}
                  </p>
                </div>
              </div>
            </div>
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
          >
            🚪 {t('nav.logout')}
          </button>

          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {t('nav.logout')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('logout.confirmMessage')}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    {t('logout.cancel')}
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    {t('logout.confirm')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
