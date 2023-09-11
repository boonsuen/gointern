import Layout, { SupervisorUser } from '@/components/layout/Layout';
import { API_URL } from '@/lib/constants';
import { Button, Form, Input, Modal, Result, Select, Spin, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface Student {
  studentId: string;
  fullName: string;
  email: string;
}

interface DataType {
  key: React.Key;
  studentId: string;
  fullName: string;
  email: string;
}

export default function MyStudentsPage() {
  const columns: ColumnsType<DataType> = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
    },
    {
      title: 'View Progress Report',
      dataIndex: 'email',
    },
  ];

  const onChange: TableProps<DataType>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  const [isAssignStudentModalOpen, setIsAssignStudentModalOpen] =
    useState(false);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showAssignStudentModal = () => {
    setIsAssignStudentModalOpen(true);
  };

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/supervisors/my-students`, {
            method: 'GET',
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message || 'Something went wrong');
        }

        const students = response.data as Student[];

        setAssignedStudents(students);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedStudents();
  }, []);

  return (
    <Layout
      defaultOpenKey="/supervisor"
      selectedKey="/supervisor/progress-report"
      renderContent={(u) => {
        const user = u as SupervisorUser;

        if (!user.isApproved) {
          return (
            <div className="flex justify-center items-center h-full">
              <Result
                title="Your account is not approved yet"
                extra={<Link href="/supervisor/auth">View Profile</Link>}
              />
            </div>
          );
        }

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
                Progress Report
              </h1>
            </header>
            <Table
              loading={isLoading}
              columns={columns}
              dataSource={assignedStudents.map((student) => ({
                key: student.studentId,
                studentId: student.studentId,
                fullName: student.fullName,
                email: student.email,
              }))}
              onChange={onChange}
              bordered
              title={() => (
                <p>
                  You have {assignedStudents.length} students under your
                  supervision
                </p>
              )}
            />
          </>
        );
      }}
    />
  );
}
