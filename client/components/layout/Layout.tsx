import React, { useEffect, useState } from 'react';
import { LogoSvg } from '../svg/Logo.svg';
import { useRouter } from 'next/router';
import { Menu, MenuProps, Layout, theme, Spin } from 'antd';
import {
  SettingOutlined,
  NotificationOutlined,
  HomeOutlined,
  TeamOutlined,
  FlagOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { API_URL } from '@/lib/constants';
import { AuthView } from '../AuthView';

const { Content, Footer, Sider } = Layout;

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <Spin />
    </div>
  );
};

export type StudentUser = {
  studentId: string;
  fullName: string;
  email: string;
  icNumber: string;
  supervisor: {
    fullName: string;
    email: string;
  } | null;
  internship: {
    id: string;
    startDate: string;
    endDate: string;
    allowance: number;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    company: {
      companyName: string;
      email: string;
    };
    comSupervisorName: string;
    comSupervisorEmail: string;
    createdAt: string;
  } | null;
};

export type SupervisorUser = {
  email: string;
  fullName: string;
  isApproved: boolean;
};

export type CompanyUser = {
  email: string;
  companyName: string;
  isApproved: boolean;
};

export type AdminUser = {
  email: string;
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
    getItem('Internship Submission', '/admin/internship-submission'),
    getItem('Supervisor List', '/admin/supervisor-list'),
    getItem('Company List', '/admin/company-list'),
  ]),
  getItem('Announcement', '/announcement', <NotificationOutlined />),
  getItem('Job Board', '/jobboard', <FileTextOutlined />),
];

type LayoutProps = {
  defaultOpenKey:
    | '/'
    | '/student'
    | '/supervisor'
    | '/company'
    | '/admin'
    | '/announcement'
    | '/jobboard';
  selectedKey: string;
  renderContent?: (
    user: StudentUser | SupervisorUser | CompanyUser | AdminUser
  ) => React.ReactNode;
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
  const [user, setUser] = useState<
    StudentUser | SupervisorUser | CompanyUser | AdminUser | null
  >(null);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    router.push(key);
  };

  useEffect(() => {
    let entity: 'students' | 'admins' | 'supervisors' | 'companies';

    if (defaultOpenKey === '/student') {
      entity = 'students';
    } else if (defaultOpenKey === '/admin') {
      entity = 'admins';
    } else if (defaultOpenKey === '/supervisor') {
      entity = 'supervisors';
    } else if (defaultOpenKey === '/company') {
      entity = 'companies';
    } else {
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/${entity}/me`, {
            method: 'GET',
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
    <Layout hasSider className="!flex-row" style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="md"
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
        className="pb-6"
      >
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
      <Layout className="site-layout ml-[80px] md:ml-[250px]">
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
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
              <AuthView
                setUser={setUser}
                defaultOpenKey={
                  defaultOpenKey as
                    | '/student'
                    | '/admin'
                    | '/supervisor'
                    | '/company'
                }
              />
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>© 2023 GoIntern</Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
