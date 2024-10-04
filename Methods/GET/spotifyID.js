const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query;
    
    if (!userID)
        return res.status(400).json({
            errmsg: "UserID is required"
        });

        // This is where you would query the database for the user's Spotify ID
    res.status(200).json({
        spotifyID: "123456"
    });
});

module.exports = router;