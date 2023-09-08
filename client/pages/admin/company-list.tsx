import Layout from '@/components/layout/Layout';
import clsx from 'clsx';

export default function CompanyListPage() {
  return (
    <Layout
      defaultOpenKey="/admin"
      selectedKey="/admin/company-list"
      renderContent={(u) => {
        return (
          <>
            <header
              className={clsx(
                'flex justify-between items-center',
                'pb-4',
                'border-b border-[#f0f0f0]'
              )}
            >
              <h1 className="text-xl font-semibold text-gray-800">
                Company List
              </h1>
            </header>
          </>
        );
      }}
    />
  );
}
