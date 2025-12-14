import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions?limit=20')
      ]);

      if (balanceRes.data.success) {
        setBalance(balanceRes.data.data.balance);
      }

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.post('/wallet/deposit', {
        amount,
        paymentMethod: 'demo' // In production, integrate with real payment gateway
      });

      if (response.data.success) {
        setBalance(response.data.data.newBalance);
        setDepositAmount('');
        fetchWalletData(); // Refresh transactions
        alert('Deposit successful!');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert(error.response?.data?.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > balance) {
      alert('Insufficient balance');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.post('/wallet/withdraw', {
        amount,
        paymentMethod: 'demo' // In production, integrate with real payment gateway
      });

      if (response.data.success) {
        setBalance(response.data.data.newBalance);
        setWithdrawAmount('');
        fetchWalletData(); // Refresh transactions
        alert('Withdrawal request submitted!');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'bet': return '🎲';
      case 'payout': return '🏆';
      case 'bonus': return '🎁';
      default: return '💳';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'payout':
      case 'bonus': return 'text-green-400';
      case 'withdrawal':
      case 'bet': return 'text-red-400';
      default: return 'text-gray-400';
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Balance</h2>
          <div className="text-4xl font-bold text-green-400">
            {balance.toFixed(2)} KSH
          </div>
        </div>

        {/* Deposit/Withdraw */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Deposit */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                min="1"
                step="0.01"
              />
              <button
                onClick={handleDeposit}
                disabled={actionLoading || !depositAmount}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                {actionLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Demo mode: Deposits are credited instantly
            </p>
          </div>

          {/* Withdraw */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                min="10"
                step="0.01"
                max={balance}
              />
              <button
                onClick={handleWithdraw}
                disabled={actionLoading || !withdrawAmount || parseFloat(withdrawAmount) > balance}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                {actionLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Minimum withdrawal: 10 KSH
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-400">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="bg-gray-700 rounded p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <div className="font-semibold capitalize">{transaction.type}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' || transaction.type === 'payout' || transaction.type === 'bonus' ? '+' : '-'}
                        {Math.abs(transaction.amount).toFixed(2)} KSH
                      </div>
                      <div className={`text-sm capitalize ${
                        transaction.status === 'completed' ? 'text-green-400' :
                        transaction.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                  {transaction.paymentMethod && (
                    <div className="text-sm text-gray-400 mt-2">
                      Method: {transaction.paymentMethod}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;