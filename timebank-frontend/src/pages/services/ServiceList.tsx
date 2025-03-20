import React, { useState, useEffect } from 'react';
import serviceService from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';
import ServiceCard from '../../components/ServiceCard';

const ServiceList = () => {
  const [services, setServices] = useState<any[]>([]); // Replace 'any' with your Service type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceService.getServices({ ...filters, page }, token);
        setServices(data.services);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, filters, token]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page when filters change
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Services</h2>

      <div className="mb-4">
        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={filters.search}
          onChange={handleFilterChange}
          className="mr-2 p-2 border rounded"
        />
        <select name="category" value={filters.category} onChange={handleFilterChange} className="mr-2 p-2 border rounded">
          <option value="">All Categories</option>
          <option value="Category 1">Category 1</option>
          <option value="Category 2">Category 2</option>
          {/* Add more categories */}
        </select>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        {page > 1 && (
          <button onClick={() => handlePageChange(page - 1)} className="mr-2 p-2 border rounded">
            Previous
          </button>
        )}
        <span>{page} / {totalPages}</span>
        {page < totalPages && (
          <button onClick={() => handlePageChange(page + 1)} className="ml-2 p-2 border rounded">
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceList;