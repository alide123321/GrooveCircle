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
// New endpoint to retrieve participants for a group chat
router.get('/members', async (req, res) => {
    const { chatroomid } = req.headers;

    if (!chatroomid) {
        return res.status(400).json({ error: 'Chatroom ID is required' });
    }

    try {
        const chatroomCollection = database.collection('chatrooms');
        const chatroom = await chatroomCollection.findOne({
            _id: new ObjectId(chatroomid)
        });

        if (!chatroom || !chatroom.participants) {
            return res.status(404).json({ error: 'Chatroom not found or no participants available' });
        }

        // Retrieve detailed participant info
        const participantDetails = await Promise.all(
            chatroom.participants.map(async (participantId) => {
                try {
                    const userCollection = database.collection('users');
                    const participant = await userCollection.findOne({
                        spotify_id: participantId
                    });

                    return {
                        userid: participantId,
                        username: participant ? participant.username : 'Unknown User'
                    };
                } catch (err) {
                    console.error(`Error fetching user info for participant: ${participantId}`, err);
                    return {
                        userid: participantId,
                        username: 'Unknown User'
                    };
                }
            })
        );

        res.status(200).json({ members: participantDetails });
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;