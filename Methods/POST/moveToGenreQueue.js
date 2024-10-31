const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// POST route for moving to genre match queue
router.post('/', async (req, res) => {
    const { userID, genre } = req.query;

    // check if userID and genre are provided
    if (!userID || !genre) 
        return res.status(400).json({
            errmsg: 'userID and genre are required'
        });

    try {
        const queues = database.collection('genreQueue');

        // check if user is already in queue with genre
        const existingEntry = await queues.findOne({
            userID: userID,
            genre: genre
        });

        // if user is already in queue, send error
        if (existingEntry) {
            console.error(`User ${userID} is already in queue for genre ${genre}`);
            return res.status(400).json({
                errmsg: `User ${userID} is already in queue for genre ${genre}`
            });
        }

        // add user to genre queue
        await queues.insertOne({
            userID: userID,
            genre: genre
        });

        // log add to queue
        console.log(`user with ID ${userID} added to genre queue for genre ${genre}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userID} added to genre queue for genre ${genre}`
        });
    } catch (error) {
        console.error('db error', error);
        res.status(500).json({
            errmsg: 'failed to add user to genre queue'
        });
    }
});

module.exports = router;
