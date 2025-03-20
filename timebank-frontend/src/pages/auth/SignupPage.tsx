import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [skillsInput, setSkillsInput] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const skills = skillsInput.split(',').map((skill) => ({
                name: skill.trim(),
                category: 'General',
                level: 'Beginner',
            }));

            const userData = {
                name,
                email,
                password,
                skills,
            };

            const data = await authService.signup(userData);
            setUser(data);
            setToken(data.token);
            setMessage('Signup successful!');
            navigate('/');
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-md p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>
                {message && <p className="mb-4 text-red-500 text-center">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Skills (comma separated)</Label>
                        <Input
                            type="text"
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">Signup</Button>
                </form>
            </Card>
        </div>
    );
};

export default SignupPage;
