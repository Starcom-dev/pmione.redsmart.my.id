import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Donor',key:'donorName'},{label:'Jumlah',key:'amount',render:(i)=>'Rp '+Number(i.amount).toLocaleString('id-ID')},{label:'Tanggal',key:'date',render:(i)=>new Date(i.date).toLocaleDateString('id-ID')},{label:'Sumber',key:'source'}];
const formFields = [{key:'donorName',label:'Nama Donor'},{key:'amount',label:'Jumlah',type:'number',required:true},{key:'date',label:'Tanggal',type:'date'}];

export default function DonationsPage() {
  return <DataTable endpoint="/donations" title="Donasi" columns={columns} formFields={formFields} />;
}
