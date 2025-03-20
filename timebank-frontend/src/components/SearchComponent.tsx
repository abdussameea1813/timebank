import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchComponent = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [skills, setSkills] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (category) params.append('category', category);
        if (skills) params.append('skills', skills);
        navigate(`/services?${params.toString()}`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
            <Input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="col-span-1 sm:col-span-1"
            />
            <Input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-1 sm:col-span-1"
            />
            <Input
                type="text"
                placeholder="Skills (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="col-span-1 sm:col-span-1"
            />
            <Button onClick={handleSearch} className="col-span-1 sm:col-span-1">
                Search
            </Button>
        </div>
    );
};

export default SearchComponent;