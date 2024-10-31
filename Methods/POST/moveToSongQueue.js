const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient'); 

// POST route for moving to song match queue
router.post('/', async (req, res) => {
    const { userID, songID } = req.query;

    // check if userID and songID are provided
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

        // if user is already in queue, send error
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
        // log add to queue 
        console.log(`user with ID ${userID} added to song queue for song ${songID}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userID} added to song queue for song ${songID}`
        });
        
    } catch (error) {
        console.error('db error', error);
        res.status(500).json({
            errmsg: 'failed to add user to song queue'
        });
    }
});

module.exports = router;
