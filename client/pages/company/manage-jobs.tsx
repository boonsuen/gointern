import Layout from '@/components/layout/Layout';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Table, Space } from 'antd';

export interface Job {
    jobId: string;
    title: string;
    location: string;
    salary: string;
    description: string;
    postedAt: string;
    company: string;
    companyEmail: string;
}

interface DataType {
    key: React.Key
    jobId: string;
    title: string;
    location: string;
    salary: string;
    description: string;
    postedAt: string;
    company: string;
    companyEmail: string;
}

interface AddJobValues {
    title: string;
    location: string;
    salary: string;
    description: string;
}

interface AddJobFormProps {
    open: boolean;
    onAdd: (values: AddJobValues) => void;
    onCancel: () => void;
}

const AddJobForm = ({
    open,
    onAdd,
    onCancel,
}: AddJobFormProps) => {
    const [form] = Form.useForm();

    return (
        <Modal
            title="Add Job"
            open={open}
            onOk={() => {
                form
                  .validateFields()
                  .then((values) => {
                    onAdd(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    })
                    .finally(() => {
                        form.resetFields();
                    });
            }}
            okButtonProps={{
                htmlType: 'submit',
                className: 'bg-primary',
            }}
            okText="Submit"
            onCancel={onCancel}
        >
            <Form
                className="mt-4"
                form={form}
                layout="vertical"
                name="addJobForm"
                initialValues={{}}
            >
                <Form.Item
                    name="title"
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
                    <InputNumber className="w-full" max={10000} min={0} />
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
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

interface EditJobValues {
    title: string;
    location: string;
    salary: string;
    description: string;
}

interface EditJobFormProps {
    job: Job;
    setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

const EditJobForm = ({
    job,
    setJobs,
}: EditJobFormProps) => {
    const [form] = Form.useForm();
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

    const onEdit = async (values: EditJobValues) => {
        try {
            toast.promise(
                fetch(`${API_URL}/companies/jobs`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jobId: job.jobId,
                        title: values.title,
                        location: values.location,
                        salary: values.salary,
                        description: values.description,
                    }),
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.success) {
                            setJobs((prev) =>
                                prev.map((a) =>
                                    a.jobId === job.jobId
                                        ? {
                                            ...a,
                                            title: values.title,
                                            location: values.location,
                                            salary: values.salary,
                                            description: values.description,
                                        }
                                        : a
                                )
                            );
                        }
                    }),
                {
                    loading: 'Updating...',
                    success: 'Updated successfully',
                    error: 'Failed to update',
                }
            );
        } catch (error) {
            console.log(error);
        } finally {
            setIsEditModalVisible(false);
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    setIsEditModalVisible(true);
                }}
                className="text-primary whitespace-nowrap hover:text-[#69b1ff] transition-colors"
            >
                Edit
            </button>
            <Modal
                title="Edit Job"
                open={isEditModalVisible}
                onOk={() => {
                    form
                        .validateFields()
                        .then((values) => {
                            onEdit(values);
                        })
                        .catch((info) => {
                            console.log('Validate Failed:', info);
                        });
                }}
                okButtonProps={{
                    htmlType: 'submit',
                    className: 'bg-primary',
                }}
                okText="Update"
                onCancel={() => {
                    setIsEditModalVisible(false);
                }}
            >
                <Form
                    className="mt-4"
                    form={form}
                    layout="vertical"
                    name="editJobForm"
                    initialValues={{
                        title: job.title,
                        location: job.location,
                        salary: job.salary,
                        description: job.description,
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Title"
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
                        <InputNumber className="w-full" max={10000} min={0} />
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
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
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
            dataIndex: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <EditJobForm
                        job={record}
                        setJobs={setJobs}
                    />
                    <button
                        onClick={() => handleDelete(record.jobId)}
                        className="text-primary hover:text-[#69b1ff] transition-colors"
                    >
                        Delete
                    </button>
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

    const [isAddJobModalOpen, setIsAddJobModalOpen] =
        useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const showAddJobModal = () => {
        setIsAddJobModalOpen(true);
    };

    const onAdd = async (values: AddJobValues) => {
        try {
            toast.promise(
                fetch(`${API_URL}/companies/jobs`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: values.title,
                        location: values.location,
                        salary: values.salary,
                        description: values.description
                    }),
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.success) {
                            console.log(res);
                            setJobs((prev) => [
                                {
                                    jobId: res.data.id,
                                    title: res.data.title,
                                    location: res.data.location,
                                    salary: res.data.salary,
                                    description: res.data.description,
                                    postedAt: res.data.postedAt,
                                    company: res.data.company,
                                    companyEmail: res.data.companyEmail,
                                },
                                ...prev,
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
        } catch (error) {
            console.log(error);
        } finally {
            setIsAddJobModalOpen(false);
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await (
                    await fetch(`${API_URL}/companies/jobs`, {
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

    const handleDelete = async (jobId: string) => {
        try {
            toast.promise(
                fetch(`${API_URL}/companies/jobs`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ jobId }),
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.success) {
                            setJobs((prev) =>
                                prev.filter((job) => job.jobId !== jobId)
                            );
                        }
                    }),
                {
                    loading: 'Deleting...',
                    success: 'Deleted successfully',
                    error: 'Failed to delete',
                }
            );
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <header
                className={clsx(
                    'flex justify-between items-center',
                    'pb-4',
                    'border-b border-[#f0f0f0]'
                )}
            >
                <h1 className="text-xl font-semibold text-gray-800">Manage Jobs</h1>
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
                    onAdd={onAdd}
                    onCancel={() => {
                        setIsAddJobModalOpen(false);
                    }}
                />
            </div>
            <Table
                loading={isLoading}
                columns={columns}
                dataSource={jobs.map((job, i) => ({
                    key: `${job}-${i}`,
                    jobId: job.jobId,
                    title: job.title,
                    location: job.location,
                    salary: job.salary,
                    description: job.description,
                    postedAt: job.postedAt,
                    company: job.company,
                    companyEmail: job.companyEmail,
                }))}
                onChange={onChange}
                bordered
                title={() => (
                    <p>
                        You have posted {jobs.length} jobs
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
