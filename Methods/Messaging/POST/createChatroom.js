const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient'); //ensures database connection is correctly set up

router.use(express.json());

//POST route for creating a chatroom
router.post('/', async (req, res) => {
    //extract the `userIDs` array from the headers
    const userIDs = req.headers.userids ? JSON.parse(req.headers.userids) : null;

    //validates that userIDs is an array and has exactly 5 users
    if (!userIDs || !Array.isArray(userIDs) || userIDs.length !== 5) {
        return res.status(400).json({
            errmsg: 'userIDs is required, must be an array, and contain exactly 5 user IDs'
        });
    }

    try {
        const usersCollection = database.collection('users');
        const chatroomsCollection = database.collection('chatrooms');

        //checks if all userIDs exist in the database
        const users = await usersCollection.find({ "spotify_info.id": { $in: userIDs } }).toArray();
        
        if (users.length !== userIDs.length) {
            return res.status(404).json({
                errmsg: 'One or more user IDs are not registered in the database'
            });
        }

        //creates a new chatroom with the verified user IDs
        const chatroom = {
            participants: userIDs,
            created_at: new Date()
        };

        //this inserts the new chatroom into the chatrooms collection
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
