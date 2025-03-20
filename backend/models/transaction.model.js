import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "completed", "cancelled", "disputed"],
        default: "pending"
    },
    scheduledTime: {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        }
    },
    actualTime: {
        startTime: Date,
        endTime: Date
    },
    notes: {
        type: String,
        default: ""
    },
    completionNotes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;