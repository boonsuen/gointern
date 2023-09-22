import Layout from '@/components/layout/Layout';
import clsx from 'clsx';

export default function AnnouncementPage() {
  return (
    <Layout defaultOpenKey="/announcement" selectedKey="/announcement">
      <header
        className={clsx(
          'flex justify-between items-center',
          'pb-4',
          'border-b border-[#f0f0f0]'
        )}
      >
        <h1 className="text-xl font-semibold text-gray-800">Announcement</h1>
      </header>
      <div></div>
    </Layout>
  );
}
