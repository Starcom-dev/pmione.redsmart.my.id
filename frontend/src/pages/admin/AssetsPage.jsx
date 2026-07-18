import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Kode',key:'code'},{label:'Nama',key:'name'},{label:'Kategori',key:'category'},{label:'Kondisi',key:'condition'}];
const formFields = [{key:'name',label:'Nama Aset',required:true},{key:'code',label:'Kode',required:true},{key:'category',label:'Kategori'}];

export default function AssetsPage() {
  return <DataTable endpoint="/assets" title="Aset & Armada" columns={columns} formFields={formFields} />;
}
