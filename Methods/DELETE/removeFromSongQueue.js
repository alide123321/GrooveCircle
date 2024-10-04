const express = require('express');
const router = express.Router();

// This is a DELETE request to remove a user from the song queue
router.delete('/', (req, res) => {
    const { userID, songID } = req.body;
    if (!userID || !songID) {
        return res.status(400).send('userID and songID are required');
    }
    res.status(200).send(`User with ID ${userID} removed from song queue for song ${songID}`);
});

module.exports = router;
