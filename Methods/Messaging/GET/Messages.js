const express = require('express');
const { database } = require('../../../dbClient');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid, friendid } = req.headers;

    if (!userid || !friendid) {
        return res.status(400).json({ errmsg: 'userid and friendid are required' });
    }

    try {
        const messagesCollection = database.collection('messages');
        const conversation = await messagesCollection.findOne({
            participants: { $all: [userid, friendid] },
        });

        if (!conversation || !conversation.messages) {
            return res.status(404).json({ messages: [] });
        }

        res.status(200).json({
            messages: conversation.messages.map(msg => ({
                message: msg.message,
                sender: msg.sender,
                timestamp: msg.timestamp || new Date(), // Add timestamp if not present
            })),
        });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ errmsg: 'Failed to load conversation history.' });
    }
});

module.exports = router;
