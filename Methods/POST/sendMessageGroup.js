const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');
const { ObjectId } = require('mongodb');

router.use(express.json());

// POST route for sending a message to a group chat
router.post('/', async (req, res) => {
    const { userid, chatroomid } = req.headers;
    const { messageContent } = req.body;

    if (!userid || !chatroomid || !messageContent) {
        return res.status(400).json({
            errmsg: 'userid, chatroomid, and messageContent are required'
        });
    }

    // Validate chatroomid format
    if (!ObjectId.isValid(chatroomid)) {
        return res.status(400).json({
            errmsg: 'Invalid chatroomid format. Must be a 24-character hex string'
        });
    }

    try {
        const chatrooms = database.collection('chatrooms');

        // Convert chatroomid to ObjectId
        const chatroomObjectId = new ObjectId(chatroomid);

        // Check if chatroom exists and is marked as a group chat
        const chatroom = await chatrooms.findOne({ _id: chatroomObjectId, Chatroom: true });

        if (!chatroom) {
            return res.status(404).json({
                errmsg: 'Chatroom not found or not a group chat'
            });
        }

        // Ensure the user is part of the chatroom
        if (!chatroom.participants.includes(userid)) {
            return res.status(403).json({
                errmsg: 'User is not a participant of the chatroom'
            });
        }

        // Insert message into the messages collection
        const messages = database.collection('messages');
        const newMessage = {
            chatroomid: chatroomObjectId,
            userid,
            messageContent,
            timestamp: new Date()
        };
        
        await messages.insertOne(newMessage);

        res.status(200).json({
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending message to group:', error);
        res.status(500).json({
            errmsg: 'Error sending message'
        });
    }
});

module.exports = router;
