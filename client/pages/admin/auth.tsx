import Layout, { AdminUser } from '@/components/layout/Layout';
import { API_URL } from '@/lib/constants';
import { Button } from 'antd';
import clsx from 'clsx';
import { useRouter } from 'next/router';

export default function AdminAuthPage() {
  const router = useRouter();

  const handleAdminLogout = () => {
    fetch(`${API_URL}/admins/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          router.reload();
        }
      });
  };

  return (
    <Layout
      defaultOpenKey="/admin"
      selectedKey="/admin/auth"
      renderContent={(u) => {
        const user = u as AdminUser;
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
                Your Profile
              </h1>
            </header>
            <div
              className={clsx(
                'flex flex-col justify-center items-center',
                'mt-5'
              )}
            >
              <h1 className={clsx('mt-8 mb-4 text-2xl font-semibold text-gray-800')}>
                You are logged in as
              </h1>
              <p>{user.email}</p>
              <div
                className={clsx(
                  'border-gray-200 rounded-md',
                  'w-full min-[900px]:w-[480px]'
                )}
              ></div>
              <Button
                type="primary"
                danger
                className="mt-5"
                onClick={handleAdminLogout}
              >
                Logout
              </Button>
            </div>
          </>
        );
      }}
    />
  );
}
