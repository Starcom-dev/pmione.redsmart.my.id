import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { label: 'Nama Posko', key: 'name' },
  { label: 'Lokasi', key: 'location' },
  { label: 'Status', key: 'status', statusKey: 'status' },
  { label: 'Kapasitas', key: 'capacity' },
  { label: 'Kontak', key: 'contactPhone' },
];

const tabs = [
  { key: 'all***', label: 'Semua' },
  { key: 'ACTIVE', label: 'Aktif' },
  { key: 'STANDBY', label: 'Standby' },
  { key: 'CLOSED', label: 'Ditutup' },
];

export default function EmergencyPage() {
  return <DataTable endpoint="/emergency" title="Posko Darurat" columns={columns}
    formFields={[
      { key: 'name', label: 'Nama Posko', required: true },
      { key: 'location', label: 'Lokasi', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['STANDBY', 'ACTIVE', 'CLOSED'] },
      { key: 'capacity', label: 'Kapasitas', type: 'number' },
      { key: 'contactPhone', label: 'Kontak', placeholder: '021-3906666' },
    ]}
    tabs={tabs} showDetail
    stats={[{ label: 'Posko mencakup 6 wilayah DKI Jakarta', value: '' }]}
  />;
}
