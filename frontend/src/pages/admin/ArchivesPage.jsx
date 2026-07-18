import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Judul',key:'title'},{label:'Kategori',key:'category'},{label:'Ukuran',key:'fileSize'}];
const formFields = [{key:'title',label:'Judul',required:true},{key:'category',label:'Kategori (ADMINISTRATION/FINANCE/HR/OPERATIONS/LOGISTICS/TRAINING/LEGAL)'}];

export default function ArchivesPage() {
  return <DataTable endpoint="/archives" title="Arsip" columns={columns} formFields={formFields} />;
}
