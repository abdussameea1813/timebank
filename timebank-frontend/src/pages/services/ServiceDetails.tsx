import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import serviceService from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define a type for the service object
interface Service {
  title: string;
  description: string;
  category: string;
  provider: {
    name: string;
  };
  location: string;
  estimatedTime: number;
}

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null); // Type the state as Service | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Error state type as string | null
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      if (id) {
        try {
          const data = await serviceService.getServiceById(id, token);
          setService(data);
        } catch (err: any) { // Use `any` type here for error
          setError(err.response?.data?.message || "Failed to fetch service");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchService();
  }, [id, token]);

  const handleRequestService = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/transactions/create/${id}`);
  };

  if (loading) {
    return <Skeleton className="w-full h-48 rounded-lg" />;
  }

  if (error) {
    return (
      <Alert className="bg-red-100 border-red-400 text-red-700">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!service) {
    return (
      <Alert className="bg-yellow-100 border-yellow-400 text-yellow-700">
        <AlertDescription>Service not found.</AlertDescription>
      </Alert>
    );
  }

  const creditsRequired = Math.ceil(service.estimatedTime / 60);

  return (
    <div className="container mx-auto p-6 flex justify-center">
      <Card className="w-full max-w-lg shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">Description: {service.description}</p>
          <p className="text-gray-700">Category: {service.category}</p>
          <p className="text-gray-700">Provider: {service.provider.name}</p>
          <p className="text-gray-700">Location: {service.location}</p>
          <p className="text-gray-700">Estimated Time: {service.estimatedTime} minutes</p>
          <p className="text-gray-700">Credits Required: {creditsRequired}</p>
          <Button onClick={handleRequestService} className="w-full">
            Request Service
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDetails;
