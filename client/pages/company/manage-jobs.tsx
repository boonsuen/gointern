import Layout from '@/components/layout/Layout';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Spin, Table } from 'antd';

interface Job{
    title: string;
    location: string;
    salary: string;
    description: string;
}

interface DataType {
    key: React.Key
    title: string;
    location: string;
    salary: string;
    desc: string;
  }

interface AddJobValues {
    title: string;
    location: string;
    salary: string;
    description: string;
}

interface AddJobFormProps {
    open: boolean;
    onAssign: (values: AddJobValues) => void;
    onCancel: () => void;
}

const AddJobForm = ({
    open,
    onAssign,
    onCancel,
}: AddJobFormProps) => {
    const [form] = Form.useForm();
    const [jobs, addJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try{
                const response = await (
                    await fetch(`${API_URL}/companies/jobs`, {
                        method: 'GET',
                        credentials: 'include',
                    })
                ).json();

                if(!response.success){
                    return toast.error(response.message || 'Something went wrong'); 
                }

                const jobs = response.data as Job[];

                addJobs(jobs);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    return (
        <Modal
            title="Add Job"
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
            okText="Submit"
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
                name="addJobForm"
                initialValues={{}}
                >
                    <Form.Item
                        name="jobTitle"
                        label="Job Title"
                        rules={[
                            {
                                required: true,
                                message: 'Please input job title.'
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label="Location"
                        rules={[
                            {
                                required: true,
                                message: 'Please input job location.'
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="salary"
                        label="Salary"
                        rules={[
                            {
                                required: true,
                                message: 'Please input job salary.'
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            {
                                required: true,
                                message: 'Please input job description.'
                            },
                        ]}
                    >
                        <Input.TextArea/>
                    </Form.Item>
                </Form>
            )
            }
        </Modal>
    );
};

const PageContent = () => {
    const columns: ColumnsType<DataType> = [
        {
            title: 'Job Title',
            dataIndex: 'title',
        },
        {
            title: 'Location',
            dataIndex: 'location',
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
        },
        {
            title: 'Description',
            dataIndex: 'desc',
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

    const [isAddJobModalOpen, setIsAddJobModalOpen] = 
        useState(false);
    const [addedJobs, setAddedJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const showAddJobModal = () => {
        setIsAddJobModalOpen(true);
    };

    const onAdd = async (values: AddJobValues) => {
        try{
            toast.promise(
                fetch(`${API_URL}/companies/jobs`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title: values.title,
                    }),
                  })
                    .then((res) => res.json())
                    .then((res) => {
                      if (res.success) {
                        console.log(res);
                        setAddedJobs((prev) => [
                          ...prev,
                          {
                            title: res.data.title,
                            location: res.data.location,
                            salary: res.data.salary,
                            description: res.data.description
                          },
                        ]);
                      } else {
                        throw new Error(res.message || 'Something went wrong');
                      }
                    }),
                  {
                    loading: 'Adding...',
                    success: 'Added successfully',
                    error: (err) => err.message,
                  }
            )
        } catch (error){
            console.log(error);
        } finally {
            setIsAddJobModalOpen(false);
        }
    };

    useEffect(() => {
        const fetchAddedJobs = async () => {
            try {
                const response = await (
                    await fetch(`${API_URL}/companies/jobs`, {
                        method: 'GET',
                        credentials: 'include',
                    })
                ).json();

                if(!response.success){
                    return toast.error(response.message || 'Something went wrong');
                }

                const jobs = response.data as Job[];
                setAddedJobs(jobs);
            } catch (error) {
                console.log(error);
            }finally{
                setIsLoading(false);
            }
        };

        fetchAddedJobs();
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
            <h1 className="text-xl font-semibold text-gray-800">Manege Jobs</h1>
          </header>
          <div className="flex justify-end">
            <Button
              onClick={showAddJobModal}
              icon={<PlusOutlined />}
              type="primary"
              size="middle"
              className="my-5 bg-primary"
            >
              Add Job
            </Button>
            <AddJobForm
              open={isAddJobModalOpen}
              onAssign={onAdd}
              onCancel={() => {
                setIsAddJobModalOpen(false);
              }}
            />
          </div>
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={addedJobs.map((job, i) => ({
              key: `${job}-${i}`,
              title: job.title,
              location: job.location,
              salary: job.salary,
              desc: job.description,
            }))}
            onChange={onChange}
            bordered
            title={() => (
              <p>
                You have posted {addedJobs.length} jobs
              </p>
            )}
          />
        </>
      );
};

export default function ManageJobsPage() {
    return (
      <Layout
        defaultOpenKey="/company"
        selectedKey="/company/manage-jobs"
        renderContent={(u) => {
          return <PageContent />;
        }}
      />
    );
  }
