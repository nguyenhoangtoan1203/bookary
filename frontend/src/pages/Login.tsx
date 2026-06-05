import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-teal-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-4xl font-bold text-teal-700">Bookary</h1>
          <p className="text-gray-600 mt-2 font-medium">{t('login.title')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">{t('login.errorMessage')}</p>
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('login.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder={t('login.fullName')}
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                {t('common.loading')}
              </span>
            ) : (
              isRegister ? t('login.createAccount') : t('login.login')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isRegister ? t('login.haveAccount') + ' ' : t('login.noAccount') + ' '}
          </p>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-teal-600 hover:text-teal-700 font-semibold mt-1 transition"
          >
            {isRegister ? t('login.signIn') : t('login.createOne')}
          </button>
        </div>

        {!isRegister && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600 bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-3">{t('login.demoCredentials')}</p>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-700">Admin 1</p>
                <p className="text-gray-600">thuthu@quanlysach.com / 123456</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Admin 2</p>
                <p className="text-gray-600">admin@quanlysach.com / admin123</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
