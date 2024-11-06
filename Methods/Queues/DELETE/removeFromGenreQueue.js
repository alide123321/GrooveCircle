const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

// DELETE route for moving user to genre queue
router.delete('/', async (req, res) => {
    const { userid, genre } = req.headers;

    // check if userid and genre are provided
    if (!userid || !genre) {
        return res.status(400).send('userid and genre are required');
    }
    
    try {
        const queues = database.collection('genreQueue');

        // check if user is in queue with genre
        const existingEntry = await queues.findOne({
            userid: userid,
            genre: genre
        });

        // if user is not in queue, send error
        if (!existingEntry) {
            console.error(`User ${userid} is not in queue for genre ${genre}`);
            return res.status(400).json({
                errmsg: `User ${userid} is not in queue for genre ${genre}`
            });
        }

        // remove user from genre queue
        await queues.deleteOne({
            userid: userid,
            genre: genre
        });

        // log remove from queue
        console.log(`user with ID ${userid} removed from genre queue for genre ${genre}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userid} removed from genre queue for genre ${genre}`
        });
    } catch (error) {
        console.error('could not remove user from genre queue', error);
        res.status(500).json({
            errmsg: 'failed to remove user from genre queue'
        });
    }
});

module.exports = router;
