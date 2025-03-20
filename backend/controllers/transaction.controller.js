import Transaction from "../models/transaction.model.js";
import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Create a new transaction
export const createTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { serviceId, scheduledStartTime, scheduledEndTime, notes } = req.body;

        if (!scheduledStartTime || !scheduledEndTime) {
            return res.status(400).json({ message: "Scheduled start and end times are required." });
        }

        const parsedStartTime = new Date(scheduledStartTime);
        const parsedEndTime = new Date(scheduledEndTime);

        if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
            return res.status(400).json({ message: "Invalid date format for scheduled time." });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.status !== "active") {
            return res.status(400).json({ message: "Service is not available" });
        }

        if (service.provider.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot book your own service" });
        }

        const creditsRequired = Math.ceil(service.estimatedTime / 60);

        const user = await User.findById(req.user._id);
        if (user.credits < creditsRequired) {
            return res.status(400).json({
                message: `Insufficient credits. You need ${creditsRequired} credits but have ${user.credits}.`
            });
        }

        const transaction = new Transaction({
            service: serviceId,
            provider: service.provider,
            recipient: req.user._id,
            credits: creditsRequired,
            scheduledTime: {
                startTime: parsedStartTime,
                endTime: parsedEndTime
            },
            notes
        });

        user.credits -= creditsRequired;
        await user.save({ session });

        await transaction.save({ session });
        await session.commitTransaction();

        res.status(201).json(transaction);
    } catch (error) {
        await session.abortTransaction();
        console.error("Error in createTransaction controller:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        session.endSession();
    }
};


// Get all transactions for current user (both as provider and recipient)
export const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { provider: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .populate("service", "title estimatedTime")
        .populate("provider", "name profilePic")
        .populate("recipient", "name profilePic")
        .sort({ createdAt: -1 });
        
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error in getUserTransactions controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate("service", "title description category estimatedTime")
            .populate("provider", "name email profilePic")
            .populate("recipient", "name email profilePic");

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Use mongoose.Types.ObjectId to ensure req.user._id is an objectId.
        const reqUserId = new mongoose.Types.ObjectId(req.user._id);


        // Check if user is part of this transaction using equals()
        if (!transaction.provider._id.equals(reqUserId) && 
            !transaction.recipient._id.equals(reqUserId)) {
            return res.status(401).json({ message: "Not authorized" });
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error("Error in getTransactionById controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { status, completionNotes, actualStartTime, actualEndTime } = req.body;

        const transaction = await Transaction.findById(req.params.id).populate("service");

        if (!transaction) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Transaction not found." });
        }

        const isProvider = transaction.provider.toString() === req.user._id.toString();
        const isRecipient = transaction.recipient.toString() === req.user._id.toString();

        if (!isProvider && !isRecipient) {
            await session.abortTransaction();
            return res.status(403).json({ message: "You are not authorized to modify this transaction." });
        }

        if (status === "accepted" && !isProvider) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Only service providers can accept transactions." });
        }


        if (status === "completed" && !isRecipient) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Only service recipients can mark transactions as completed." });
        }

        if (status === "cancelled") {
            if (transaction.status === "pending" || transaction.status === "accepted") {
                const recipient = await User.findById(transaction.recipient);
                if (recipient) {
                    recipient.credits += transaction.credits;
                    await recipient.save({ session });
                }
            }
        }

        if (status === "completed" && transaction.status === "accepted") {
            const provider = await User.findById(transaction.provider);
            if (provider) {
                provider.credits += transaction.credits;
                await provider.save({ session, validateBeforeSave: false }); // added validation false.
            }
        
            transaction.actualTime = actualStartTime && actualEndTime
                ? {
                    startTime: new Date(actualStartTime),
                    endTime: new Date(actualEndTime),
                }
                : {
                    startTime: transaction.scheduledTime.startTime,
                    endTime: transaction.scheduledTime.endTime,
                };
        
            if (completionNotes) {
                transaction.completionNotes = completionNotes;
            }
        }

        transaction.status = status;
        await transaction.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Transaction status updated", transaction });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Error in updateTransactionStatus controller:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Validation error: " + error.message });
        }

        res.status(500).json({ message: "Server error: " + error.message });
    } finally {
        session.endSession();
    }
};

// Get transaction statistics for a user
export const getTransactionStats = async (req, res) => {
    try {
        const stats = {
            totalProvided: 0,
            totalReceived: 0,
            creditsEarned: 0,
            creditsSpent: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            cancelledTransactions: 0 // Added cancelledTransactions
        };

        // Get all transactions where user is provider
        const providedTransactions = await Transaction.find({ provider: req.user._id });
        stats.totalProvided = providedTransactions.length;

        // Get all transactions where user is recipient
        const receivedTransactions = await Transaction.find({ recipient: req.user._id });
        stats.totalReceived = receivedTransactions.length;

        // Calculate credits earned (from completed transactions as provider)
        const completedProvided = providedTransactions.filter(t => t.status === "completed");
        stats.creditsEarned = completedProvided.reduce((sum, t) => sum + t.credits, 0);
        stats.completedTransactions = completedProvided.length;

        // Calculate credits spent (from all transactions as recipient)
        stats.creditsSpent = receivedTransactions.reduce((sum, t) => sum + t.credits, 0);

        // Calculate pending transactions
        const pendingTransactions = [...providedTransactions, ...receivedTransactions]
            .filter(t => t.status === "pending" || t.status === "accepted");
        stats.pendingTransactions = pendingTransactions.length;

        // Calculate cancelled transactions
        const cancelledTransactions = [...providedTransactions, ...receivedTransactions]
            .filter(t => t.status === "cancelled");
        stats.cancelledTransactions = cancelledTransactions.length; // Added cancelledTransactions calculation

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error in getTransactionStats controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};