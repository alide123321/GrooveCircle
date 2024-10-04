const express = require('express');
const router = express.Router();

// POST route for moving to song match queue
router.post('/', (req, res) => {
    const { userID, songID } = req.body;
    if (!userID || !songID) {
        return res.status(400).send('userID and songID are required');
    }
    res.status(200).send(`User with ID ${userID} moved to song queue for song ${songID}`);
});

module.exports = router;
