const express = require('express');
const fetch = require('node-fetch'); 
const router = express.Router();
const { database } = require('../../../dbClient'); 

router.use(express.json());

//POST route for creating a chatroom
router.post('/', async (req, res) => {
    const userIDs = req.headers.userids ? JSON.parse(req.headers.userids) : null;

    if (!userIDs || !Array.isArray(userIDs) || userIDs.length !== 5) {
        return res.status(400).json({
            errmsg: 'userIDs is required, must be an array, and contain exactly 5 user IDs'
        });
    }

    try {
        let usersData = [];

        //loops through each user ID and fetch user data from the internal service
        for (const id of userIDs) {
            const response = await fetch(`http://localhost:3000/user`, {
                method: 'GET',
                headers: { userid: id }
            });

            if (response.status !== 200) {
                return res.status(404).json({
                    errmsg: `User with ID ${id} not found or error fetching user data`
                });
            }

            const userData = await response.json();
            usersData.push({
                id: userData.user.spotify_info.id,
                sender: userData.user.username
            });
        }

        //this is to create a new chatroom with the retrieved user data
        const chatroom = {
            participants: usersData,
            messages: [], //empty array of objects (this is how we want it stored, not like before)
            Chatroom: true,
            created_at: new Date()
        };

        const chatroomsCollection = database.collection('chatrooms');
        const result = await chatroomsCollection.insertOne(chatroom);

        res.status(200).json({
            message: `Chatroom created successfully.`,
            chatroom: chatroom
        });
    } catch (error) {
        console.error("Error creating chatroom:", error);
        res.status(500).json({
            errmsg: `Error creating chatroom: ${error.message}`
        });
    }
});

module.exports = router;
