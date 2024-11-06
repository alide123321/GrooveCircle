const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');
const fetch = require('node-fetch');

// POST route for moving to genre match queue
router.post('/', async (req, res) => {
    const { userid, genre, artistid } = req.headers;

    // check if userid and genre are provided
    if (!userid || !genre || !artistid) 
        return res.status(400).json({
            errmsg: 'userid, genre, and artistid are required'
        });

    try {
        // remove from artist queue
        const removeOptions = {
            method: 'DELETE',
            headers: {
                userid: userid,
                artistid: artistid
            }
        };

        // call removeFromArtistQueue
        const removeFromArtistQueue = await fetch(`http://localhost:${process.env.PORT}/removeFromArtistQueue`, removeOptions);
        const removeResult = await removeFromArtistQueue.json();

        if (!removeFromArtistQueue.ok) {
            console.error(`Failed to remove user ${userid} from artist queue for artist ${artistid}`);
            throw new Error(removeResult.errmsg || 'Failed to remove from artist queue');
        }

        // log remove from artist queue
        console.log(`User ${userid} removed from artist queue for artist ${artistid}`);

        // add to genre queue   
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
