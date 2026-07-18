import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { label: 'Judul', key: 'title' },
  { label: 'Kategori', key: 'category' },
  { label: 'Prioritas', key: 'priority', statusKey: 'priority' },
  { label: 'Status', key: 'status', statusKey: 'status' },
  { label: 'Lokasi', key: 'building' },
  { label: 'Lantai/Ruang', key: 'room' },
];

export default function WorkOrdersPage() {
  return <DataTable endpoint="/work-orders" title="Work Orders" columns={columns}
    formFields={[
      { key: 'title', label: 'Judul WO', required: true },
      { key: 'category', label: 'Kategori' },
      { key: 'priority', label: 'Prioritas', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      { key: 'status', label: 'Status', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'] },
      { key: 'building', label: 'Gedung' },
      { key: 'room', label: 'Ruangan' },
      { key: 'notes', label: 'Catatan', type: 'textarea' },
    ]}
    tabs={[{ key: 'all***', label: 'Semua' }, { key: 'OPEN', label: 'Open' }, { key: 'IN_PROGRESS', label: 'In Progress' }, { key: 'COMPLETED', label: 'Completed' }]}
  />;
}
