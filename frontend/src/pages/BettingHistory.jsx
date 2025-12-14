import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const BettingHistory = () => {
  const [bets, setBets] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchHistory();
  }, [pagination.page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await api.get(`/betting/history?${params}`);

      if (response.data.success) {
        setBets(response.data.data.bets);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching betting history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };


  const getStatusText = (status) => {
    switch (status) {
      case 'cashed_out':
        return 'Won';
      case 'crashed':
        return 'Lost';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  if (loading && bets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Betting History</h1>
          <Link
            to="/betting"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>


        {/* History Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Round ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Bet Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Multiplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Payout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Profit/Loss
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {bets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                      No betting history found
                    </td>
                  </tr>
                ) : (
                  bets.map((bet) => (
                    <tr key={bet._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(bet.placedAt).toLocaleDateString()} {new Date(bet.placedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {bet.gameRound?.roundId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {bet.amount.toFixed(2)} KSH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {bet.cashOutMultiplier ? `${bet.cashOutMultiplier.toFixed(2)}x` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {bet.payout ? `${bet.payout.toFixed(2)} KSH` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {bet.payout ? (
                          <span className={bet.payout - bet.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {(bet.payout - bet.amount).toFixed(2)} KSH
                          </span>
                        ) : (
                          <span className="text-red-400">
                            -{bet.amount.toFixed(2)} KSH
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bet.status === 'cashed_out' ? 'bg-green-100 text-green-800' :
                          bet.status === 'crashed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusText(bet.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              Previous
            </button>

            <span className="text-gray-400 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-400">Total Bets</h3>
            <p className="text-3xl font-bold text-blue-400">{pagination.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-400">Won</h3>
            <p className="text-3xl font-bold text-green-400">
              {bets.filter(bet => bet.status === 'cashed_out').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-400">Lost</h3>
            <p className="text-3xl font-bold text-red-400">
              {bets.filter(bet => bet.status === 'crashed').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-400">Active</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {bets.filter(bet => bet.status === 'active').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingHistory;