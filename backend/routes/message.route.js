import { Router } from "express";
import { 
    sendMessage, 
    getConversation, 
    getConversations 
} from "../controllers/message.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All routes are protected
router.use(protect);

router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversation/:userId", getConversation);

export default router;