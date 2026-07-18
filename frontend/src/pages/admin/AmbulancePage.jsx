import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Pasien',key:'patientName'},{label:'Status',key:'status'},{label:'Tujuan',key:'destination'}];
const formFields = [{key:'patientName',label:'Nama Pasien',required:true},{key:'patientPhone',label:'No. HP Pasien'},{key:'pickupAddress',label:'Alamat Jemput'},{key:'destination',label:'Tujuan'}];

export default function AmbulancePage() {
  return <DataTable endpoint="/ambulance" title="Ambulans" columns={columns} formFields={formFields} />;
}
