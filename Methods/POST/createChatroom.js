const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient'); // Ensure this is correctly set up to connect to MongoDB

router.use(express.json());

router.post('/', async (req, res) => {
    console.log("Received request to create a chatroom");

    const userIDs = req.body.userIDs;

    // Validate that userIDs is an array of at least 5 users
    if (!userIDs || !Array.isArray(userIDs) || userIDs.length < 5) {
        return res.status(400).json({
            errmsg: 'userIDs is required, must be an array, and must contain at least 5 users'
        });
    }

    try {
        const usersCollection = database.collection('users');
        const chatroomsCollection = database.collection('chatrooms');

        // Find all users in the `users` collection whose Spotify IDs match those provided in `userIDs`
        const users = await usersCollection.find({ "spotify_info.id": { $in: userIDs } }).toArray();

        // Check if all provided userIDs were found in the database
        if (users.length !== userIDs.length) {
            return res.status(404).json({
                errmsg: 'One or more user IDs are not registered in the database'
            });
        }

        // Create a new chatroom with the verified user IDs
        const chatroom = {
            participants: userIDs,  // Storing the verified Spotify IDs
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
