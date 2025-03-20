import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import multer from 'multer';
import path from 'path';

// Multer configuration
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage }).single('profilePic');

export const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const user = new User({ name, email, password });
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.log("error in signup controller", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID provided" });
        }

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: "File upload error", error: err.message });
        }

        try {
            const userId = req.user._id;
            const { bio, location, timezone, name, skills, availability } = req.body;
            let profilePic = req.file ? req.file.path : undefined;

            let parsedSkills = skills ? JSON.parse(skills) : [];
            let parsedAvailability = availability ? JSON.parse(availability) : [];

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { skills: parsedSkills, availability: parsedAvailability, bio, location, timezone, name, profilePic },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error updating user profile:', error);
            if (error.name === "ValidationError") {
                return res.status(400).json({ message: "Validation error: " + error.message });
            }
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
};