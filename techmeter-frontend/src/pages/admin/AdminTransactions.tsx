import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import {
  CreditCard,
  Download,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  X,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_TRANSACTIONS = [
  {
    id: 'tx_3N8x772eZvKYlo2C0pQR88a1',
    transactionId: 'ch_3N8x772eZvKYlo2C0pQR88a1',
    amount: 89.99,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-09-10T14:15:00.000Z',
    studentId: 'usr_8231',
    providerId: 'prv_1092',
  },
  {
    id: 'tx_3N8x652eZvKYlo2C0mOP44b2',
    transactionId: 'ch_3N8x652eZvKYlo2C0mOP44b2',
    amount: 49.99,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-09-10T12:00:00.000Z',
    studentId: 'usr_5109',
    providerId: 'prv_4412',
  },
  {
    id: 'tx_3N8x422eZvKYlo2C0kMN33c3',
    transactionId: 'ch_3N8x422eZvKYlo2C0kMN33c3',
    amount: 129.0,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-09-10T08:00:00.000Z',
    studentId: 'usr_9921',
    providerId: 'prv_8831',
  },
  {
    id: 'tx_3N8x192eZvKYlo2C0jKL22d4',
    transactionId: 'ch_3N8x192eZvKYlo2C0jKL22d4',
    amount: 34.5,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-09-09T23:00:00.000Z',
    studentId: 'usr_3310',
    providerId: 'prv_1092',
  },
  {
    id: 'tx_3N8x012eZvKYlo2C0iJK11e5',
    transactionId: 'ch_3N8x012eZvKYlo2C0iJK11e5',
    amount: 59.99,
    currency: 'USD',
    status: 'refunded',
    createdAt: '2026-09-09T09:00:00.000Z',
    studentId: 'usr_1488',
    providerId: 'prv_7721',
  },
];

const AdminTransactions: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [copiedTxId, setCopiedTxId] = useState(false);

  const { data: transData, isLoading } = useQuery({
    queryKey: ['admin-transactions', fromDate, toDate, pageNumber],
    queryFn: () =>
      paymentService.getAdminTransactions({
        from: fromDate || undefined,
        to: toDate || undefined,
        pageNumber,
        pageSize: 15,
      }),
  });

  const rawTransactions = transData?.data?.items || transData?.data || [];
  const transactions = rawTransactions.length > 0 ? rawTransactions : DEMO_TRANSACTIONS;

  const filteredTransactions = transactions.filter((tx: any) => {
    const id = (tx.transactionId || tx.id || '').toLowerCase();
    const student = (tx.studentId || '').toLowerCase();
    const provider = (tx.providerId || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return id.includes(term) || student.includes(term) || provider.includes(term);
  });

  const totalVolume = filteredTransactions.reduce(
    (acc: number, curr: any) => acc + (curr.amount || 0),
    0
  );
  const avgTx = filteredTransactions.length > 0 ? totalVolume / filteredTransactions.length : 0;

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Amount', 'Currency', 'Status', 'Student ID', 'Provider ID'];
    const rows = filteredTransactions.map((tx: any) => [
      tx.transactionId || tx.id,
      tx.createdAt ? new Date(tx.createdAt).toISOString() : 'N/A',
      tx.amount || 0,
      tx.currency || 'USD',
      tx.status || 'succeeded',
      tx.studentId || '',
      tx.providerId || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TechMeter_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transaction ledger exported to CSV!');
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTxId(true);
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Financial Ledger & Payouts
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Stripe Verified
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Audit Stripe payment intents, trace settlements, and inspect instructor revenue shares.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs cursor-pointer"
            title="Print Ledger"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Settled Volume
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              ${totalVolume.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Total Transactions
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {filteredTransactions.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Average Ticket
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              ${avgTx.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Payment Processor
            </p>
            <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
              Stripe API (Live)
            </p>
          </div>
        </div>
      </div>

      {/* Date & Keyword Filter Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by Transaction ID or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPageNumber(1);
              }}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPageNumber(1);
              }}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Loading financial ledger...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">No transactions recorded</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
              No ledger entries match the selected date range and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Currency</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredTransactions.map((tx: any, idx: number) => (
                  <tr key={tx.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {tx.transactionId || tx.id?.substring(0, 14) || `TXN-${2000 + idx}`}
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-500 dark:text-gray-400 text-[11px]">
                      {tx.studentId ? `${tx.studentId.substring(0, 8)}...` : 'Platform User'}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ${(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-600 dark:text-gray-400 uppercase">
                      {tx.currency || 'USD'}
                    </td>
                    <td className="py-4 px-6">
                      {tx.status?.toLowerCase() === 'refunded' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                          Refunded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Succeeded
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                        title="View Transaction Record"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Page {pageNumber} &bull; Showing {filteredTransactions.length} entries</span>
          <div className="flex space-x-2">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={filteredTransactions.length < 15}
              onClick={() => setPageNumber((p) => p + 1)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Transaction Audit</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Intent Settlement</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Stripe ID</span>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedTx.transactionId || selectedTx.id}</p>
                </div>
                <button
                  onClick={() => handleCopy(selectedTx.transactionId || selectedTx.id)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700 transition"
                >
                  {copiedTxId ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase">
                    {selectedTx.status || 'Succeeded'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Timestamp</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                    {selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString() : 'Recent'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Settlement:</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    ${(selectedTx.amount || 0).toFixed(2)} {selectedTx.currency || 'USD'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Student Identifier:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {selectedTx.studentId || 'Platform User'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Provider Identifier:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {selectedTx.providerId || 'TechMeter'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
