import Layout from '@/components/layout/Layout';
import { API_URL } from '@/lib/constants';
import { Button, Form, Input, Tabs, TabsProps } from 'antd';
import { Typography } from 'antd';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const { Title } = Typography;

interface LoginValues {
  email: string;
  icNumber: string;
}

interface SignUpValues {
  studentId: string;
  fullName: string;
  email: string;
  icNumber: string;
}

export default function StudentAuthPage() {
  const [form] = Form.useForm();

  const onChange = (key: string) => {};

  const onLoginFormFinish = async (values: LoginValues) => {
    try {
      const response = await (
        await fetch(`${API_URL}/students/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
          credentials: 'include',
        })
      ).json();

      if (!response.success) {
        return toast.error(response.message || 'Something went wrong');
      }
      toast.success('Login successfully');
    } catch (error) {
      console.log(error);
    } finally {
      form.resetFields();
    }
  };

  const onSignUpFormFinish = async (values: SignUpValues) => {
    try {
      const response = await (
        await fetch(`${API_URL}/students/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
      ).json();

      if (!response.success) {
        return toast.error(response.message || 'Something went wrong');
      }
      toast.success('Signup successfully');
    } catch (error) {
      console.log(error);
    } finally {
      form.resetFields();
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Login',
      children: (
        <div className="max-w-[400px] pt-4 w-full mx-auto">
          <Form
            form={form}
            onFinish={onLoginFormFinish}
            layout="vertical"
            name="loginForm"
            initialValues={{}}
          >
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
            <Form.Item
              name="icNumber"
              label="IC Number"
              rules={[
                {
                  required: true,
                  message: 'Please enter IC number',
                },
              ]}
            >
              <Input placeholder="e.g. 999999009999" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-1 bg-primary"
              size="middle"
            >
              Login
            </Button>
          </Form>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Signup',
      children: (
        <div className="max-w-[400px] pt-4 w-full mx-auto">
          <Title level={2} className="!text-base !mb-4 pb-2 border-b">
            Academic Details
          </Title>
          <Form
            form={form}
            onFinish={onSignUpFormFinish}
            layout="vertical"
            name="signupForm"
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
            <Title level={2} className="!text-base mt-9 !mb-4 pb-2 border-b">
              Personal Data
            </Title>
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
              name="icNumber"
              label="IC Number"
              rules={[
                {
                  required: true,
                  message: 'Please enter IC number',
                },
              ]}
            >
              <Input placeholder="e.g. 999999009999" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-1 bg-primary"
              size="middle"
            >
              Signup
            </Button>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Layout defaultOpenKey="/student" selectedKey="/student/auth">
      <header
        className={clsx(
          'flex justify-between items-center',
          'pb-4'
          // 'border-b border-gray-200'
        )}
      >
        <h1 className="text-xl font-semibold text-gray-800">
          Student Login / Signup
        </h1>
      </header>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </Layout>
  );
}
