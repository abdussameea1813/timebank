import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import serviceService from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

const CreateService = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([{ day: '', startTime: '', endTime: '' }]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Tech', 'Health', 'Nature', 'Education', 'Entertainment'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newService = { title, description, category, estimatedTime, location, availability };
      await serviceService.createService(newService, token as string);
      setMessage('Service created successfully!');
      navigate('/');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleAddAvailability = () => {
    setAvailability([...availability, { day: '', startTime: '', endTime: '' }]);
  };

  const handleRemoveAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-600">Create a New Service</CardTitle>
        </CardHeader>
        <CardContent>
          {message && <p className="text-center text-green-600 font-semibold mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium">Category</label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block font-medium">Estimated Time (minutes)</label>
              <Input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-medium">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>

            {/* Availability */}
            <div className="mt-4">
              <label className="block font-medium">Availability</label>
              {availability.map((slot, index) => (
                <div key={index} className="flex space-x-2 items-center mb-2">
                  <Select onValueChange={(value) => handleAvailabilityChange(index, 'day', value)} value={slot.day}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAvailability(index)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}

              <Button type="button" onClick={handleAddAvailability} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Availability
              </Button>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Create Service'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateService;
