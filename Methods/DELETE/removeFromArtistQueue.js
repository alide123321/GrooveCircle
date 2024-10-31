const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// DELETE route for moving user to genre queue
router.delete('/', async (req, res) => {
    const { userID, artist } = req.query;

    // check if userID and artist are provided
    if (!userID || !artist) {
        return res.status(400).send('userID and artist are required');
    }

    try {
        const queues = database.collection('artistQueue');

        // check if user is in queue with artist
        const existingEntry = await queues.findOne({
            userID: userID,
            artist: artist
        });

        // if user is not in queue, send error
        if (!existingEntry) {
            console.error(`User ${userID} is not in queue for artist ${artist}`);
            return res.status(400).json({
                errmsg: `User ${userID} is not in queue for artist ${artist}`
            });
        }

        // remove user from artist queue
        await queues.deleteOne({
            userID: userID,
            artist: artist
        });

        // log remove from queue
        console.log(`user with ID ${userID} removed from artist queue for artist ${artist}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userID} removed from artist queue for artist ${artist}`
        });
    } catch (error) {
        console.error('could not remove user from artist queue', error);
        res.status(500).json({
            errmsg: 'failed to remove user from artist queue'
        });
    }
});

module.exports = router;
