const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// POST route for moving to artist match queue
router.post('/', async (req, res) => {
    const { userID, artist } = req.query;

    // check if userID and artist are provided
    if (!userID || !artist) 
        return res.status(400).json({
            errmsg: 'userID and blockID are required'
        });
    
    try {
        const queues = database.collection('artistQueue');

        // check if user is already in queue with artist
        const existingEntry = await queues.findOne({
            userID: userID,
            artist: artist
        });

        // if user is already in queue, send error
        if (existingEntry) {
            console.error(`User ${userID} is already in queue for artist ${artist}`);
            return res.status(400).json({
                errmsg: `User ${userID} is already in queue for artist ${artist}`
            });
        }

        // add user to artist queue
        await queues.insertOne({
            userID: userID,
            artist: artist
        });

        // log add to queue
        console.log(`user with ID ${userID} added to artist queue for artist ${artist}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userID} added to artist queue for artist ${artist}`
        });
    } catch (error) {
        console.error('could not add user to artist queue', error);
        res.status(500).json({
            errmsg: 'failed to add user to artist queue'
        });
    }
});

module.exports = router;
