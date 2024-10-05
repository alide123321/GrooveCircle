const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query;

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });

        //call spotify api to get song history
    
    const songHistory = [
        { title: "Night", timestamp: "2024-10-04" },
        { title: "BAND4BAND", timestamp: "2024-10-04" },
        { title: "What You Know Bout Love", timestamp: "2024-10-04" },
    ]
    res.status(200).json({
        songHistory: "the song history"
    });
});

module.exports = router;