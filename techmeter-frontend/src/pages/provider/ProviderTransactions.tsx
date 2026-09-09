import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
} from 'lucide-react';

const ProviderTransactions: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageNumber] = useState(1);

  const { data: transData, isLoading } = useQuery({
    queryKey: ['provider-transactions', fromDate, toDate, pageNumber],
    queryFn: () =>
      paymentService.getProviderTransactions({
        from: fromDate || undefined,
        to: toDate || undefined,
        pageNumber,
        pageSize: 10,
      }),
  });

  const transactions = transData?.data?.items || transData?.data || [];
  const totalEarned = transactions.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Earnings & Payouts</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Track your course revenue, platform payouts, and financial transactions.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs w-fit"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Statement
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">${totalEarned.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Processed Payouts
              </p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{transactions.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Payout Gateway
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">Stripe Direct Connect</p>
            </div>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <CreditCard className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">No transactions recorded</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Completed student payouts and earnings will be listed here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Transaction ID</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Course / Reference</th>
                    <th className="py-3.5 px-6">Gross Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {transactions.map((tx: any, idx: number) => (
                    <tr key={tx.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="py-4 px-6 font-mono text-gray-600 dark:text-gray-400">
                        {tx.transactionId || tx.id?.substring(0, 10) || `TX-${1000 + idx}`}
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white font-semibold">
                        {tx.courseTitle || 'Course Purchase'}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                        +${(tx.amount || 0).toFixed(2)} {tx.currency || 'USD'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Settled
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
    </div>
  );
};

export default ProviderTransactions;
