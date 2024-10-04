const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query;

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });

        //call spotify api to get song history

    res.status(200).json({
        songHistory: "the song history"
    });
});

module.exports = router;