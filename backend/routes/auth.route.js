import {  Router } from "express";
import { getProfile, login, signUp, updateUserProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/profile", protect,getProfile);
router.put('/profile', protect, updateUserProfile);

export default router;