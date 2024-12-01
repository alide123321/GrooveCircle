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

        res.status(200).json({
            messages: chatroom.messages || []
        })
    } catch (error) {
        console.error('Error fetching chatroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;