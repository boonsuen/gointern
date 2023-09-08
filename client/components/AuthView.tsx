import {
  AdminUser,
  CompanyUser,
  StudentUser,
  SupervisorUser,
} from './layout/Layout';
import { StudentAuthView } from './StudentAuthView';
import { AdminAuthView } from './AdminAuthView';
import { CompanyAuthView } from './CompanyAuthView';
import { SupervisorAuthView } from './SupervisorAuthView';

export const AuthView = ({
  setUser,
  defaultOpenKey,
}: {
  setUser: React.Dispatch<
    React.SetStateAction<
      StudentUser | SupervisorUser | CompanyUser | AdminUser | null
    >
  >;
  defaultOpenKey: '/student' | '/admin' | '/supervisor' | '/company';
}) => {
  if (defaultOpenKey === '/student') {
    return <StudentAuthView setUser={setUser} />;
  } else if (defaultOpenKey === '/supervisor') {
    return <SupervisorAuthView setUser={setUser} />;
  } else if (defaultOpenKey === '/company') {
    return <CompanyAuthView setUser={setUser} />;
  } else if (defaultOpenKey === '/admin') {
    return <AdminAuthView setUser={setUser} />;
  }
};
