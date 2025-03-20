import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';

interface ReviewFormProps {
    transactionId: string;
    onReviewCreated: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ transactionId, onReviewCreated }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const { token } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reviewService.createReview(transactionId, rating, comment, token as string);
            onReviewCreated();
            setRating(5);
            setComment('');
        } catch (error) {
            console.error('Error creating review:', error);
        }
    };

    const handleStarClick = (index: number) => {
        setRating(index + 1); // Set rating based on clicked star
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill={i < rating ? 'gold' : 'gray'}
                    viewBox="0 0 24 24"
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => handleStarClick(i)}
                >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
            );
        }
        return stars;
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Leave a Review</h2>
            
            <div className="mb-4">
                <label htmlFor="rating" className="block text-gray-600 font-medium mb-2">Rating:</label>
                <div className="flex items-center">{renderStars()}</div>
            </div>

            <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-600 font-medium mb-2">Comment:</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Share your experience..."
                />
            </div>

            <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
                Submit Review
            </button>
        </form>
    );
};

export default ReviewForm;
