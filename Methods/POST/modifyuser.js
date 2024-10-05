const express = require('express');
const router = express.Router();

// POST route for modifying a user
router.post('/', (req, res) => {
    const { userID, newUsername, newIcon } = req.query;

    // Logic for modifying the user
    if (!userID || !newUsername || !newIcon) 
        return res.status(400).json({
            errmsg: 'userID and blockID are required'
        });

    //update user in database

    res.status(200).send(`User with ID ${userID} modified to have username ${newUsername}. New icon: ${newIcon}`);
});

module.exports = router;
