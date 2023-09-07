import React, { useEffect, useState } from 'react';
import { LogoSvg } from '../svg/Logo.svg';
import { useRouter } from 'next/router';
import {
  Menu,
  MenuProps,
  Layout,
  theme,
  Tabs,
  Form,
  Typography,
  TabsProps,
  Input,
  Button,
  Spin,
} from 'antd';
import {
  SettingOutlined,
  NotificationOutlined,
  HomeOutlined,
  TeamOutlined,
  FlagOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';
import { API_URL } from '@/lib/constants';
import toast from 'react-hot-toast';

const { Content, Footer, Sider } = Layout;
const { Title } = Typography;

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <Spin />
    </div>
  );
};

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

type StudentUser = {
  studentId: string;
  fullName: string;
  email: string;
  icNumber: string;
};

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const menuItems: MenuItem[] = [
  getItem('Home', '/', <HomeOutlined />),
  getItem('Student', '/student', <UserOutlined />, [
    getItem('Login / Signup', '/student/auth'),
    getItem('Manage Student', '/student/manage'),
    getItem('Submit Internship', '/student/submit-internship'),
    getItem('Progress Report', '/student/progress-report'),
  ]),
  getItem('Supervisor', '/supervisor', <TeamOutlined />, [
    getItem('Login / Signup', '/supervisor/auth'),
    getItem('My Students', '/supervisor/my-students'),
    getItem('Progress Report', '/supervisor/progress-report'),
  ]),
  getItem('Company', '/company', <FlagOutlined />, [
    getItem('Login / Signup', '/company/auth'),
    getItem('Manage Jobs', '/company/manage-jobs'),
  ]),
  getItem('Admin', '/admin', <SettingOutlined />, [
    getItem('Login', '/admin/auth'),
    getItem('Manage Announcement', '/admin/manage-announcement'),
    getItem('Approve Internship', '/admin/approve-internship'),
    getItem('Approve Supervisor', '/admin/approve-supervisor'),
    getItem('Approve Company', '/admin/approve-company'),
  ]),
  getItem('Announcement', '/announcement', <NotificationOutlined />),
  getItem('Jobboard', '/jobboard', <FileTextOutlined />),
];

type LayoutProps = {
  defaultOpenKey: '/' | '/student' | '/supervisor' | '/company' | '/admin';
  selectedKey: string;
  renderContent?: (user: StudentUser) => React.ReactNode;
  children?: React.ReactNode;
};

const AppLayout: React.FC<LayoutProps> = ({
  defaultOpenKey,
  selectedKey,
  renderContent,
  children,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<StudentUser | null>(null);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    router.push(key);
  };

  const [loginForm] = Form.useForm();
  const [signUpForm] = Form.useForm();

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/students/me`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
        ).json();

        setIsLoading(false);
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    checkAuth();
  }, []);

  return (
    <Layout className="!flex-row" style={{ minHeight: '100vh' }}>
      <Sider breakpoint="md" width={250}>
        <div className="px-5 my-4 flex justify-center">
          <LogoSvg theme="dark" />
        </div>
        <Menu
          defaultOpenKeys={[defaultOpenKey]}
          theme="dark"
          className="sidebar-nav"
          selectedKeys={[selectedKey]}
          mode="inline"
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '0' }}>
          <div
            style={{
              padding: '24px 24px 48px',
              height: '100%',
              background: colorBgContainer,
            }}
          >
            {defaultOpenKey !== '/student' &&
            defaultOpenKey !== '/admin' &&
            defaultOpenKey !== '/supervisor' &&
            defaultOpenKey !== '/company' &&
            children ? (
              children
            ) : isLoading ? (
              <Loading />
            ) : user ? (
              renderContent && renderContent(user)
            ) : (
              <>
                <header
                  className={clsx('flex justify-between items-center', 'pb-4')}
                >
                  <h1 className="text-xl font-semibold text-gray-800">
                    Student Login / Signup
                  </h1>
                </header>
                <Tabs
                  defaultActiveKey="1"
                  items={tabItems}
                  onChange={onChange}
                />
              </>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>© 2023 GoIntern</Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
