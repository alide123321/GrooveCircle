const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { database } = require('../../../dbClient');

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
        const chatroomCollection = database.collection('chatrooms');

        // find a chatroom and verify that the user is a participant
        const chatroom = await chatroomCollection.findOne({
            _id: new ObjectId(chatroomid),
        });

        // Check if the chatroom exists and the user is a participant
        if (!chatroom || !chatroom.participants.includes(userid)) {
            return res.status(404).json({ errmsg: "Chatroom not found or user not part of the group chat" });
        }

        // newMessage object
        const newMessage = {
            message: messageContent,
            sender: userid,
            timestamp: new Date()
        };

        // update chatroom document with new message
        await chatroomCollection.updateOne(
            { _id: new ObjectId(chatroomid) },
            { $push: { messages: newMessage } }
        );

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message to group:", error);
        res.status(500).json({ errmsg: "message sending error" });
    }
});

module.exports = router;
