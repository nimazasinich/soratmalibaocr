import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-primary-600">🧠</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
              راهنما
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
