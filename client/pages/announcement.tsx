import Layout from '@/components/layout/Layout';
import { Card, Space } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Announcement } from './admin/manage-announcement';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';

export default function AnnouncementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/admins/announcements`, {
            method: 'GET',
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message || 'Something went wrong');
        }

        const announcements = response.data as Announcement[];
        setAnnouncements(announcements);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

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
      <div className="mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="w-full grid gap-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                title={announcement.title}
                extra={
                  <Space>
                    <span>{new Date(announcement.postedAt).toLocaleString()}</span>
                  </Space>
                }
                style={{ width: '100%' }}
              >
                <p>{announcement.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
