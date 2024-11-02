const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// POST route for moving to genre match queue
router.post('/', async (req, res) => {
    const { userid, genre } = req.headers;

    // check if userid and genre are provided
    if (!userid || !genre) 
        return res.status(400).json({
            errmsg: 'userid and genre are required'
        });

    try {
        const queues = database.collection('genreQueue');

        // check if user is already in queue with genre
        const existingEntry = await queues.findOne({
            userid: userid,
            genre: genre
        });

        // if user is already in queue, send error
        if (existingEntry) {
            console.error(`User ${userid} is already in queue for genre ${genre}`);
            return res.status(400).json({
                errmsg: `User ${userid} is already in queue for genre ${genre}`
            });
        }

        // add user to genre queue
        await queues.insertOne({
            userid: userid,
            genre: genre
        });

        // log add to queue
        console.log(`user with ID ${userid} added to genre queue for genre ${genre}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userid} added to genre queue for genre ${genre}`
        });
    } catch (error) {
        console.error('db error', error);
        res.status(500).json({
            errmsg: 'failed to add user to genre queue'
        });
    }
});

module.exports = router;
