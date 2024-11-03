const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// DELETE route for moving user to genre queue
router.delete('/', async (req, res) => {
    const { userid, artist } = req.headers;

    // check if userid and artist are provided
    if (!userid || !artist) {
        return res.status(400).send('userid and artist are required');
    }

    try {
        const queues = database.collection('artistQueue');

        // check if user is in queue with artist
        const existingEntry = await queues.findOne({
            userid: userid,
            artist: artist
        });

        // if user is not in queue, send error
        if (!existingEntry) {
            console.error(`User ${userid} is not in queue for artist ${artist}`);
            return res.status(400).json({
                errmsg: `User ${userid} is not in queue for artist ${artist}`
            });
        }

        // remove user from artist queue
        await queues.deleteOne({
            userid: userid,
            artist: artist
        });

        // log remove from queue
        console.log(`user with ID ${userid} removed from artist queue for artist ${artist}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userid} removed from artist queue for artist ${artist}`
        });
    } catch (error) {
        console.error('could not remove user from artist queue', error);
        res.status(500).json({
            errmsg: 'failed to remove user from artist queue'
        });
    }
});

module.exports = router;
