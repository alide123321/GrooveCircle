const express = require('express');
const router = express.Router();
const { database } = require("../../dbClient");

// This is a DELETE request to remove a user from the song queue
router.delete('/', async (req, res) => {
    const { userID, songID } = req.query;

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

        if (!existingEntry) {
            console.error(`User ${userID} is not in queue for song ${songID}`);
            return res.status(400).json({
                errmsg: `User ${userID} is not in queue for song ${songID}`
            });
        }

        await queues.deleteOne({
            userID: userID,
            songID: songID
        });

        res.status(200).json({
            message: `User with ID ${userID} removed from song queue for song ${songID}`
        });
    } catch (error) {
        console.error('Database error', error);
        res.status(500).json({
            errmsg: 'Internal server error'
        });
    }
});

module.exports = router;
