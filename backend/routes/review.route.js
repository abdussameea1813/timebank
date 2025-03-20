import express from 'express';
import { createReview, getTransactionReviews, getUserReviews, getReviewsForUser, deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get("/transaction/:transactionId", getTransactionReviews);

// Protected routes
router.post("/", protect, createReview);
router.get("/user/:userId", protect, getUserReviews);
router.get("/forUser/:userId", protect, getReviewsForUser);
router.delete("/:id", protect, deleteReview);

export default router;