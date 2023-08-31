import Layout from '@/components/layout/Layout';
import { Button, Form, Input, Modal } from 'antd';
import clsx from 'clsx';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface AddStudentValues {
  studentId: string;
  fullName: string;
  email: string;
}

interface AddStudentFormProps {
  open: boolean;
  onAdd: (values: AddStudentValues) => void;
  onCancel: () => void;
}

const AddStudentForm = ({ open, onAdd, onCancel }: AddStudentFormProps) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Add Student"
      open={open}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onAdd(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      okButtonProps={{
        htmlType: 'submit',
      }}
      okText="Add"
      onCancel={onCancel}
    >
      <Form
        className="mt-4"
        form={form}
        layout="vertical"
        name="addStudentForm"
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
          <Input placeholder="e.g. 21WMR02965" />
        </Form.Item>
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[
            {
              required: true,
              message: 'Please enter full name',
            },
          ]}
        >
          <Input placeholder="e.g. Boonsuen Oh" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Student Email"
          rules={[
            {
              required: true,
              message: 'Please enter student email',
            },
          ]}
        >
          <Input placeholder="e.g. email@student.tarc.edu.my" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function ManageStudent() {
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const showAddStudentModal = () => {
    setIsAddStudentModalOpen(true);
  };

  const onAdd = (values: AddStudentValues) => {
    console.log('Received values of form: ', values);
    setIsAddStudentModalOpen(false);
  };

  return (
    <Layout defaultOpenKey="/student" selectedKey="/student/manage">
      <header
        className={clsx(
          'flex justify-between items-center',
          'pb-4',
          'border-b border-gray-200'
        )}
      >
        <h1 className="text-xl font-semibold text-gray-800">Manage Student</h1>
      </header>
      <div className="flex justify-end">
        <Button
          onClick={showAddStudentModal}
          icon={<PlusOutlined />}
          type="primary"
          size="middle"
          className="mt-5 bg-primary"
        >
          Add Student
        </Button>
        <AddStudentForm
          open={isAddStudentModalOpen}
          onAdd={onAdd}
          onCancel={() => {
            setIsAddStudentModalOpen(false);
          }}
        />
      </div>
    </Layout>
  );
}
