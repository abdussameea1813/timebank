import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: any; // Replace 'any' with your Service type
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-700 bg-gray-900 text-white overflow-hidden">
      <CardHeader className="bg-gray-800 py-4 rounded-t-2xl">
        <CardTitle className="text-lg font-bold text-white">{service.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <p className="text-gray-400 text-sm">{service.description.substring(0, 100)}...</p>
        <div className="flex justify-between text-sm text-gray-500">
          <p>📌 {service.category}</p>
          <p>📍 {service.location}</p>
        </div>
        <Link to={`/services/${service._id}`} className="w-full">
          <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl transition-transform transform hover:scale-105">
            View Details ➜
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
