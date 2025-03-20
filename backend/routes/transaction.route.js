import { Router } from "express";
import { 
    createTransaction, 
    getUserTransactions, 
    getTransactionById, 
    updateTransactionStatus, 
    getTransactionStats } from "../controllers/transaction.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All routes are protected
router.use(protect);

router.post("/", createTransaction);
router.get("/", getUserTransactions);
router.get("/stats", getTransactionStats);
router.get("/:id", getTransactionById);
router.put("/:id/status", updateTransactionStatus);

export default router;