import DataTable from '../../components/ui/DataTable';

const columns = [
  { label: 'Nama', key: 'fullName' },
  { label: 'Email', key: 'email' },
  { label: 'NIP', key: 'nip' },
  { label: 'Jabatan', key: 'position' },
  { label: 'Status', key: 'isActive', render: (i) => i.isActive ? 'Aktif' : 'Nonaktif' },
];
const formFields = [
  { key: 'fullName', label: 'Nama Lengkap', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'password' },
  { key: 'nip', label: 'NIP' },
  { key: 'position', label: 'Jabatan' },
  { key: 'phone', label: 'No. HP' },
];

export default function UsersPage() {
  return <DataTable endpoint="/users" title="Users & Roles" columns={columns} formFields={formFields} />;
}
