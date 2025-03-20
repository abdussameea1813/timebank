import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        
        // Validate recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }
        
        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content
        });
        
        await message.save();
        
        // Notify recipient via WebSocket
        req.io.to(recipientId).emit('new_message', {
            messageId: message._id,
            sender: req.user._id,
            senderName: req.user.name,
            content,
            timestamp: message.createdAt
        });
        
        res.status(201).json(message);
    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get conversation with a specific user
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        }).sort({ createdAt: 1 });
        
        // Mark messages as read
        await Message.updateMany(
            { sender: userId, recipient: req.user._id, read: false },
            { read: true }
        );
        
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getConversation controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
    try {
        // Get all unique users the current user has chatted with
        const sentMessages = await Message.find({ sender: req.user._id }).distinct('recipient');
        const receivedMessages = await Message.find({ recipient: req.user._id }).distinct('sender');
        
        // Combine and remove duplicates
        const conversationUserIds = [...new Set([...sentMessages, ...receivedMessages])];
        
        // Get user details and last message for each conversation
        const conversations = await Promise.all(conversationUserIds.map(async (userId) => {
            // Get user details
            const user = await User.findById(userId).select('name profilePic');
            
            // Get last message
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: req.user._id, recipient: userId },
                    { sender: userId, recipient: req.user._id }
                ]
            }).sort({ createdAt: -1 });
            
            // Count unread messages
            const unreadCount = await Message.countDocuments({
                sender: userId,
                recipient: req.user._id,
                read: false
            });
            
            return {
                user,
                lastMessage,
                unreadCount
            };
        }));
        
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getConversations controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};