const express = require('express');
const router = express.Router();

// POST route for linking a Spotify account
router.post('/', (req, res) => {
    const { userID, spotifyAccount } = req.body;
    if (!userID || !spotifyAccount) {
        return res.status(400).send('userID and spotifyAccount are required');
    }
    res.status(200).send(`Spotify account ${spotifyAccount} linked to user with ID ${userID}`);
});

module.exports = router;
