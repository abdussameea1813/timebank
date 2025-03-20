import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import transactionService from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';

const TransactionList = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getUserTransactions(token as string);
        setTransactions(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [token]);

  if (loading) return <p className="text-center text-gray-400">Loading transactions...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center text-blue-400">My Transactions</h2>
      {transactions.length === 0 && <p className="text-center text-gray-400">No transactions found.</p>}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border border-gray-700 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Scheduled Start</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase">Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                <td className="px-6 py-4 text-sm">{transaction.service.title}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    transaction.status === 'Completed' ? 'bg-green-600' : 'bg-yellow-500'
                  }`}>{transaction.status}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {transaction.scheduledTime?.startTime
                    ? new Date(transaction.scheduledTime.startTime).toLocaleString()
                    : "N/A"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link to={`/transactions/${transaction._id}`} className="text-blue-400 hover:text-blue-300">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
