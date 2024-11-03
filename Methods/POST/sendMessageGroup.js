const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { database } = require('../../dbClient'); // Assuming you have a central MongoDB connection in dbClient.js

router.use(express.json());

// POST route for sending a message to a group chatroom
router.post('/', async (req, res) => {
    const { userid, chatroomid } = req.headers;
    const { messageContent } = req.body;

    // Validate required parameters
    if (!userid || !chatroomid || !messageContent) {
        return res.status(400).json({ errmsg: 'userid, chatroomid, and messageContent are required' });
    }

    try {
        // Convert chatroomid to ObjectId and find the chatroom in MongoDB
        const chatroom = await database.collection('chatrooms').findOne({ _id: new ObjectId(chatroomid) });
        
        // Check if the chatroom exists and the user is a participant
        if (!chatroom || !chatroom.participants.includes(userid)) {
            return res.status(404).json({ errmsg: "Chatroom not found or user not part of the group chat" });
        }

        // Insert the message into the messages collection with the relevant details
        await database.collection('messages').insertOne({
            chatroom_id: new ObjectId(chatroomid),
            sender: userid,
            content: messageContent,
            timestamp: new Date()
        });

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message to group:", error);
        res.status(500).json({ errmsg: "Internal server error" });
    }
});

module.exports = router;
