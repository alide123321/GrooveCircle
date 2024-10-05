const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query; 

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });

    const currentSong = {
        title: "Night",
        artist: "Keshi", 
        album: "Requiem", 
        duration: "2:59", 
    }

    res.status(200).json({
        currentSong: currentSong
    });
});

module.exports = router;