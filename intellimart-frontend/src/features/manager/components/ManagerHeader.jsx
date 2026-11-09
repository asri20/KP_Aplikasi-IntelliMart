import ManagerSidebar from './organisms/ManagerSidebar';
import TopManagerHeader from './organisms/ManagerHeader';

export function ManagerHeader({ title, subtitle, onSearch }) {
  return (
    <>
      <ManagerSidebar />
      <div className="lg:pl-64">
        <TopManagerHeader onSearch={onSearch} />
        {(title || subtitle) && (
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ManagerHeader;

