import DataTable from '../../components/ui/DataTable';

const columns = [
  { label: 'Nama Lengkap', key: 'fullName' },
  { label: 'NIP', key: 'nip' },
  { label: 'Jabatan', key: 'position' },
  { label: 'Unit', key: 'unit' },
  { label: 'Status', key: 'status' },
];
const formFields = [
  { key: 'fullName', label: 'Nama Lengkap', required: true },
  { key: 'nip', label: 'NIP', required: true },
  { key: 'position', label: 'Jabatan' },
  { key: 'unit', label: 'Unit' },
  { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'CONTRACT', 'VOLUNTEER', 'RETIRED'] },
];

export default function EmployeesPage() {
  return <DataTable endpoint="/employees" title="Kepegawaian (SIMPEG)" columns={columns} formFields={formFields}
    stats={[{ label: '12 pegawai aktif di 6 unit kerja', value: '' }]}
  />;
}
