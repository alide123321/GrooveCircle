const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

// POST route for moving to artist match queue
router.post('/', async (req, res) => {
    const { userid, artistid } = req.headers;

    // check if userid and artist are provided
    if (!userid || !artistid) 
        return res.status(400).json({
            errmsg: 'userid and artistid are required'
        });
    
    try {
        const queues = database.collection('artistQueue');

        // check if user is already in queue with artist
        const existingEntry = await queues.findOne({
            userid: userid,
            artist: artistid
        });

        // if user is already in queue, send error
        if (existingEntry) {
            console.error(`User ${userid} is already in queue for artist ${artistid}`);
            return res.status(400).json({
                errmsg: `User ${userid} is already in queue for artist ${artistid}`
            });
        }

        // add user to artist queue
        await queues.insertOne({
            userid: userid,
            artist: artistid
        });

        // log add to queue
        console.log(`user with ID ${userid} added to artist queue for artist ${artistid}`);

        // send response
        res.status(200).json({
            message: `user with ID ${userid} added to artist queue for artist ${artistid}`
        });
    } catch (error) {
        console.error('could not add user to artist queue', error);
        res.status(500).json({
            errmsg: 'failed to add user to artist queue'
        });
    }
});

module.exports = router;
