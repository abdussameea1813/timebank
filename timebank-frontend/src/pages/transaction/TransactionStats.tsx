import { useState, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';

// Define the type for the stats data
interface Stats {
  totalTransactions: number;
  pendingTransactions: number;
  acceptedTransactions: number;
  completedTransactions: number;
  cancelledTransactions: number;
}

const TransactionStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setError('No token available');
        setLoading(false);
        return;
      }
      try {
        const data = await transactionService.getTransactionStats(token);
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!stats) return <p className="text-center text-gray-500">No statistics available.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[{
          label: 'Total', value: stats.totalTransactions, color: 'bg-blue-500'
        }, {
          label: 'Pending', value: stats.pendingTransactions, color: 'bg-yellow-500'
        }, {
          label: 'Accepted', value: stats.acceptedTransactions, color: 'bg-purple-500'
        }, {
          label: 'Completed', value: stats.completedTransactions, color: 'bg-green-500'
        }, {
          label: 'Cancelled', value: stats.cancelledTransactions, color: 'bg-red-500'
        }].map((item, index) => (
          <div key={index} className={`p-4 ${item.color} text-white text-center rounded-lg shadow-md`}>
            <p className="text-lg font-semibold">{item.value}</p>
            <p className="text-sm uppercase">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionStats;
