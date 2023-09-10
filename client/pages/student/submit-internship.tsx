import Layout, { StudentUser } from '@/components/layout/Layout';
import { API_URL } from '@/lib/constants';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Result,
  Select,
  Typography,
} from 'antd';
import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Company {
  email: string;
  companyName: string;
  isApproved: boolean;
  createdAt: string;
}

export default function SubmitInternshipPage() {
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await (
          await fetch(`${API_URL}/companies`, {
            method: 'GET',
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message || 'Something went wrong');
        }

        const companies = response.data as Company[];

        setCompanies(companies);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const onFinish = (values: any) => {
    console.log(values);

    // Format to ISO-8601 DateTime
    const startDate = values.internshipPeriod[0].toISOString();
    const endDate = values.internshipPeriod[1].toISOString();

    const body = {
      startDate,
      endDate,
      uniSupervisorEmail: values.uniSupervisorEmail,
      companyEmail: values.companyEmail,
      allowance: values.allowance,
      comSupervisorName: values.comSupervisorName,
      comSupervisorEmail: values.comSupervisorEmail,
    };

    const submitInternship = async () => {
      setIsSubmitting(true);

      try {
        const response = await (
          await fetch(`${API_URL}/students/submit-internship`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
          })
        ).json();

        if (!response.success) {
          return toast.error(response.message || 'Something went wrong');
        }

        // Reload
        router.reload();
      } catch (error) {
        console.log(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitInternship();
  };

  return (
    <Layout
      defaultOpenKey="/student"
      selectedKey="/student/submit-internship"
      renderContent={(u) => {
        const user = u as StudentUser;

        if (!user.supervisor) {
          return (
            <div className="flex justify-center items-center h-full">
              <Result
                title="You are not assigned to a supervisor yet"
                extra={<Link href="/student/auth">View Profile</Link>}
              />
            </div>
          );
        }

        return (
          <>
            <header
              className={clsx(
                'flex justify-between items-center',
                'pb-4',
                'border-b border-[#f0f0f0]'
              )}
            >
              <h1 className="text-xl font-semibold text-gray-800">
                Submit Internship
              </h1>
            </header>
            <div className="min-[650px]:max-w-[400px] min-[768px]:max-w-full min-[850px]:max-w-[400px] pt-4 w-full mx-auto">
              {!user.internship ? (
                <Alert
                  className="mt-4 mb-8"
                  message={
                    <span>
                      Submission Status: <b>Not Yet Submitted</b>
                    </span>
                  }
                  type="warning"
                  showIcon
                />
              ) : user.internship.status === 'SUBMITTED' ? (
                <Alert
                  className="mt-4 mb-8"
                  message={
                    <span>
                      Submission Status: <b>Submitted</b>
                    </span>
                  }
                  type="info"
                  showIcon
                />
              ) : user.internship.status === 'APPROVED' ? (
                <Alert
                  className="mt-4 mb-8"
                  message={
                    <span>
                      Submission Status: <b>Approved</b>
                    </span>
                  }
                  type="success"
                  showIcon
                />
              ) : (
                <Alert
                  className="mt-4 mb-8"
                  message={
                    <span>
                      Submission Status: <b>Rejected</b>, please resubmit
                    </span>
                  }
                  type="error"
                  showIcon
                />
              )}
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                name="signupForm"
                initialValues={{
                  uniSupervisorName: user.supervisor.fullName,
                  uniSupervisorEmail: user.supervisor.email,
                  ...(user.internship && {
                    internshipPeriod: [
                      dayjs(user.internship.startDate),
                      dayjs(user.internship.endDate),
                    ],
                    companyEmail: user.internship.company.email,
                    allowance: user.internship.allowance,
                    comSupervisorName: user.internship.comSupervisorName,
                    comSupervisorEmail: user.internship.comSupervisorEmail,
                  }),
                }}
                disabled={
                  isLoading ||
                  isSubmitting ||
                  user.internship?.status === 'SUBMITTED' ||
                  user.internship?.status === 'APPROVED'
                }
              >
                <Form.Item
                  name="internshipPeriod"
                  label="Internship Period"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter start date',
                    },
                  ]}
                >
                  <RangePicker className="w-full" format={'YYYY/MM/DD'} />
                </Form.Item>
                <Title
                  level={2}
                  className="!text-base mt-9 !mb-4 pb-2 border-b"
                >
                  University Supervisor
                </Title>
                <Form.Item
                  name="uniSupervisorName"
                  label="University Supervisor Name"
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  name="uniSupervisorEmail"
                  label="University Supervisor Email"
                >
                  <Input disabled />
                </Form.Item>
                <Title
                  level={2}
                  className="!text-base mt-9 !mb-4 pb-2 border-b"
                >
                  Company Details
                </Title>
                <Form.Item
                  name="companyEmail"
                  label="Company Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter company name',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Select a company"
                    optionFilterProp="children"
                    filterOption={(
                      input,
                      option:
                        | {
                            children: string;
                            value: string;
                          }
                        | undefined
                    ) => {
                      if (!option) {
                        return false;
                      }
                      return (
                        option.value
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }}
                    onChange={(value) => {
                      const company = companies.find(
                        (company) => company.email === value
                      );
                      if (company) {
                        form.setFieldsValue({
                          companyEmail: company.email,
                        });
                      }
                    }}
                  >
                    {companies.map((company) => (
                      <Select.Option value={company.email} key={company.email}>
                        {company.companyName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="allowance"
                  label="Allowance"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter monthly allowance (RM)',
                    },
                  ]}
                >
                  <InputNumber className="w-full" max={10000} min={0} />
                </Form.Item>
                <Form.Item
                  name="comSupervisorName"
                  label="Company Supervisor Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter company supervisor name',
                    },
                  ]}
                >
                  <Input placeholder="e.g. Boonsuen Oh" />
                </Form.Item>
                <Form.Item
                  name="comSupervisorEmail"
                  label="Company Supervisor Email"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter company supervisor email',
                    },
                  ]}
                >
                  <Input type="email" placeholder="e.g. email@example.com" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full mt-1 bg-primary"
                  size="middle"
                  loading={isSubmitting}
                >
                  Submit
                </Button>
              </Form>
            </div>
          </>
        );
      }}
    />
  );
}
