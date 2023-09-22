import Layout from '@/components/layout/Layout';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/constants';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Spin, Table } from 'antd';

interface Announcement{
  title: string;
  content: string;
}

interface DataType {
  key: React.Key
  title: string;
  content: string;
}

interface AddAnnouncementValues {
  title: string;
  content: string;
}

interface AddAnnouncementFormProps {
    open: boolean;
    onAssign: (values: AddAnnouncementValues) => void;
    onCancel: () => void;
}

const AddAnnouncementForm = ({
    open,
    onAssign,
    onCancel,
}: AddAnnouncementFormProps) => {
    const [form] = Form.useForm();
    const [announcements, addAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try{
                const response = await (
                    await fetch(`${API_URL}/supervisors/announcements`, {
                        method: 'GET',
                        credentials: 'include',
                    })
                ).json();

                if(!response.success){
                    return toast.error(response.message || 'Something went wrong'); 
                }

                const announcements = response.data as Announcement[];

                addAnnouncements(announcements);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnouncement();
    }, []);

    return (
        <Modal
            title="Add Announcement"
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
                name="addAnnouncementForm"
                initialValues={{}}
                >
                    <Form.Item
                        name="title"
                        label="Announcement Title"
                        rules={[
                            {
                                required: true,
                                message: 'Please input announcement title.'
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="content"
                        rules={[
                            {
                                required: true,
                                message: 'Please input announcement content.'
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
          title: 'Announcement Title',
          dataIndex: 'title',
        },
        {
          title: 'Announcement Content',
          dataIndex: 'content',
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
    const [addedAnnouncements, setAddedAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const showAddAnnouncementModal = () => {
      setIsAddAnnouncementModalOpen(true);
    };

    const onAdd = async (values: AddAnnouncementValues) => {
        try{
            console.log(values);
            toast.promise(
                fetch(`${API_URL}/supervisors/announcement`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title: values.title,
                      content: values.content
                    }),
                  })
                    .then((res) => res.json())
                    .then((res) => {
                      if (res.success) {
                        console.log(res);
                        setAddedAnnouncements((prev) => [
                          ...prev,
                          {
                            title: res.data.title,
                            content: res.data.content
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
          setIsAddAnnouncementModalOpen(false);
        }
    };

    useEffect(() => {
        const fetchAddedAnnouncements = async () => {
            try {
                const response = await (
                    await fetch(`${API_URL}/supervisors/announcements`, {
                        method: 'GET',
                        credentials: 'include',
                    })
                ).json();

                if(!response.success){
                    return toast.error(response.message || 'Something went wrong');
                }

                const announcements = response.data as Announcement[];
                setAddedAnnouncements(announcements);
            } catch (error) {
                console.log(error);
            }finally{
                setIsLoading(false);
            }
        };

        fetchAddedAnnouncements();
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
              onAssign={onAdd}
              onCancel={() => {
                setIsAddAnnouncementModalOpen(false);
              }}
            />
          </div>
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={addedAnnouncements.map((announcement, i) => ({
              key: `${announcement}-${i}`,
              title: announcement.title,
              content: announcement.content,
            }))}
            onChange={onChange}
            bordered
            title={() => (
              <p>
                You have posted {addedAnnouncements.length} announcements
              </p>
            )}
          />
        </>
      );
};

export default function AnnouncementPage() {
    return (
      <Layout
        defaultOpenKey="/supervisor"
        selectedKey="/supervisor/announcement"
        renderContent={(u) => {
          return <PageContent />;
        }}
      />
    );
  }

  
// @supervisors.route("/announcements", methods=["POST"])
// @supervisor_token_required
// def addAnnouncement():
//     data = request.json

//     title = data.get("title")
//     content = data.get("content")

//     announcements = Announcement.prisma().create(
//         data={
//             "title": title,
//             "content": content,
//         }
//     )

//     return jsonify(
//         {
//             "message": "Announcement added successfully",
//             "data":
//                     {
//                         "AnnouncementId": announcements.announcementId,
//                         "title": announcements.title,
//                         "content": announcements.content,
//                     },
//             "success": True,
//         }
//     )

// @supervisors.route("/announcements", methods=["GET"])
// @supervisor_token_required
// def getAnnouncements():
//     try:
//         announcements = Announcement.prisma().find_many(
//             where={"title": announcements.title}, include={"title": True}
//         )

//         return jsonify(
//             {
//                 "message": "Announcement fetched successfully",
//                 "data": [
//                     {
//                         "AnnouncementId": announcement.announcementId,
//                         "title": announcement.title,
//                         "content": announcement.content,
//                     }
//                     for announcement in announcements
//                 ],
//                 "success": True,
//             }
//         )
//     except Exception as e:
//         return jsonify({"message": str(e), "success": False}), 500