import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Nama',key:'name'},{label:'Lokasi',key:'location'},{label:'Status',key:'status'},{label:'Kontak',key:'contactPhone'}];
const formFields = [{key:'name',label:'Nama Posko',required:true},{key:'location',label:'Lokasi',required:true},{key:'contactPhone',label:'No. Kontak'},{key:'capacity',label:'Kapasitas',type:'number'}];

export default function EmergencyPage() {
  return <DataTable endpoint="/emergency" title="Posko Darurat" columns={columns} formFields={formFields} />;
}
