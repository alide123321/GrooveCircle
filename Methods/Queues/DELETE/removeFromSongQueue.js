const express = require('express');
const router = express.Router();
const { database } = require("../../../dbClient");

// This is a DELETE request to remove a user from the song queue
router.delete('/', async (req, res) => {
    const { userid, songid } = req.headers;

    // check if userid and songid are provided
    if (!userid || !songid) {
        return res.status(400).json({
            errmsg: 'userid and songid are required'
        });
    }

    try {
        const queues = database.collection('songQueue');
        
        // check if user is in queue with this song
        const existingEntry = await queues.findOne({
            userid: userid,
            songid: songid
        });

        // if user is not in queue, send error 
        if (!existingEntry) {
            console.error(`User ${userid} is not in queue for song ${songid}`);
            return res.status(400).json({
                errmsg: `User ${userid} is not in queue for song ${songid}`
            });
        }

        // remove user from queue
        await queues.deleteOne({
            userid: userid,
            songid: songid
        });
        
        // log remove from queue
        console.log(`user with ID ${userid} removed from song queue for song ${songid}`);

        // send response
        res.status(200).json({
            message: `User with ID ${userid} removed from song queue for song ${songid}`
        });
    } catch (error) {
        console.error('could not remove user from song queue', error);
        res.status(500).json({
            errmsg: 'Internal server error'
        });
    }
});

module.exports = router;
