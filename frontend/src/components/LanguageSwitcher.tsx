import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer hover:border-gray-400"
      >
        <option value="vi">🇻🇳 {t('common.vietnameseLang')}</option>
        <option value="en">🇺🇸 {t('common.englishLang')}</option>
      </select>
    </div>
  );
}
