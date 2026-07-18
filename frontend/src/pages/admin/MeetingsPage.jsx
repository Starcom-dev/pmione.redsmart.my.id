import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { label: 'Judul', key: 'title' },
  { label: 'Agenda', key: 'agenda' },
  { label: 'Lokasi', key: 'location' },
  { label: 'Status', key: 'status', statusKey: 'status' },
  { label: 'Waktu', key: 'startTime', render: (i) => new Date(i.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) },
];

export default function MeetingsPage() {
  return <DataTable endpoint="/meetings" title="Rapat" columns={columns}
    formFields={[
      { key: 'title', label: 'Judul Rapat', required: true },
      { key: 'agenda', label: 'Agenda', type: 'textarea' },
      { key: 'location', label: 'Lokasi' },
      { key: 'startTime', label: 'Waktu Mulai', type: 'datetime-local' },
      { key: 'endTime', label: 'Waktu Selesai', type: 'datetime-local' },
    ]}
    tabs={[{ key: 'all***', label: 'Semua' }, { key: 'SCHEDULED', label: 'Terjadwal' }, { key: 'COMPLETED', label: 'Selesai' }]}
  />;
}
