import Layout, { StudentUser } from '@/components/layout/Layout';
import { API_URL } from '@/lib/constants';
import { Button } from 'antd';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function StudentAuthPage() {
  const router = useRouter();

  const handleStudentLogout = () => {
    fetch(`${API_URL}/students/logout`, {
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
      defaultOpenKey="/student"
      selectedKey="/student/auth"
      renderContent={(u) => {
        const user = u as StudentUser;
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
              <h1 className={clsx('my-8 text-2xl font-semibold text-gray-800')}>
                Welcome, {user.fullName}
              </h1>
              <div
                className={clsx(
                  'border-gray-200 rounded-md',
                  'w-full min-[900px]:w-[480px]'
                )}
              >
                <div className="border-b py-2 flex gap-5 justify-between">
                  <span className="text-sm text-slate-700">Email</span>
                  <strong className="text-sm text-slate-700">
                    {user.email}
                  </strong>
                </div>
                <div className="border-b py-2 flex gap-5 justify-between">
                  <span className="text-sm text-slate-700">Student ID</span>
                  <strong className="text-sm text-slate-700">
                    {user.studentId}
                  </strong>
                </div>
                <div className="border-b py-2 flex gap-5 justify-between">
                  <span className="text-sm text-slate-700">Full Name</span>
                  <strong className="text-sm text-slate-700">
                    {user.fullName}
                  </strong>
                </div>
                <div className="py-2 flex gap-5 justify-between">
                  <span className="text-sm text-slate-700">IC Number</span>
                  <strong className="text-sm text-slate-700">
                    {user.icNumber}
                  </strong>
                </div>
              </div>
              <Button
                type="primary"
                danger
                className="mt-5"
                onClick={handleStudentLogout}
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
