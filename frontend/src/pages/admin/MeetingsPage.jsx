import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Judul',key:'title'},{label:'Lokasi',key:'location'},{label:'Status',key:'status'},{label:'Waktu',key:'startTime',render:(i)=>new Date(i.startTime).toLocaleString('id-ID')}];
const formFields = [{key:'title',label:'Judul',required:true},{key:'location',label:'Lokasi'},{key:'startTime',label:'Waktu Mulai',type:'datetime-local'},{key:'endTime',label:'Waktu Selesai',type:'datetime-local'}];

export default function MeetingsPage() {
  return <DataTable endpoint="/meetings" title="Rapat" columns={columns} formFields={formFields} />;
}
