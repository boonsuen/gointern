import Layout from '@/components/layout/Layout';
import clsx from 'clsx';

export default function JobBoard() {
  return (
    <Layout defaultOpenKey="/jobboard" selectedKey="/jobboard">
      <header
        className={clsx(
          'flex justify-between items-center',
          'pb-4',
          'border-b border-[#f0f0f0]'
        )}
      >
        <h1 className="text-xl font-semibold text-gray-800">Job Board</h1>
      </header>
      <div></div>
    </Layout>
  );
}
