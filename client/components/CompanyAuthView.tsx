import { Button, Form, Input, Tabs, TabsProps, Typography } from 'antd';
import {
  AdminUser,
  CompanyUser,
  StudentUser,
  SupervisorUser,
} from './layout/Layout';
import { API_URL } from '@/lib/constants';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const CompanyAuthView = ({
  setUser,
}: {
  setUser: React.Dispatch<
    React.SetStateAction<
      StudentUser | SupervisorUser | CompanyUser | AdminUser | null
    >
  >;
}) => {
  const [loginForm] = Form.useForm();
  const [signUpForm] = Form.useForm();

  interface LoginValues {
    email: string;
    password: string;
  }

  interface SignUpValues {
    email: string;
    companyName: string;
    password: string;
  }

  const onLoginFormFinish = async (values: LoginValues) => {
    try {
      const response = await (
        await fetch(`${API_URL}/companies/login`, {
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

  const onSignUpFormFinish = async (values: SignUpValues) => {
    try {
      const response = await (
        await fetch(`${API_URL}/companies/signup`, {
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
              label="Email"
              rules={[
                {
                  required: true,
                  message: 'Please enter company email',
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
      ),
    },
    {
      key: '2',
      label: 'Signup',
      children: (
        <div className="max-w-[400px] pt-4 w-full mx-auto">
          <Form
            form={signUpForm}
            onFinish={onSignUpFormFinish}
            layout="vertical"
            name="signupForm"
            initialValues={{}}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: 'Please enter company email',
                },
              ]}
            >
              <Input placeholder="e.g. email@example.com" />
            </Form.Item>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter company name',
                },
              ]}
            >
              <Input placeholder="e.g. ACME Company" />
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
          Company Login / Signup
        </h1>
      </header>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </>
  );
};
