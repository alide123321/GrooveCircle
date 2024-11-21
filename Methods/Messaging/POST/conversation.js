//this file handles the backend logic for retrieving conversation history between users
const express = require('express');
const { database } = require('../../../dbClient');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid, friendid } = req.query;

    if (!userid || !friendid) {
        return res.status(400).json({ errmsg: 'userid and friendid are required' });
    }

    try {
        const messagesCollection = database.collection('messages');

        const conversation = await messagesCollection.findOne({
            $or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] }
            ]
        });

        if (!conversation) {
            return res.status(200).json({ messages: [] }); 
        }

        return res.status(200).json({ messages: conversation.messages });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return res.status(500).json({ errmsg: 'Failed to fetch conversation' });
    }
});

module.exports = router;
