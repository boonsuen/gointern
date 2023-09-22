import Layout from '@/components/layout/Layout';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space, Table } from 'antd';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedAt: string;
}

interface DataType {
  key: React.Key;
  id: string;
  title: string;
  content: string;
  postedAt: string;
}

interface AddAnnouncementValues {
  title: string;
  content: string;
}

interface AddAnnouncementFormProps {
  open: boolean;
  onAdd: (values: AddAnnouncementValues) => void;
  onCancel: () => void;
}

const AddAnnouncementForm = ({
  open,
  onAdd,
  onCancel,
}: AddAnnouncementFormProps) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Add Announcement"
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
        name="addAnnouncementForm"
        initialValues={{}}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: 'Please enter title',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="content"
          label="Content"
          rules={[
            {
              required: true,
              message: 'Please enter content',
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface EditAnnouncementValues {
  title: string;
  content: string;
}

interface EditAnnouncementFormProps {
  announcement: Announcement;
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const EditAnnouncementForm = ({
  announcement,
  setAnnouncements,
}: EditAnnouncementFormProps) => {
  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  const onEdit = async (values: EditAnnouncementValues) => {
    try {
      toast.promise(
        fetch(`${API_URL}/admins/announcements`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: announcement.id,
            title: values.title,
            content: values.content,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setAnnouncements((prev) =>
                prev.map((a) =>
                  a.id === announcement.id
                    ? {
                        ...a,
                        title: values.title,
                        content: values.content,
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
        title="Edit Announcement"
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
          name="editAnnouncementForm"
          initialValues={{
            title: announcement.title,
            content: announcement.content,
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: 'Please enter title',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[
              {
                required: true,
                message: 'Please enter content',
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const PageContent = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: 'Title',
      dataIndex: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
    },
    {
      title: 'Posted At',
      dataIndex: 'postedAt',
      render: (postedAt) => new Date(postedAt).toLocaleString(),
      width: 200,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <EditAnnouncementForm
            announcement={record}
            setAnnouncements={setAnnouncements}
          />
          <button
            onClick={() => handleDelete(record.id)}
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

  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] =
    useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showAddAnnouncementModal = () => {
    setIsAddAnnouncementModalOpen(true);
  };

  const onAdd = async (values: AddAnnouncementValues) => {
    try {
      toast.promise(
        fetch(`${API_URL}/admins/announcements`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: values.title,
            content: values.content,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              console.log(res);
              setAnnouncements((prev) => [
                {
                  id: res.data.id,
                  title: res.data.title,
                  content: res.data.content,
                  postedAt: res.data.postedAt,
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
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsAddAnnouncementModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchAddedAnnouncements = async () => {
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

    fetchAddedAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      toast.promise(
        fetch(`${API_URL}/admins/announcements`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setAnnouncements((prev) =>
                prev.filter((announcement) => announcement.id !== id)
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
        <h1 className="text-xl font-semibold text-gray-800">Announcement</h1>
      </header>
      <div className="flex justify-end">
        <Button
          onClick={showAddAnnouncementModal}
          icon={<PlusOutlined />}
          type="primary"
          size="middle"
          className="my-5 bg-primary"
        >
          Add Announcement
        </Button>
        <AddAnnouncementForm
          open={isAddAnnouncementModalOpen}
          onAdd={onAdd}
          onCancel={() => {
            setIsAddAnnouncementModalOpen(false);
          }}
        />
      </div>
      <Table
        loading={isLoading}
        scroll={{ x: 850 }}
        columns={columns}
        dataSource={announcements.map((announcement) => ({
          key: announcement.id,
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          postedAt: announcement.postedAt,
        }))}
        onChange={onChange}
        bordered
        title={() => (
          <p>You have posted {announcements.length} announcements</p>
        )}
      />
    </>
  );
};

export default function AnnouncementPage() {
  return (
    <Layout
      defaultOpenKey="/admin"
      selectedKey="/admin/manage-announcement"
      renderContent={(u) => {
        return <PageContent />;
      }}
    />
  );
}
