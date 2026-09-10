import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Copy,
  Calendar,
  Layers,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderTransactions: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const pageSize = 10;

  // Fetch Provider Transactions with date filters
  const { data: transData, isLoading } = useQuery({
    queryKey: ['provider-transactions', fromDate, toDate, pageNumber],
    queryFn: () =>
      paymentService.getProviderTransactions({
        from: fromDate || undefined,
        to: toDate || undefined,
        pageNumber,
        pageSize,
      }),
  });

  const rawTransactions = useMemo(() => {
    return transData?.data?.items || transData?.data || [];
  }, [transData]);

  const totalPages = transData?.data?.totalPages || 1;

  // Filter by search & status
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter((tx: any) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (tx.id && tx.id.toLowerCase().includes(q)) ||
        (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
        (tx.courseTitle && tx.courseTitle.toLowerCase().includes(q)) ||
        (tx.studentName && tx.studentName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter !== 'all') {
        const txStatus = (tx.status || 'succeeded').toLowerCase();
        return txStatus === statusFilter.toLowerCase();
      }

      return true;
    });
  }, [rawTransactions, searchTerm, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalGross = rawTransactions.reduce(
      (sum: number, tx: any) => sum + (Number(tx.amount) || 0),
      0
    );
    const settledCount = rawTransactions.filter(
      (tx: any) => (tx.status || 'succeeded').toLowerCase() === 'succeeded' || (tx.status || '').toLowerCase() === 'settled'
    ).length;
    const avgTicket = rawTransactions.length > 0 ? totalGross / rawTransactions.length : 0;

    return {
      totalGross,
      settledCount,
      totalCount: rawTransactions.length,
      avgTicket,
    };
  }, [rawTransactions]);

  const handleCopyTxId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Transaction ID copied to clipboard');
  };

  const handleQuickDatePreset = (preset: '30days' | 'thisMonth' | 'all') => {
    const now = new Date();
    if (preset === '30days') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    } else {
      setFromDate('');
      setToDate('');
    }
    setPageNumber(1);
  };

  const clearAllFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setStatusFilter('all');
    setPageNumber(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Earnings & Payout Ledger
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Track your course revenues, platform payouts, and Stripe settlements.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export Statement
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Gross Revenue
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                ${metrics.totalGross.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Settled Payouts
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {metrics.settledCount} Settled
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Avg. Ticket Size
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                ${metrics.avgTicket.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Payout Gateway
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                Stripe Direct Connect
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Search Controls */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by Transaction ID, Course, or Reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 bg-gray-50/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-300 w-full lg:w-auto">
              <Filter className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="dark:bg-gray-800">All Statuses</option>
                <option value="succeeded" className="dark:bg-gray-800">Settled / Succeeded</option>
                <option value="pending" className="dark:bg-gray-800">Pending</option>
                <option value="refunded" className="dark:bg-gray-800">Refunded</option>
              </select>
            </div>
          </div>

          {/* Date Picker Row */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-gray-500 dark:text-gray-400 font-semibold flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Date Range:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                title="From Date"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                title="To Date"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuickDatePreset('thisMonth')}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium transition"
              >
                This Month
              </button>
              <button
                onClick={() => handleQuickDatePreset('30days')}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium transition"
              >
                Last 30 Days
              </button>
              {(fromDate || toDate || searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="px-2.5 py-1 text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto" />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading payout records...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-16 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <CreditCard className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {searchTerm || fromDate || toDate ? 'No matching payouts found' : 'No payouts recorded yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {searchTerm || fromDate || toDate
                  ? 'Try adjusting your date range or clearing your search filters.'
                  : 'Completed earnings and Stripe payout distributions will appear in this ledger.'}
              </p>
              {(searchTerm || fromDate || toDate) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Transaction ID</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Course Reference</th>
                    <th className="py-3.5 px-6">Gateway</th>
                    <th className="py-3.5 px-6">Gross Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {filteredTransactions.map((tx: any, idx: number) => {
                    const txId = tx.transactionId || tx.id || `TX-${1000 + idx}`;
                    const status = (tx.status || 'succeeded').toLowerCase();
                    return (
                      <tr
                        key={tx.id || idx}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                      >
                        <td className="py-4 px-6 font-mono text-gray-700 dark:text-gray-300">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              #{txId.substring(0, 10)}...
                            </span>
                            <button
                              onClick={() => handleCopyTxId(txId)}
                              className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                              title="Copy Transaction ID"
                              aria-label="Copy Transaction ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Recent'}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white font-semibold">
                          {tx.courseTitle || 'Course Purchase Distribution'}
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                          Stripe
                        </td>
                        <td className="py-4 px-6 font-black text-emerald-600 dark:text-emerald-400">
                          +${(Number(tx.amount) || 0).toFixed(2)} {tx.currency || 'USD'}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'succeeded' || status === 'settled'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : status === 'pending'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                            }`}
                          >
                            {status === 'succeeded' || status === 'settled' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : status === 'pending' ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {status === 'succeeded' ? 'Settled' : tx.status || 'Settled'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Page {pageNumber} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Payout Record
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  #{selectedTx.transactionId || selectedTx.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Timestamp
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedTx.createdAt
                      ? new Date(selectedTx.createdAt).toLocaleString()
                      : 'Recent Settlement'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Settlement Status
                  </span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize">
                    {selectedTx.status || 'Settled'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Gateway
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    Stripe Direct
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Net Amount
                  </span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm">
                    +${(Number(selectedTx.amount) || 0).toFixed(2)} {selectedTx.currency || 'USD'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold uppercase">
                  Course Reference
                </span>
                <p className="font-bold text-gray-900 dark:text-white">
                  {selectedTx.courseTitle || 'Course Purchase Payout'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => handleCopyTxId(selectedTx.transactionId || selectedTx.id)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy Ref ID
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderTransactions;
