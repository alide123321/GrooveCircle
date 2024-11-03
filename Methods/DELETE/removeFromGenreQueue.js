const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// DELETE route for moving user to genre queue
router.delete('/', async (req, res) => {
    const { userID, genre } = req.query;

    // check if userID and genre are provided
    if (!userID || !genre) {
        return res.status(400).send('userID and genre are required');
    }
    
    try {
        const queues = database.collection('genreQueue');

        // check if user is in queue with genre
        const existingEntry = await queues.findOne({
            userID: userID,
            genre: genre
        });

        // if user is not in queue, send error
        if (!existingEntry) {
            console.error(`User ${userID} is not in queue for genre ${genre}`);
            return res.status(400).json({
                errmsg: `User ${userID} is not in queue for genre ${genre}`
            });
        }

        // remove user from genre queue
        await queues.deleteOne({
            userID: userID,
            genre: genre
        });

        // log remove from queue
        console.log(`user with ID ${userID} removed from genre queue for genre ${genre}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userID} removed from genre queue for genre ${genre}`
        });
    } catch (error) {
        console.error('could not remove user from genre queue', error);
        res.status(500).json({
            errmsg: 'failed to remove user from genre queue'
        });
    }
});

module.exports = router;
