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
  } | null;
  downloadUrl?: string;
}

interface DataType {
  key: React.Key;
  studentId: string;
  fullName: string;
  email: string;
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
  } | null;
  downloadUrl?: string;
}

interface AssignStudentValues {
  studentId: string;
  email: string;
}

interface AssignStudentFormProps {
  open: boolean;
  onAssign: (values: AssignStudentValues) => void;
  onCancel: () => void;
}

const AssignStudentForm = ({
  open,
  onAssign,
  onCancel,
}: AssignStudentFormProps) => {
  const [form] = Form.useForm();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/students`, {
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

  return (
    <Modal
      title="Assign Student"
      open={open}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onAssign(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      okButtonProps={{
        htmlType: 'submit',
        className: 'bg-primary',
        disabled: isLoading,
      }}
      okText="Assign"
      onCancel={onCancel}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full my-8">
          <Spin />
        </div>
      ) : (
        <Form
          className="mt-4"
          form={form}
          layout="vertical"
          name="assignStudentForm"
          initialValues={{}}
        >
          <Form.Item
            name="studentId"
            label="Student ID"
            rules={[
              {
                required: true,
                message: 'Please enter student ID',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select a student"
              optionFilterProp="children"
              filterOption={(
                input,
                option:
                  | {
                      children: string;
                      value: string;
                    }
                  | undefined
              ) => {
                if (!option) {
                  return false;
                }
                return (
                  option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
              onChange={(value) => {
                const student = students.find(
                  (student) => student.studentId === value
                );
                if (student) {
                  form.setFieldsValue({
                    fullName: student.fullName,
                    email: student.email,
                  });
                }
              }}
            >
              {students.map((student) => (
                <Select.Option
                  value={student.studentId}
                  key={student.studentId}
                >
                  {student.studentId} ({student.fullName})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="email" label="Student Email">
            <Input disabled />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

const PageContent = ({ user }: { user: SupervisorUser }) => {
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
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Internship Status',
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
            return <span className="text-red-500 font-semibold">Rejected</span>;
          default:
            return (
              <span className="text-gray-500 font-semibold">Not Submitted</span>
            );
        }
      },
    },
    {
      title: 'Progress Report',
      dataIndex: 'downloadUrl',
      render: (downloadUrl, record) => {
        if (downloadUrl) {
          return (
            <Button
              type="primary"
              size="middle"
              href={downloadUrl}
              className="bg-primary"
            >
              Download
            </Button>
          );
        } else if (record.internship?.status === 'APPROVED') {
          return <p className="text-gray-800">No file uploaded</p>;
        } else {
          return <p className="text-gray-800">-</p>;
        }
      },
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

  const onAssign = async (values: AssignStudentValues) => {
    try {
      toast.promise(
        fetch(`${API_URL}/supervisors/assign-student`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: values.studentId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              console.log(res);
              setAssignedStudents((prev) => [
                ...prev,
                {
                  studentId: res.data.studentId,
                  fullName: res.data.fullName,
                  email: res.data.email,
                  internship: res.data.internship,
                  downloadUrl: res.data.downloadUrl,
                },
              ]);
            } else {
              throw new Error(res.message || 'Something went wrong');
            }
          }),
        {
          loading: 'Assigning...',
          success: 'Assigned successfully',
          error: (err) => err.message,
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsAssignStudentModalOpen(false);
    }
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
    <>
      <header
        className={clsx(
          'flex justify-between items-center',
          'pb-4',
          'border-b border-[#f0f0f0]'
        )}
      >
        <h1 className="text-xl font-semibold text-gray-800">My Students</h1>
      </header>
      <div className="flex justify-end">
        <Button
          onClick={showAssignStudentModal}
          icon={<PlusOutlined />}
          type="primary"
          size="middle"
          className="my-5 bg-primary"
        >
          Assign Student
        </Button>
        <AssignStudentForm
          open={isAssignStudentModalOpen}
          onAssign={onAssign}
          onCancel={() => {
            setIsAssignStudentModalOpen(false);
          }}
        />
      </div>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={assignedStudents.map((student) => ({
          key: student.studentId,
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          internship: student.internship,
          downloadUrl: student.downloadUrl,
        }))}
        onChange={onChange}
        bordered
        title={() => (
          <p>
            You have {assignedStudents.length} students under your supervision
          </p>
        )}
      />
    </>
  );
};

export default function MyStudentsPage() {
  return (
    <Layout
      defaultOpenKey="/supervisor"
      selectedKey="/supervisor/my-students"
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

        return <PageContent user={user} />;
      }}
    />
  );
}
