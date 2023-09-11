import Layout, { StudentUser } from '@/components/layout/Layout';
import { Button, Result } from 'antd';
import clsx from 'clsx';
import Link from 'next/link';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const PageContent = ({ user }: { user: StudentUser }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/students/progress-report`, {
            method: 'GET',
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message || 'Something went wrong');
        }

        if (response.data && response.data.downloadUrl) {
          setDownloadUrl(response.data.downloadUrl);
          setUploadedAt(new Date(response.data.uploadedAt));
        } else {
          setDownloadUrl(null);
          setUploadedAt(null);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <header
        className={clsx(
          'flex justify-between items-center',
          'pb-4',
          'border-b border-[#f0f0f0]'
        )}
      >
        <h1 className="text-xl font-semibold text-gray-800">Progress Report</h1>
      </header>
      <div
        className={clsx('flex flex-col justify-center items-center', 'mt-5')}
      >
        <Dragger
          name="progressReportFile"
          accept=".pdf"
          maxCount={1}
          multiple={false}
          className="w-full lg:w-[400px]"
          action={`${API_URL}/students/progress-report`}
          withCredentials
          onChange={(info) => {
            const { status } = info.file;
            if (status !== 'uploading') {
              console.log(info.file, info.fileList);
            }
            if (status === 'done') {
              toast.success(`File uploaded successfully.`);
              setDownloadUrl(info.file.response.data.downloadUrl);
            } else if (status === 'error') {
              toast.error(`File upload failed.`);
            }
          }}
          onDrop={(e) => {
            console.log('Dropped files', e.dataTransfer.files);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">Supported file type: .pdf</p>
        </Dragger>
        {loading ? (
          <div className="mt-5">Loading...</div>
        ) : (
          <>
            <div className="mt-5 w-full lg:w-[400px] flex justify-center flex-col">
              <div className="flex items-center space-x-2">
                <p className="text-gray-500 whitespace-nowrap">
                  Last uploaded file:
                </p>
                <p className="text-gray-800 truncate">
                  {downloadUrl
                    ? `progress-report-${user.studentId}.pdf`
                    : 'No file uploaded'}
                </p>
              </div>
              {uploadedAt && (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500">Uploaded at:</p>
                  <p className="text-gray-800">
                    {new Date(uploadedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {downloadUrl && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="middle"
                href={downloadUrl}
                className="bg-primary mt-5"
              >
                Download
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default function StudentProgressReportPage() {
  return (
    <Layout
      defaultOpenKey="/student"
      selectedKey="/student/progress-report"
      renderContent={(u) => {
        const user = u as StudentUser;

        if (!user.supervisor) {
          return (
            <div className="flex justify-center items-center h-full">
              <Result
                title="You are not assigned to a supervisor yet"
                extra={<Link href="/student/auth">View Profile</Link>}
              />
            </div>
          );
        }

        // Check if student internship status is not yet submitted, submitted, or rejected
        if (!user.internship) {
          return (
            <div className="flex justify-center items-center h-full">
              <Result
                title="You have not submitted your internship application"
                extra={<Link href="/student/auth">View Profile</Link>}
              />
            </div>
          );
        }

        if (
          user.internship.status === 'SUBMITTED' ||
          user.internship.status === 'REJECTED'
        ) {
          return (
            <div className="flex justify-center items-center h-full">
              <Result
                title={
                  user.internship.status === 'SUBMITTED'
                    ? 'Your internship application is still being processed'
                    : 'Your internship application is rejected'
                }
                status={
                  user.internship.status === 'SUBMITTED' ? 'info' : 'error'
                }
                extra={
                  <Link href="/student/submit-internship">View Submission</Link>
                }
              />
            </div>
          );
        }

        return <PageContent user={user} />;
      }}
    />
  );
}
