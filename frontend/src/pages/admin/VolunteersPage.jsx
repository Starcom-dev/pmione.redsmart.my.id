import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Nama',key:'fullName'},{label:'No. HP',key:'phone'},{label:'Keahlian',key:'skills',render:(i)=>i.skills?.join(', ')}];
const formFields = [{key:'fullName',label:'Nama',required:true},{key:'phone',label:'No. HP',required:true},{key:'address',label:'Alamat'}];

export default function VolunteersPage() {
  return <DataTable endpoint="/volunteers" title="Relawan" columns={columns} formFields={formFields} />;
}
