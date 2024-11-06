const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

// DELETE route for moving user to genre queue
router.delete('/', async (req, res) => {
    const { userid, artistid } = req.headers;

    // check if userid and artist are provided
    if (!userid || !artistid) {
        return res.status(400).json({
            errmsg: 'userid and artistid are required'
        });
    }

    try {
        const queues = database.collection('artistQueue');

        // check if user is in queue with artist
        const existingEntry = await queues.findOne({
            userid: userid,
            artistid: artistid
        });

        // if user is not in queue, send error
        if (!existingEntry) {
            console.error(`User ${userid} is not in queue for artistid ${artistid}`);
            return res.status(400).json({
                errmsg: `User ${userid} is not in queue for artistid ${artistid}`
            });
        }

        // remove user from artist queue
        await queues.deleteOne({
            userid: userid,
            artistid: artistid
        });

        // log remove from queue
        console.log(`user with ID ${userid} removed from artist queue for artistid ${artistid}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userid} removed from artist queue for artistid ${artistid}`
        });
    } catch (error) {
        console.error('could not remove user from artist queue', error);
        res.status(500).json({
            errmsg: 'failed to remove user from artist queue'
        });
    }
});

module.exports = router;
