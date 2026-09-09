import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import {
  CreditCard,
  Download,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const AdminTransactions: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageNumber] = useState(1);

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

  const transactions = transData?.data?.items || transData?.data || [];
  const totalVolume = transactions.reduce(
    (acc: number, curr: any) => acc + (curr.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Financial Ledger
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Global payment transactions, Stripe payment intents, and instructor payouts.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs w-fit"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export Ledger
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Settled Volume
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">${totalVolume.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Transactions
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{transactions.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Processor
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">Stripe Payments API</p>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 dark:text-gray-500">No transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Currency</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {transactions.map((tx: any, idx: number) => (
                  <tr key={tx.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6 font-mono text-gray-600 dark:text-gray-400">
                      {tx.transactionId || tx.id?.substring(0, 12) || `TXN-${2000 + idx}`}
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ${(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-600 dark:text-gray-400">
                      {tx.currency || 'USD'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Succeeded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
