import { useState, useEffect } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import api from '../../api/client';

const columns = [
  { label: 'Tanggal', key: 'date', render: (i) => new Date(i.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) },
  { label: 'Deskripsi', key: 'description' },
  { label: 'Kategori', key: 'category' },
  { label: 'Tipe', key: 'type', render: (i) => <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{i.type === 'income' ? 'MASUK' : 'KELUAR'}</span> },
  { label: 'Jumlah', key: 'amount', render: (i) => <span className={`font-semibold ${i.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>Rp {Number(i.amount).toLocaleString('id-ID')}</span> },
  { label: 'Saldo', key: 'balance', render: (i) => <span className="text-gray-500">Rp {Number(i.balance).toLocaleString('id-ID')}</span> },
];

const formFields = [
  { key: 'description', label: 'Deskripsi', required: true },
  { key: 'amount', label: 'Jumlah (Rp)', type: 'number', required: true },
  { key: 'type', label: 'Tipe', type: 'select', required: true, options: ['income', 'expense'] },
  { key: 'category', label: 'Kategori' },
  { key: 'date', label: 'Tanggal', type: 'date' },
];

export default function FinancePage() {
  const [tab, setTab] = useState('transactions');
  const [txStats, setTxStats] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { data: txs } = await api.get('/finance?limit=100');
        if (txs.data) {
          let income = 0, expense = 0;
          txs.data.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount; });
          setTxStats({ income, expense, balance: 2500000000 + income - expense });
        }
      } catch {}
    })();
  }, []);

  const budgetColumns = [
    { label: 'Item', key: 'itemName' },
    { label: 'Kategori', key: 'category' },
    { label: 'Unit', key: 'unit' },
    { label: 'Jumlah', key: 'amount', render: (i) => <span className="font-semibold">Rp {Number(i.amount).toLocaleString('id-ID')}</span> },
    { label: 'Status', key: 'status', statusKey: 'status' },
    { label: 'Tahun', key: 'year' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
        <p className="text-gray-500 text-sm mt-1">Manajemen Transaksi & RKA</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><TrendingUp size={20} className="text-emerald-600" /></div>
          <div><p className="text-xs text-gray-500">Pemasukan</p><p className="text-lg font-bold text-emerald-600">Rp {txStats.income.toLocaleString('id-ID')}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><TrendingDown size={20} className="text-red-500" /></div>
          <div><p className="text-xs text-gray-500">Pengeluaran</p><p className="text-lg font-bold text-red-500">Rp {txStats.expense.toLocaleString('id-ID')}</p></div>
        </div>
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><DollarSign size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Saldo</p><p className="text-lg font-bold text-blue-600">Rp {txStats.balance.toLocaleString('id-ID')}</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('transactions')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'transactions' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Transaksi
        </button>
        <button onClick={() => setTab('budgets')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'budgets' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          RKA
        </button>
      </div>

      {tab === 'transactions' ? (
        <DataTable endpoint="/finance" title="Daftar Transaksi" columns={columns} formFields={formFields} />
      ) : (
        <DataTable endpoint="/finance" title="Rencana Kerja Anggaran (RKA)" columns={budgetColumns}
          formFields={[
            { key: 'itemName', label: 'Item', required: true },
            { key: 'category', label: 'Kategori' },
            { key: 'unit', label: 'Unit' },
            { key: 'amount', label: 'Jumlah (Rp)', type: 'number', required: true },
            { key: 'year', label: 'Tahun', type: 'number' },
          ]}
        />
      )}
    </div>
  );
}
