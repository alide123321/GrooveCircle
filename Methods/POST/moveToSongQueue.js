const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient'); 

// POST route for moving to song match queue
router.post('/', async (req, res) => {
    const { userid, songid } = req.headers;

    // check if userid and songid are provided
    if (!userid || !songid) {
        return res.status(400).json({
            errmsg: 'userid and songid are required'
        });
    }

    try {
        const queues = database.collection('songQueue');

        // Check if user is already in queue with song
        const existingEntry = await queues.findOne({ 
            userid: userid,
            songid: songid 
        });

        // if user is already in queue, send error
        if (existingEntry) {
            console.error(`User ${userid} is already in queue for song ${songid}`);
            return res.status(400).json({
                errmsg: `User ${userid} is already in queue for song ${songid}`
            });
        }

        // Add user to song queue
        await queues.insertOne({
            userid: userid,
            songid: songid
        });
        // log add to queue 
        console.log(`user with ID ${userid} added to song queue for song ${songid}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userid} added to song queue for song ${songid}`
        });

    } catch (error) {
        console.error('could not add user to song queue', error);
        res.status(500).json({
            errmsg: 'failed to add user to song queue'
        });
    }
});

module.exports = router;
