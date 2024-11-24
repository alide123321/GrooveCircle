const express = require('express'); 
const { database } = require('../../../dbClient');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/', async (req, res) => {
    const { chatroomid } = req.headers; 

    if (!chatroomid) {
        return res.status(400).json({ error: 'Chatroom ID is required' });
    }

    try {
        const chatroomCollection = database.collection('chatrooms');
        const chatroom = await chatroomCollection.findOne({ 
            _id: new ObjectId(chatroomid) 
        });

        if (!chatroom) {
            return res.status(404).json({ error: 'Chatroom not found' });
        }

        const messagesCollection = database.collection('messages');
        const messages = await messagesCollection.find({
            chatroom_id: new ObjectId(chatroomid)
        }).sort({ timestamp: 1 }).toArray();

        res.status(200).json({
            chatroomid: chatroom._id,
            participants: chatroom.participants,
            messages: chatroom.messages,
            created_at: chatroom.created_at
        });
    } catch (error) {
        console.error('Error fetching chatroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;