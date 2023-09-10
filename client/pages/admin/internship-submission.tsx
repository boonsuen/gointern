import Layout, { AdminUser } from '@/components/layout/Layout';
import { API_URL } from '@/lib/constants';
import { Modal, Space, Table, TableProps } from 'antd';
import { ColumnsType } from 'antd/es/table';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Student {
  studentId: string;
  fullName: string;
  email: string;
  icNumber: string;
  createdAt: string;
  supervisor: {
    fullName: string;
    email: string;
  };
  internship: {
    id: string;
    startDate: string;
    endDate: string;
    allowance: number;
    createdAt: string;
    comSupervisorEmail: string;
    comSupervisorName: string;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    company: {
      companyName: string;
      email: string;
    };
  };
}

interface DataType {
  key: React.Key;
  studentId: string;
  fullName: string;
  email: string;
  icNumber: string;
  createdAt: string;
  supervisor: {
    fullName: string;
    email: string;
  };
  internship: {
    id: string;
    startDate: string;
    endDate: string;
    allowance: number;
    createdAt: string;
    comSupervisorEmail: string;
    comSupervisorName: string;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    company: {
      companyName: string;
      email: string;
    };
  };
}

export default function InternshipSubmissionPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/admins/students`, {
            method: 'GET',
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message || 'Something went wrong');
        }

        const students = response.data as Student[];

        setStudents(students);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Submitted At',
      dataIndex: ['internship', 'createdAt'],
      sorter: (a, b) =>
        a.internship.createdAt.localeCompare(b.internship.createdAt),
      sortDirections: ['descend', 'ascend'],
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: 'Student ID',
      dataIndex: 'studentId',
    },
    {
      title: 'Student Name',
      dataIndex: 'fullName',
    },
    {
      title: 'Status',
      dataIndex: ['internship', 'status'],
      render: (value) => {
        switch (value) {
          case 'SUBMITTED':
            return (
              <span className="text-yellow-500 font-semibold">Submitted</span>
            );
          case 'APPROVED':
            return (
              <span className="text-green-500 font-semibold">Approved</span>
            );
          case 'REJECTED':
            return (
              <span className="text-red-500 font-semibold">Rejected</span>
            );
        }
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle" direction="vertical">
          <button
            onClick={() => {
              setSelectedStudent(
                students.find(
                  (student) => student.studentId === record.studentId
                ) || null
              );
              setIsModalVisible(true);
            }}
            className="text-primary whitespace-nowrap hover:text-[#69b1ff] transition-colors"
          >
            View Internship Details
          </button>
          {record.internship.status === 'SUBMITTED' && (
            <Space size="middle">
              <button
                onClick={() => handleApprove(record.internship.id)}
                className="text-green-500 hover:text-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(record.internship.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Reject
              </button>
            </Space>
          )}
        </Space>
      ),
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

  const handleApprove = async (id: string) => {
    try {
      toast.promise(
        fetch(`${API_URL}/admins/students/approve`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            internshipId: id,
           }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setStudents((prev) =>
                prev.map((student) =>
                  student.internship.id === id
                    ? { ...student, internship: { ...student.internship, status: 'APPROVED' } }
                    : student
                )
              );
            }
          }),
        {
          loading: 'Approving...',
          success: 'Approved successfully',
          error: 'Failed to approve',
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      toast.promise(
        fetch(`${API_URL}/admins/students/reject`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            internshipId: id,
           }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setStudents((prev) =>
                prev.map((student) =>
                  student.internship.id === id
                    ? { ...student, internship: { ...student.internship, status: 'REJECTED' } }
                    : student
                )
              );
            }
          }),
        {
          loading: 'Rejecting...',
          success: 'Rejected successfully',
          error: 'Failed to reject',
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout
      defaultOpenKey="/admin"
      selectedKey="/admin/internship-submission"
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
                Student Internship Submission
              </h1>
            </header>
            <Table
              loading={isLoading}
              columns={columns}
              scroll={{ x: 770 }}
              dataSource={students.map((student) => ({
                key: student.studentId,
                ...student,
              }))}
              onChange={onChange}
              bordered
              title={() => <p>Total {students.length} submissions received</p>}
            />
            <Modal
              onCancel={() => setIsModalVisible(false)}
              title="Internship Submission Details"
              open={isModalVisible}
              footer={null}
            >
              {selectedStudent && (
                <table className="table-auto w-full mt-4">
                  <tbody className="text-gray-700">
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Start Date
                      </td>
                      <td className="px-4 py-2">
                        {new Date(
                          selectedStudent.internship.startDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        End Date
                      </td>
                      <td className="px-4 py-2">
                        {new Date(
                          selectedStudent.internship.endDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Status
                      </td>
                      <td className="px-4 py-2">
                        {selectedStudent.internship.status}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Allowance
                      </td>
                      <td className="px-4 py-2">
                        RM {selectedStudent.internship.allowance.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Com. Name
                      </td>
                      <td className="px-4 py-2">
                        {selectedStudent.internship.company.companyName}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Com. Email
                      </td>
                      <td className="px-4 py-2">
                        {selectedStudent.internship.company.email}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Com. Supervisor Name
                      </td>
                      <td className="px-4 py-2">
                        {selectedStudent.internship.comSupervisorName}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold bg-gray-100 px-4 py-2">
                        Com. Supervisor Email
                      </td>
                      <td className="px-4 py-2">
                        {selectedStudent.internship.comSupervisorEmail}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </Modal>
          </>
        );
      }}
    />
  );
}
