import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import transactionService from '../../services/transactionService';
import reviewService from '../../services/reviewService';
import ReviewForm from '../../components/ReviewFrom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';

// Define the review type interface
interface Review {
    _id: string;
    reviewer: {
        name: string;
        _id: string;
    };
    comment: string;
    rating: number;
}

const TransactionDetails = () => {
    const { id } = useParams();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);  // Type the reviews state
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTransaction();
            fetchReviews();
        }
    }, [id, token, user]);

    const fetchTransaction = async () => {
        try {
            const data = await transactionService.getTransactionById(id as string, token as string);
            setTransaction(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch transaction');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const data = await reviewService.getReviewsByTransaction(id as string, token as string);
            if (Array.isArray(data)) {
                setReviews(data);
                setHasReviewed(data.some((review) => review.reviewer._id === user?._id));
            }
        } catch (err: any) {
            console.error('Error fetching reviews:', err);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await transactionService.updateTransactionStatus(id as string, newStatus, token as string);
            fetchTransaction();
        } catch (err) {
            console.error('Error updating transaction status:', err);
            setError('Failed to update transaction status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 font-semibold">{error}</p>;
    }

    if (!transaction) {
        return <p className="text-gray-500">Transaction not found.</p>;
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        Transaction Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Service:</strong> {transaction.service.title}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-md text-white ${transaction.status === 'completed' ? 'bg-green-500' : transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'}`}>{transaction.status}</span></p>
                    <p><strong>Scheduled:</strong> {new Date(transaction.scheduledTime.startTime).toLocaleString()} - {new Date(transaction.scheduledTime.endTime).toLocaleString()}</p>
                    <p><strong>Notes:</strong> {transaction.notes || 'No additional notes'}</p>

                    {user && (transaction.provider._id === user._id || transaction.recipient._id === user._id) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {/* Only provider can accept */}
                            {transaction.status === 'pending' && user._id === transaction.provider._id && (
                                <Button onClick={() => handleStatusChange('accepted')} className="bg-blue-500 hover:bg-blue-600">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                </Button>
                            )}

                            {/* Only provider can complete */}
                            {transaction.status === 'accepted' && user._id === transaction.provider._id && (
                                <Button onClick={() => handleStatusChange('completed')} className="bg-green-500 hover:bg-green-600">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Complete
                                </Button>
                            )}

                            {/* Both provider and recipient can cancel */}
                            {(transaction.status === 'pending' || transaction.status === 'accepted') && (
                                <Button onClick={() => handleStatusChange('cancelled')} className="bg-red-500 hover:bg-red-600">
                                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reviews Section */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-gray-600" />
                            Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transaction.status === 'completed' && !hasReviewed && (
                            <ReviewForm transactionId={id as string} onReviewCreated={fetchReviews} />
                        )}
                        {reviews.length > 0 ? (
                            <ul className="mt-4 space-y-3">
                                {reviews.map((review) => (
                                    <li key={review._id} className="p-3 border rounded-lg shadow-sm bg-gray-50">
                                        <p className="font-semibold">{review.reviewer.name}</p>
                                        <p className="text-gray-600">{review.comment}</p>
                                        <p className="text-yellow-500">⭐ {review.rating}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No reviews yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TransactionDetails;
