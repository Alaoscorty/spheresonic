import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '@/app/layout';
import HomePage from '@/app/page';
import AllTracksPage from '@/app/tracks/page';
import AllCreatorsPage from '@/app/creators/page';
import CreatorProfilePage from '@/app/creators/[creatorsId]/page';
import SignupPage from '@/app/auth/page';
import LoginPage from '@/app/auth/login/page';
import DashboardPage from '@/app/dashboard/page';
import DashboardTracksPage from '@/app/dashboard/tracks/page';
import UploadTrackPage from '@/app/dashboard/tracks/upload/page';
import SettingsPage from '@/app/dashboard/settings/page';
import SalesPage from '@/app/dashboard/sales/page';
import AdminPage from '@/app/admin/page';
import AdminUsersPage from '@/app/admin/users/page';
import AdminTracksPage from '@/app/admin/tracks/page';
import AdminTransactionsPage from '@/app/admin/transactions/page';

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracks" element={<AllTracksPage />} />
          <Route path="/creators" element={<AllCreatorsPage />} />
          <Route path="/creators/:creatorId" element={<CreatorProfilePage />} />
          <Route path="/auth" element={<Navigate replace to="/auth/signup" />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/tracks" element={<DashboardTracksPage />} />
          <Route path="/dashboard/tracks/upload" element={<UploadTrackPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/sales" element={<SalesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/tracks" element={<AdminTracksPage />} />
          <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
