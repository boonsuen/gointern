import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/lib/constants';
import { Button, Input, InputRef, Modal, Space, Table, Tag } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Highlighter from 'react-highlight-words';
import Layout from '@/components/layout/Layout';

interface Supervisor {
  email: string;
  fullName: string;
  isApproved: boolean;
  createdAt: string;
}

interface DataType {
  key: React.Key;
  fullName: string;
  email: string;
  isApproved: boolean;
}

type DataIndex = keyof DataType;

const PageContent = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${
            dataIndex === 'fullName' ? 'supervisor name' : dataIndex
          }`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            className="bg-primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.length - b.fullName.length,
      ...getColumnSearchProps('fullName'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.length - b.email.length,
    },
    {
      title: 'Approval Status',
      dataIndex: 'isApproved',
      filters: [
        {
          text: 'Approved',
          value: true,
        },
        {
          text: 'Not Approved',
          value: false,
        },
      ],
      onFilter: (value, record) => record.isApproved === value,
      render: (isApproved: boolean) =>
        isApproved ? (
          <Tag color="green">Approved</Tag>
        ) : (
          <Tag color="red">Not Approved</Tag>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <button
            onClick={() => {
              setSelectedSupervisor(
                supervisors.find(
                  (supervisor) => supervisor.email === record.email
                ) || null
              );
              setIsModalVisible(true);
            }}
            className="text-primary whitespace-nowrap hover:text-[#69b1ff] transition-colors"
          >
            View Details
          </button>
          {!record.isApproved && (
            <button
              onClick={() => handleApprove(record.email)}
              className="text-primary hover:text-[#69b1ff] transition-colors"
            >
              Approve
            </button>
          )}
        </Space>
      ),
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

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/supervisors`, {
            method: 'GET',
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message);
        }

        setSupervisors(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  const handleApprove = async (email: string) => {
    try {
      toast.promise(
        fetch(`${API_URL}/supervisors/approve`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setSupervisors((prev) =>
                prev.map((supervisor) =>
                  supervisor.email === email
                    ? { ...supervisor, isApproved: true }
                    : supervisor
                )
              );
            }
          }),
        {
          loading: 'Approving...',
          success: 'Approved successfully',
          error: 'Failed to approve',
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <header className={clsx('flex justify-between items-center', 'pb-4')}>
        <h1 className="text-xl font-semibold text-gray-800">Supervisor List</h1>
      </header>
      <Table
        loading={isLoading}
        columns={columns}
        scroll={{ x: 770 }}
        dataSource={supervisors.map((supervisor) => ({
          key: `supervisor-${supervisor.email}`,
          fullName: supervisor.fullName,
          email: supervisor.email,
          isApproved: supervisor.isApproved,
        }))}
        onChange={onChange}
      />
      <Modal
        onCancel={() => setIsModalVisible(false)}
        title="Supervisor Details"
        open={isModalVisible}
        footer={null}
      >
        {selectedSupervisor && (
          <table className="table-auto w-full mt-4">
            <tbody className="text-gray-700">
              <tr>
                <td className="font-semibold bg-gray-100 px-4 py-2">
                  Full Name
                </td>
                <td className="px-4 py-2">{selectedSupervisor.fullName}</td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-100 px-4 py-2">Email</td>
                <td className="px-4 py-2">{selectedSupervisor.email}</td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-100 px-4 py-2">
                  Approval Status
                </td>
                <td className="px-4 py-2">
                  {selectedSupervisor.isApproved ? (
                    <Tag color="green">Approved</Tag>
                  ) : (
                    <Tag color="red">Not Approved</Tag>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-100 px-4 py-2">
                  Signup Date
                </td>
                <td className="px-4 py-2">
                  {new Date(selectedSupervisor.createdAt).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Modal>
    </>
  );
};

export default function SupervisorListPage() {
  return (
    <Layout
      defaultOpenKey="/admin"
      selectedKey="/admin/supervisor-list"
      renderContent={(u) => {
        return <PageContent />;
      }}
    />
  );
}
