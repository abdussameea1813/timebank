import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transactionService from '../../services/transactionService';
import serviceService from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';

const CreateTransaction = () => {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchService = async () => {
      if (id) {
        try {
          const data = await serviceService.getServiceById(id, token); // `id` is guaranteed to be a string here
          setService(data);
        } catch (err: any) {
          setMessage(err.response?.data?.message || 'Failed to fetch service');
        }
      }
    };

    fetchService();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transactionData = {
        serviceId: id,
        scheduledStartTime: new Date(scheduledStartTime).toISOString(), // Ensure proper format
        scheduledEndTime: new Date(scheduledEndTime).toISOString(),
        notes,
      };

      console.log("Submitting transaction data:", transactionData);

      await transactionService.createTransaction(transactionData, token as string);
      setMessage('Transaction created successfully!');
      navigate('/transactions');
    } catch (error: any) {
      console.error("Transaction creation error:", error.response?.data || error);
      setMessage(error.response?.data?.message || 'Failed to create transaction');
    }
  };

  if (!service) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Request Service: {service.title}</h2>
      {message && <p className="mb-4 text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Start Time Input */}
        <div>
          <label className="block text-gray-700 font-semibold">Scheduled Start Time</label>
          <input
            type="datetime-local"
            value={scheduledStartTime}
            onChange={(e) => setScheduledStartTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* End Time Input */}
        <div>
          <label className="block text-gray-700 font-semibold">Scheduled End Time</label>
          <input
            type="datetime-local"
            value={scheduledEndTime}
            onChange={(e) => setScheduledEndTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-gray-700 font-semibold">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Request Service
        </button>
      </form>
    </div>
  );
};

export default CreateTransaction;
