import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { label: 'Kode', key: 'code' },
  { label: 'Nama Aset', key: 'name' },
  { label: 'Kategori', key: 'category' },
  { label: 'Kondisi', key: 'condition', statusKey: 'condition' },
  { label: 'Nilai', key: 'value', render: (i) => i.value ? 'Rp ' + Number(i.value).toLocaleString('id-ID') : '-' },
  { label: 'Lokasi', key: 'location' },
];

export default function AssetsPage() {
  return <DataTable endpoint="/assets" title="Aset & Inventaris" columns={columns}
    formFields={[
      { key: 'name', label: 'Nama Aset', required: true },
      { key: 'code', label: 'Kode Aset', required: true },
      { key: 'category', label: 'Kategori' },
      { key: 'condition', label: 'Kondisi', type: 'select', options: ['GOOD', 'NEEDS_REPAIR', 'DAMAGED', 'DISPOSED'] },
      { key: 'value', label: 'Nilai (Rp)', type: 'number' },
      { key: 'location', label: 'Lokasi' },
    ]}
  />;
}
