const express = require('express');
const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// POST route for creating a chatroom
router.post('/', (req, res) => {
    const  userIDs  = req.body.userIDs;

    if (!userIDs || !Array.isArray(userIDs)) 
        return res.status(400).json({
            errmsg: 'userIDs is required and must be an array'
        });
    

    // Create a new chatroom with the given user IDs and return the ID from the database

    let chatroomID = 1234;

    res.status(200).send(`Chatroom with ID ${chatroomID} created by user with ID ${userIDs.join(', ')}`);
});

module.exports = router;
