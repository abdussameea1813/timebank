import { Router } from "express";
import { 
    createService, 
    getServices, 
    getServiceById, 
    updateService, 
    deleteService, 
    getUserServices, searchServices } from "../controllers/service.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getServices);
router.get("/:id", getServiceById);

// Protected routes
router.post("/", protect, createService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);
router.get('/search', searchServices);
router.get("/user/myservices", protect, getUserServices);

export default router;