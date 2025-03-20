import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "",
    },
    skills: [{
        name: String,
        category: String,
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Expert"],
        },
    }],
    availability: [{
        startTime: String, // changed to string to match the front end.
        endTime: String, // changed to string to match the front end.
        recurring: Boolean,
    }],
    credits: {
        type: Number,
        default: 5,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    profilePic: {
        type: String,
        default: "",
    },
    location: { // Added location field
        type: String,
        default: "",
    },
    timezone: { // Added timezone field
        type: String,
        default: "",
    },
}, { timestamps: true });

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// compare the entered password with the hashed password

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;