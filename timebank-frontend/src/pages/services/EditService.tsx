import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import serviceService from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';

const EditService = () => {
  const { id } = useParams();
  const [service, setService] = useState<any>(null); // Replace 'any' with your Service type
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState([]); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceService.getServiceById(id as string, token as string); 
        setService(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setEstimatedTime(data.estimatedTime);
        setLocation(data.location);
        setAvailability(data.availability);
      } catch (err: any) {
        setMessage(err.response?.data?.message || 'Failed to fetch service');
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedService = {
        title,
        description,
        category,
        estimatedTime,
        location,
        availability,
      };

      await serviceService.updateService(id as string, updatedService, token as string); 
      setMessage('Service updated successfully!');
      navigate(`/services/${id}`); 
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update service');
    }
  };

  if (!service) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Service</h2>
      {message && <p className="mb-4">{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* ... form fields for title, description, category, estimatedTime, location, availability ... */}
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Update Service
        </button>
      </form>
    </div>
  );
};

export default EditService;