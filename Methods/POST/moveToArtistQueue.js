const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');
const fetch = require('node-fetch');

// POST route for moving to artist match queue
router.post('/', async (req, res) => {
    const { userid, artistid, songid } = req.headers;

    // check if userid and artist are provided
    if (!userid || !artistid || !songid) 
        return res.status(400).json({
            errmsg: 'userid, artistid, and songid are required'
        });
    
    try {
        // remove from song
        const removeOptions = {
            method: 'DELETE',
            headers: {
                userid: userid,
                songid: songid
            }
        };

        // call removeFromSongQueue
        const removeFromSongQueue = await fetch(`http://localhost:${process.env.PORT}/removeFromSongQueue`, removeOptions);
        const removeResult = await removeFromSongQueue.json();

        if (!removeFromSongQueue.ok) {
            console.error(`Failed to remove user ${userid} from song queue for song ${songid}`);
            throw new Error(removeResult.errmsg || 'Failed to remove from song queue');
        }
        
        // log remove from song queue
        console.log(`User ${userid} removed from song queue for song ${songid}`);

        // add to artist queue
        const queues = database.collection('artistQueue');

        // check if user is already in queue with artist
        const existingEntry = await queues.findOne({
            userid: userid,
            artistid: artistid
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
            artistid: artistid
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
