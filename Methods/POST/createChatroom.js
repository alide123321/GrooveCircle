const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient'); // Ensure your database connection is correctly set up

// Middleware to parse JSON
router.use(express.json());

// POST route for creating a chatroom
router.post('/', async (req, res) => {
    // Extract the `userIDs` array from the headers
    const userIDs = req.headers.userids ? JSON.parse(req.headers.userids) : null;

    // Validate that userIDs is an array and has exactly 5 users
    if (!userIDs || !Array.isArray(userIDs) || userIDs.length !== 5) {
        return res.status(400).json({
            errmsg: 'userIDs is required, must be an array, and contain exactly 5 user IDs'
        });
    }

    try {
        const usersCollection = database.collection('users');
        const chatroomsCollection = database.collection('chatrooms');

        // Check if all provided userIDs exist in the database
        const users = await usersCollection.find({ "spotify_info.id": { $in: userIDs } }).toArray();
        
        if (users.length !== userIDs.length) {
            return res.status(404).json({
                errmsg: 'One or more user IDs are not registered in the database'
            });
        }

        // Create a new chatroom with the verified user IDs
        const chatroom = {
            participants: userIDs,
            created_at: new Date()
        };

        // Insert the new chatroom into the chatrooms collection
        const result = await chatroomsCollection.insertOne(chatroom);

        res.status(200).json({
            message: `Chatroom created successfully.`,
            chatroomID: result.insertedId,
            participants: userIDs
        });
    } catch (error) {
        console.error("Error creating chatroom:", error);
        res.status(500).json({
            errmsg: 'Error creating chatroom'
        });
    }
});

module.exports = router;
