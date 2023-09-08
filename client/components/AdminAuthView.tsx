import { Button, Form, Input } from 'antd';
import {
  AdminUser,
  CompanyUser,
  StudentUser,
  SupervisorUser,
} from './layout/Layout';
import { API_URL } from '@/lib/constants';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const AdminAuthView = ({
  setUser,
}: {
  setUser: React.Dispatch<
    React.SetStateAction<
      StudentUser | SupervisorUser | CompanyUser | AdminUser | null
    >
  >;
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
