import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    estimatedTime: {
        type: Number, // in minutes
        required: true
    },
    location: {
        type: String,
        required: true
    },
    availability: [
        {
            day: String,
            startTime: String,
            endTime: String
        }
    ],
    status: {
        type: String,
        enum: ["active", "inactive", "completed"],
        default: "active"
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Index for faster searching
serviceSchema.index({ title: "text", description: "text", category: "text" }); 

const Service = mongoose.model("Service", serviceSchema);

export default Service;