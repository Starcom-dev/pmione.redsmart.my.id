import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Tanggal',key:'date',render:(i)=>new Date(i.date).toLocaleDateString('id-ID')},{label:'Deskripsi',key:'description'},{label:'Jumlah',key:'amount',render:(i)=>'Rp '+Number(i.amount).toLocaleString('id-ID')},{label:'Tipe',key:'type'}];
const formFields = [{key:'description',label:'Deskripsi',required:true},{key:'amount',label:'Jumlah',type:'number',required:true},{key:'type',label:'Tipe (income/expense)',required:true},{key:'date',label:'Tanggal',type:'date'}];

export default function FinancePage() {
  return <DataTable endpoint="/finance" title="Keuangan" columns={columns} formFields={formFields} />;
}
