import DataTable from '../../components/ui/DataTable';

const columns = [{label:'Mitra',key:'partnerName'},{label:'Judul',key:'title'},{label:'Status',key:'status'},{label:'Berlaku',key:'validUntil',render:(i)=>new Date(i.validUntil).toLocaleDateString('id-ID')}];
const formFields = [{key:'partnerName',label:'Nama Mitra',required:true},{key:'title',label:'Judul MoU',required:true}];

export default function MouPage() {
  return <DataTable endpoint="/mou" title="MoU" columns={columns} formFields={formFields} />;
}
