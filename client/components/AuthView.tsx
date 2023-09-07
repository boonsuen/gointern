import { API_URL } from '@/lib/constants';
import { Button, Form, Input, Tabs, TabsProps, Typography } from 'antd';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { AdminUser, StudentUser } from './layout/Layout';

const { Title } = Typography;

const StudentAuthView = ({
  setUser,
}: {
  setUser: React.Dispatch<React.SetStateAction<StudentUser | AdminUser | null>>;
}) => {
  const [loginForm] = Form.useForm();
  const [signUpForm] = Form.useForm();

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
      setUser(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      loginForm.resetFields();
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
      signUpForm.resetFields();
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Login',
      children: (
        <div className="max-w-[400px] pt-4 w-full mx-auto">
          <Form
            form={loginForm}
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
            form={signUpForm}
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
    <>
      <header className={clsx('flex justify-between items-center', 'pb-4')}>
        <h1 className="text-xl font-semibold text-gray-800">
          Student Login / Signup
        </h1>
      </header>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </>
  );
};

const AdminAuthView = ({
  setUser,
}: {
  setUser: React.Dispatch<React.SetStateAction<StudentUser | AdminUser | null>>;
}) => {
  const [loginForm] = Form.useForm();

  interface LoginValues {
    email: string;
    password: string;
  }

  const onLoginFormFinish = async (values: LoginValues) => {
    try {
      const response = await (
        await fetch(`${API_URL}/admins/login`, {
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
      setUser(response.data);
    } catch (error) {
      console.log(error);
    } finally {
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
        <h1 className="text-xl font-semibold text-gray-800">Admin Login</h1>
      </header>
      <div className="max-w-[400px] pt-8 w-full mx-auto">
        <Form
          form={loginForm}
          onFinish={onLoginFormFinish}
          layout="vertical"
          name="loginForm"
          initialValues={{}}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: 'Please enter email',
              },
            ]}
          >
            <Input placeholder="e.g. email@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please enter password',
              },
            ]}
          >
            <Input type="password" />
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
    </>
  );
};

export const AuthView = ({
  setUser,
  defaultOpenKey,
}: {
  setUser: React.Dispatch<React.SetStateAction<StudentUser | AdminUser | null>>;
  defaultOpenKey: '/student' | '/admin' | '/supervisor' | '/company';
}) => {
  if (defaultOpenKey === '/student') {
    return <StudentAuthView setUser={setUser} />;
  } else if (defaultOpenKey === '/admin') {
    return <AdminAuthView setUser={setUser} />;
  }
};
