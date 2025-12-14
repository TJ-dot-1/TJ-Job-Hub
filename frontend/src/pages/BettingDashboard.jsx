import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const BettingDashboard = () => {
  const [stats, setStats] = useState({
    balance: 0,
    totalBets: 0,
    totalWinnings: 0,
    level: 1
  });
  const [recentBets, setRecentBets] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, historyRes, leaderboardRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/betting/history?limit=5'),
        api.get('/betting/leaderboard?period=daily')
      ]);

      if (balanceRes.data.success) {
        setStats(balanceRes.data.data);
      }

      if (historyRes.data.success) {
        setRecentBets(historyRes.data.data.bets);
      }

      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Betting Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400">Balance</h3>
            <p className="text-3xl font-bold text-green-400">{stats.balance.toFixed(2)} KSH</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400">Total Bets</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.totalBets}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400">Total Winnings</h3>
            <p className="text-3xl font-bold text-yellow-400">{stats.totalWinnings.toFixed(2)} KSH</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400">Level</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.level}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/betting/aviator"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
              >
                🎮 Play Aviator
              </Link>
              <Link
                to="/betting/wallet"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
              >
                💰 Manage Wallet
              </Link>
              <Link
                to="/betting/history"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
              >
                📊 View History
              </Link>
            </div>
          </div>

          {/* Recent Bets */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bets</h2>
            <div className="space-y-3">
              {recentBets.length === 0 ? (
                <p className="text-gray-400">No recent bets</p>
              ) : (
                recentBets.slice(0, 5).map((bet) => (
                  <div key={bet._id} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{bet.amount.toFixed(2)} KSH</div>
                      <div className="text-sm text-gray-400">
                        {new Date(bet.placedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        bet.status === 'cashed_out' ? 'text-green-400' :
                        bet.status === 'crashed' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {bet.status === 'cashed_out' ? `+${bet.payout.toFixed(2)} KSH` :
                         bet.status === 'crashed' ? 'Crashed' : 'Active'}
                      </div>
                        {bet.cashOutMultiplier && (
                          <div className="text-sm text-gray-400">
                            {bet.cashOutMultiplier.toFixed(2)}x
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Today's Top Winners</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Player</th>
                  <th className="text-right py-2">Winnings</th>
                  <th className="text-right py-2">Bets</th>
                  <th className="text-right py-2">Biggest Win</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((player, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{player.name}</td>
                    <td className="py-2 text-right text-green-400">
                      {player.totalWinnings.toFixed(2)} KSH
                    </td>
                    <td className="py-2 text-right">{player.totalBets}</td>
                    <td className="py-2 text-right text-yellow-400">
                      {player.biggestWin.toFixed(2)} KSH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingDashboard;