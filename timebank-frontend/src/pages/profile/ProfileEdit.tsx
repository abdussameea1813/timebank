import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

interface Skill {
    name: string;
}

interface ProfileData {
    name: string;
    bio: string;
    location: string;
    timezone: string;
    skills: Skill[];
    availability: any[]; // Adjust type if you have more details about availability
}

const ProfileEdit = ({ onCancel }: { onCancel: () => void }) => {
    const { user, token } = useAuth();
    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        bio: '',
        location: '',
        timezone: '',
        skills: [],
        availability: [],
    });

    const [newSkill, setNewSkill] = useState('');
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                timezone: user.timezone || '',
                skills: user.skills || [],
                availability: user.availability || [],
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setProfileData({
                ...profileData,
                skills: [...profileData.skills, { name: newSkill }],
            });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (index: number) => {
        setProfileData({
            ...profileData,
            skills: profileData.skills.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setUpdateError(null);
            await authService.updateUserProfile(profileData, token as string);
            onCancel();
        } catch (error: any) {
            setUpdateError(error.response?.data?.message || 'Failed to update profile.');
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
            <form className="w-full max-w-2xl bg-gray-800 shadow-lg rounded-lg p-8 space-y-6" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-semibold text-center">Edit Profile</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={profileData.location}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                    </div>
                </div>

                <label className="block text-gray-400">Bio</label>
                <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                    rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400">Timezone</label>
                        <input
                            type="text"
                            name="timezone"
                            value={profileData.timezone}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400">Skills</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            className="bg-blue-600 px-4 py-2 rounded text-white"
                            onClick={handleAddSkill}
                        >
                            Add
                        </button>
                    </div>
                    <ul className="mt-2">
                        {profileData.skills.map((skill, index) => (
                            <li key={index} className="flex justify-between p-2 bg-gray-700 rounded mt-1">
                                {skill.name}
                                <button
                                    type="button"
                                    className="text-red-400"
                                    onClick={() => handleRemoveSkill(index)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-between">
                    <button type="submit" className="bg-green-600 px-4 py-2 rounded text-white">
                        Update
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-600 px-4 py-2 rounded text-white"
                    >
                        Cancel
                    </button>
                </div>

                {updateError && <p className="text-red-400 text-center">{updateError}</p>}
            </form>
        </div>
    );
};

export default ProfileEdit;
