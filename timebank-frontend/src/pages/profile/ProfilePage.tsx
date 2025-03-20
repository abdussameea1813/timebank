import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { Link } from 'react-router-dom';
import serviceService from '../../services/serviceService';
import ProfileEdit from './ProfileEdit'; // Import ProfileEdit component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define types for profile and skill
interface Skill {
    name: string;
}

interface Profile {
    name: string;
    email: string;
    bio: string;
    credits: number;
    skills: Skill[];
}

const ProfilePage = () => {
    const { token, setUser } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userServices, setUserServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false); // State to toggle editing

    const fetchProfile = async () => {
        if (token) {
            try {
                const data = await authService.getProfile();
                setProfile(data);
                setUser(data);
                const services = await serviceService.getUserServices(token);
                setUserServices(services);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token, setUser]);

    if (loading) {
        return <p className="text-white text-center">Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center">Error: {error}</p>;
    }

    if (!profile) {
        return <p className="text-gray-400 text-center">Please log in to view your profile.</p>;
    }

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        fetchProfile(); // Refresh the profile data.
    };

    return (
        <div className="container mx-auto p-6 text-white">
            {isEditing ? (
                <ProfileEdit onCancel={handleCancelEdit} /> // Render ProfileEdit if editing
            ) : (
                <Card className="bg-gray-900 shadow-xl rounded-lg p-6">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-white">Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div className="space-y-2 text-white">
                                <p><strong>Name:</strong> {profile.name}</p>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Bio:</strong> {profile.bio}</p>
                                <p><strong>Skills:</strong> {profile.skills.map((skill) => skill.name).join(', ')}</p>
                            </div>
                            <div className="text-lg font-semibold text-green-400">Credits: {profile.credits}</div>
                        </div>
                        <div className="flex space-x-4 mb-6">
                            <Button onClick={handleEditClick} className="bg-blue-600 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all">Edit Profile</Button>
                            <Link to="/services/create">
                                <Button className="bg-purple-600 hover:bg-purple-800 text-white font-bold px-6 py-2 rounded-lg transition-all">Create Service</Button>
                            </Link>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">My Services</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userServices.map((service) => (
                                <Card key={service._id} className="bg-gray-800 p-4 rounded-lg hover:shadow-lg transition-all">
                                    <CardContent>
                                        <h4 className="text-lg font-semibold text-white">{service.title}</h4>
                                        <p className="text-gray-400">{service.description.substring(0, 100)}...</p>
                                        <p className="text-gray-500">Category: {service.category}</p>
                                        <Link to={`/services/${service._id}`} className="text-blue-400 hover:text-blue-600 transition-all inline-block mt-2">View Details ➜</Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;
