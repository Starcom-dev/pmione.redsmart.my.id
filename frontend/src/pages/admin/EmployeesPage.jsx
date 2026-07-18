import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Nama',key:'fullName'},{label:'NIP',key:'nip'},{label:'Jabatan',key:'position'},{label:'Unit',key:'unit'}];
const formFields = [{key:'fullName',label:'Nama Lengkap',required:true},{key:'nip',label:'NIP',required:true},{key:'position',label:'Jabatan'},{key:'unit',label:'Unit'}];

export default function EmployeesPage() {
  return <DataTable endpoint="/employees" title="Kepegawaian" columns={columns} formFields={formFields} />;
}
