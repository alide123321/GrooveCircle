const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient'); 

// POST route for moving to song match queue
router.post('/', async (req, res) => {
    const { userID, songID } = req.query;

    if (!userID || !songID) {
        return res.status(400).json({
            errmsg: 'userID and songID are required'
        });
    }

    try {
        const queues = database.collection('songQueue');

        // Check if user is already in queue with song
        const existingEntry = await queues.findOne({ 
            userID: userID,
            songID: songID 
        });

        if (existingEntry) {
            console.error(`User ${userID} is already in queue for song ${songID}`);
            return res.status(400).json({
                errmsg: `User ${userID} is already in queue for song ${songID}`
            });
        }

        // Add user to song queue
        await queues.insertOne({
            userID: userID,
            songID: songID
        });

        res.status(200).json({
            message: `user with ID ${userID} added to song queue for song ${songID}`
        });

    } catch (error) {
        console.error('Database error', error);
        res.status(500).json({
            errmsg: 'Internal server error'
        });
    }
});

module.exports = router;
