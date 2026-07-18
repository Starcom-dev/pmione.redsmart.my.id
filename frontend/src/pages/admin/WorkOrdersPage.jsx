import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Judul',key:'title'},{label:'Kategori',key:'category'},{label:'Priority',key:'priority'},{label:'Status',key:'status'}];
const formFields = [{key:'title',label:'Judul',required:true},{key:'category',label:'Kategori'},{key:'priority',label:'Priority (LOW/MEDIUM/HIGH/CRITICAL)'}];

export default function WorkOrdersPage() {
  return <DataTable endpoint="/work-orders" title="Work Orders" columns={columns} formFields={formFields} />;
}
