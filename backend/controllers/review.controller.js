import Review from "../models/review.model.js";
import Transaction from "../models/transaction.model.js";

export const createReview = async (req, res) => {
    try {
        const { transactionId, rating, comment } = req.body;
        const reviewerId = req.user._id;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction || transaction.status !== 'completed') {
            return res.status(400).json({ message: 'Invalid transaction or transaction not completed' });
        }

        if (transaction.provider.toString() !== reviewerId.toString() &&
            transaction.recipient.toString() !== reviewerId.toString()) {
            return res.status(401).json({ message: 'Not authorized to review this transaction' });
        }

        const existingReview = await Review.findOne({ transaction: transactionId, reviewer: reviewerId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this transaction' });
        }

        const revieweeId = transaction.provider.toString() === reviewerId.toString() ? transaction.recipient : transaction.provider;

        const review = await Review.create({
            transaction: transactionId,
            reviewer: reviewerId,
            reviewee: revieweeId,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTransactionReviews = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const reviews = await Review.find({ transaction: transactionId })
            .populate('reviewer', 'name profilePic');
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error in getTransactionReviews controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ reviewer: userId })
            .populate('transaction');
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error in getUserReviews controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getReviewsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'name profilePic')
            .populate('transaction');
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error in getReviewsForUser controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await review.deleteOne();
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error in deleteReview controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};