const express = require('express');
const router = express.Router();

// POST route for linking a Spotify account
router.post('/', (req, res) => {
    const { userid } = req.headers;

    if (!userid) 
        return res.status(400).json({
            errmsg: 'userid and blockID are required'
        });

    let spotifyAccountID = 1234123123
    res.status(200).send(`Spotify account ${spotifyAccountID} linked to user with ID ${userid}`);
});

module.exports = router;
