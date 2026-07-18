import DataTable from '../../components/ui/DataTable';

const columns = [
  { label: 'Donor', key: 'donorName' },
  { label: 'Jumlah', key: 'amount', render: (i) => <span className="font-medium text-green-600">Rp {Number(i.amount).toLocaleString('id-ID')}</span> },
  { label: 'Sumber', key: 'source' },
  { label: 'Campaign', key: 'campaign' },
  { label: 'Tanggal', key: 'date', render: (i) => new Date(i.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) },
];

export default function DonationsPage() {
  return <DataTable endpoint="/donations" title="Donasi" columns={columns}
    formFields={[
      { key: 'donorName', label: 'Nama Donor' },
      { key: 'amount', label: 'Jumlah (Rp)', type: 'number', required: true },
      { key: 'source', label: 'Sumber', type: 'select', options: ['MONTHLY_FUND', 'CORPORATE', 'INDIVIDUAL', 'EVENT', 'DISASTER'] },
      { key: 'campaign', label: 'Campaign' },
      { key: 'date', label: 'Tanggal', type: 'date' },
    ]}
    tabs={[{ key: 'all***', label: 'Semua' }, { key: 'CORPORATE', label: 'Corporate' }, { key: 'INDIVIDUAL', label: 'Individu' }, { key: 'EVENT', label: 'Event' }, { key: 'DISASTER', label: 'Bencana' }]}
  />;
}
