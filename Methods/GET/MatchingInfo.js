const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query; 

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });

        //call other services to get the matching details

    res.status(200).json({
        matchingList: "matching details, currSong, artist, genre, etc..."
    });
});

module.exports = router;