import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";

// Create a new service
export const createService = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            category, 
            estimatedTime, 
            location, 
            availability 
        } = req.body;

        // Create new service
        const service = new Service({
            title,
            description,
            provider: req.user._id,
            category,
            estimatedTime,
            location,
            availability
        });

        await service.save();
        res.status(201).json(service);
    } catch (error) {
        console.error("Error in createService controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all services with filtering and pagination
export const getServices = async (req, res) => {
    try {
        const { 
            category, 
            location, 
            search, 
            provider,
            page = 1, 
            limit = 10 
        } = req.query;

        // Build query
        const query = {};
        
        if (category) query.category = category;
        if (location) query.location = location;
        if (provider) query.provider = provider;
        if (search) query.$text = { $search: search };

        // Only show active services by default
        query.status = query.status || "active";

        // Count total matching documents
        const total = await Service.countDocuments(query);

        // Execute query with pagination
        const services = await Service.find(query)
            .populate("provider", "name profilePic")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.status(200).json({
            services,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalServices: total
        });
    } catch (error) {
        console.error("Error in getServices controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get single service by ID
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate("provider", "name email bio profilePic skills credits");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(service);
    } catch (error) {
        console.error("Error in getServiceById controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update service
export const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Check if user is the service provider
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Update service
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedService);
    } catch (error) {
        console.error("Error in updateService controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete service
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Check if user is the service provider
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await service.deleteOne();
        res.status(200).json({ message: "Service removed" });
    } catch (error) {
        console.error("Error in deleteService controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user's own services
export const getUserServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(services);
    } catch (error) {
        console.error("Error in getUserServices controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update service rating when a new review is added
export const updateServiceRating = async (serviceId) => {
    try {
        const reviews = await Review.find({ service: serviceId });
        
        if (reviews.length === 0) return;
        
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await Service.findByIdAndUpdate(serviceId, {
            averageRating,
            totalRatings: reviews.length
        });
    } catch (error) {
        console.error("Error updating service rating:", error);
    }
};

export const searchServices = async (req, res) => {
    try {
        const { query, category, skills } = req.query;
        let filters = {};

        if (query) {
            filters.$text = { $search: query };
        }

        if (category) {
            filters.category = category;
        }

        if (skills) {
            filters.skills = { $in: skills.split(',') };
        }

        const services = await Service.find(filters);
        res.status(200).json(services);
    } catch (error) {
        console.error('Error searching services:', error);
        res.status(500).json({ message: 'Server error' });
    }
};