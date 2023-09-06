import React from 'react';
import { LogoSvg } from '../svg/Logo.svg';
import { useRouter } from 'next/router';
import { Menu, MenuProps, Layout, theme } from 'antd';
import {
  SettingOutlined,
  NotificationOutlined,
  HomeOutlined,
  TeamOutlined,
  FlagOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Content, Footer, Sider } = Layout;

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

const items: MenuItem[] = [
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
    getItem('Approve Company', '/admin/approve-company'),
  ]),
  getItem('Announcement', '/announcement', <NotificationOutlined />),
  getItem('Jobboard', '/jobboard', <FileTextOutlined />),
];

type LayoutProps = {
  children: React.ReactNode;
  defaultOpenKey: string;
  selectedKey: string;
};

const AppLayout: React.FC<LayoutProps> = ({
  children,
  defaultOpenKey,
  selectedKey,
}) => {
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    router.push(key);
  };

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
          items={items}
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
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>© 2023 GoIntern</Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
