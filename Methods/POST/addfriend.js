const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// POST route for adding a friend
router.post('/', (req, res) => {
    const { userID, friendID } = req.query;

    const users = database.collection('users');
    
    if (!userID || !friendID) 
        return res.status(400).json({
            errmsg: 'userID and friendID are required'
        });
    
    res.status(200).send(`User with ID ${userID} sent a friend request to ${friendID}`);
});

module.exports = router;