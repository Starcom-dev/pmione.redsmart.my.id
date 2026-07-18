import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import LettersPage from './pages/admin/LettersPage';
import MeetingsPage from './pages/admin/MeetingsPage';
import ArchivesPage from './pages/admin/ArchivesPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import VolunteersPage from './pages/admin/VolunteersPage';
import FinancePage from './pages/admin/FinancePage';
import DonationsPage from './pages/admin/DonationsPage';
import EmergencyPage from './pages/admin/EmergencyPage';
import WarehousePage from './pages/admin/WarehousePage';
import AssetsPage from './pages/admin/AssetsPage';
import AmbulancePage from './pages/admin/AmbulancePage';
import WorkOrdersPage from './pages/admin/WorkOrdersPage';
import TrainingsPage from './pages/admin/TrainingsPage';
import BloodDonationsPage from './pages/admin/BloodDonationsPage';
import MouPage from './pages/admin/MouPage';
import UsersPage from './pages/admin/UsersPage';
import DashboardPortal from './pages/dashboard/DashboardPortal';
import CommandCenter from './pages/command/CommandCenter';
import PublicPortal from './pages/public/PublicPortal';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="letters" element={<LettersPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="archives" element={<ArchivesPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="donations" element={<DonationsPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="ambulance" element={<AmbulancePage />} />
            <Route path="work-orders" element={<WorkOrdersPage />} />
            <Route path="trainings" element={<TrainingsPage />} />
            <Route path="blood-donations" element={<BloodDonationsPage />} />
            <Route path="mou" element={<MouPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPortal /></ProtectedRoute>} />
          <Route path="/command" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
          <Route path="/public" element={<PublicPortal />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
