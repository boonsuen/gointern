import React from 'react';
import { LogoSvg } from '../svg/Logo.svg';
import { useRouter } from 'next/router';
import { Menu, MenuProps, Layout, theme } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
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
  getItem('Home', '/', <PieChartOutlined />),
  getItem('Option 2', '/2', <DesktopOutlined />),
  getItem('Student', '/student', <UserOutlined />, [
    getItem('Manage Student', '/student/manage'),
    getItem('Submit Internship', '/student/submit-internship'),
    getItem('Progress Report', '/student/progress-report'),
  ]),
  getItem('Supervisor', '/sub2', <TeamOutlined />, [
    getItem('Manage Supervisor', '/6'),
  ]),
  getItem('Files', '9', <FileOutlined />),
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
    <Layout style={{ minHeight: '100vh' }}>
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
              padding: 24,
              minHeight: 360,
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
