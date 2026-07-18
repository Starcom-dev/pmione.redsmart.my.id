import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Nama',key:'name'},{label:'Lokasi',key:'location'},{label:'Kapasitas',key:'capacity'},{label:'Status',key:'isActive',render:(i)=>i.isActive?'Aktif':'Nonaktif'}];
const formFields = [{key:'name',label:'Nama Gudang',required:true},{key:'location',label:'Lokasi'},{key:'capacity',label:'Kapasitas',type:'number'}];

export default function WarehousePage() {
  return <DataTable endpoint="/warehouse" title="Gudang" columns={columns} formFields={formFields} />;
}
