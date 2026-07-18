import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Event',key:'title'},{label:'Lokasi',key:'location'},{label:'Target',key:'targetDonors'},{label:'Terkumpul',key:'collectedUnits'}];
const formFields = [{key:'title',label:'Judul Event',required:true},{key:'location',label:'Lokasi'},{key:'targetDonors',label:'Target Donor',type:'number'}];

export default function BloodDonationsPage() {
  return <DataTable endpoint="/blood-donations" title="Donor Darah" columns={columns} formFields={formFields} />;
}
