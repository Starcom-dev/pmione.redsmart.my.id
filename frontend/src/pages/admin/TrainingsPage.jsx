import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Judul',key:'title'},{label:'Lokasi',key:'location'},{label:'Instruktur',key:'instructor'}];
const formFields = [{key:'title',label:'Judul Diklat',required:true},{key:'location',label:'Lokasi'},{key:'instructor',label:'Instruktur'}];

export default function TrainingsPage() {
  return <DataTable endpoint="/trainings" title="Diklat" columns={columns} formFields={formFields} />;
}
