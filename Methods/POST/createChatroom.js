const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

router.use(express.json());

router.post('/', async (req, res) => {
    // Collect user IDs from headers
    const userIds = [];
    for (let i = 1; i <= 5; i++) {
        if (req.headers[`userid${i}`]) {
            userIds.push(req.headers[`userid${i}`]);
        }
    }

    // Check if exactly 5 user IDs are provided
    if (userIds.length !== 5) {
        return res.status(400).json({
            errmsg: 'Five user IDs are required in the headers.'
        });
    }

    try {
        const usersCollection = database.collection('users');
        const chatroomsCollection = database.collection('chatrooms');

        // Verify each user ID exists in the database
        const users = await usersCollection.find({ "spotify_info.id": { $in: userIds } }).toArray();
        if (users.length !== userIds.length) {
            return res.status(404).json({
                errmsg: 'One or more user IDs are not registered in the database.'
            });
        }

        // Create a new chatroom with verified user IDs
        const chatroom = {
            participants: userIds,
            created_at: new Date()
        };
        const result = await chatroomsCollection.insertOne(chatroom);

        res.status(200).json({
            message: `Chatroom created successfully.`,
            chatroomID: result.insertedId,
            participants: userIds
        });
    } catch (error) {
        console.error("Error creating chatroom:", error);
        res.status(500).json({ errmsg: 'Error creating chatroom' });
    }
});

module.exports = router;
