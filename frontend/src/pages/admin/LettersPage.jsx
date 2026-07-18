import DataTable from '../../components/ui/DataTable';

const columns = [{label:'No. Surat',key:'letterNumber'},{label:'Perihal',key:'subject'},{label:'Jenis',key:'type'},{label:'Status',key:'status'},{label:'Tanggal',key:'createdAt',render:(i)=>new Date(i.createdAt).toLocaleDateString('id-ID')}];
const formFields = [{key:'letterNumber',label:'No. Surat',required:true},{key:'subject',label:'Perihal',required:true},{key:'type',label:'Jenis (INCOMING/OUTGOING/INTERNAL)'},{key:'senderInstitution',label:'Institusi Pengirim'}];

export default function LettersPage() {
  return <DataTable endpoint="/letters" title="Surat" columns={columns} formFields={formFields} />;
}
