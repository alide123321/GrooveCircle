const express = require('express');
const router = express.Router();
const { database } = require("../../dbClient");

// This is a DELETE request to remove a user from the song queue
router.delete('/', async (req, res) => {
    const { userID, songID } = req.query;

    // check if userID and songID are provided
    if (!userID || !songID) {
        return res.status(400).json({
            errmsg: 'userID and songID are required'
        });
    }

    try {
        const queues = database.collection('songQueue');
        
        // check if user is in queue with this song
        const existingEntry = await queues.findOne({
            userID: userID,
            songID: songID
        });

        // if user is not in queue, send error 
        if (!existingEntry) {
            console.error(`User ${userID} is not in queue for song ${songID}`);
            return res.status(400).json({
                errmsg: `User ${userID} is not in queue for song ${songID}`
            });
        }

        // remove user from queue
        await queues.deleteOne({
            userID: userID,
            songID: songID
        });
        
        // log remove from queue
        console.log(`user with ID ${userID} removed from song queue for song ${songID}`);

        // send response
        res.status(200).json({
            message: `User with ID ${userID} removed from song queue for song ${songID}`
        });
    } catch (error) {
        console.error('could not remove user from song queue', error);
        res.status(500).json({
            errmsg: 'Internal server error'
        });
    }
});

module.exports = router;
