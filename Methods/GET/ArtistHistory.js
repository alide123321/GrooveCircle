const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query; 

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });

    const artistHistory = [
        { artist: "Artist 1", listenedAt: "2024-10-04" },
        { artist: "Artist 2", listenedAt: "2024-10-03" },
        { artist: "Artist 3", listenedAt: "2024-10-01" },
    ]

    res.status(200).json({
        artistHistory: artistHistory
    });
});

module.exports = router;