import Layout from '@/components/layout/Layout';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Job } from './company/manage-jobs';
import { API_URL } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { Card, Spin, Space } from 'antd';

export default function JobBoard() {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  
useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await (
        await fetch(`${API_URL}/companies/jobboard`, {
          method: 'GET',
          credentials: 'include',
        })
      ).json();

      if (!response.success) {
        return toast.error(response.message || 'Something went wrong');
      }

      const jobs = response.data as Job[];
      setJobs(jobs);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchJobs();
}, []);

  return (
    <Layout
        defaultOpenKey="/jobboard"
        selectedKey="/jobboard">
        {isLoading ? (
          <div className={clsx('flex justify-center items-center h-full')}>
            <Spin />
          </div>
        ) : (
          <>
            <header
              className={clsx(
                'flex justify-between items-center',
                'pb-4',
                'border-b border-[#f0f0f0]'
              )}
            >
              <h1 className="text-xl font-semibold text-gray-800">
                Job Board
              </h1>
            </header>
            <div className="mt-8 grid gap-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  title={<span className="text-lg font-semibold text-gray-800">{job.title}</span>}
                  extra={
                    <Space>
                      <span>
                        {new Date(job.postedAt).toLocaleString()}
                      </span>
                    </Space>
                  }
                  style={{ width: '100%' }}
                >
                  <h3><span className="text-lg font-semibold text-gray-800">Company: </span>{job.company}</h3>
                  <br/>
                  <h2><span className="text-md font-semibold text-gray-800">Location: </span>{job.location}</h2>
                  <h2><span className="text-md font-semibold text-gray-800">Salary: </span>{job.salary}</h2>
                  <h2><span className="text-md font-semibold text-gray-800">Job Description: </span>{job.description}</h2>
                  <h2><span className="text-md font-semibold text-gray-800">Contact Us: </span>{job.companyEmail}</h2>
                </Card>
              ))}
            </div>
          </>
        )}
    </Layout>
  );
}
