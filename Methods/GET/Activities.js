const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query; 

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });
    
    const activities = [
        { activity: "Liked a song by Keshi", timestamp: "2024-10-04"},
        { activity: "Followed Keshi", timestamp: "2024-10-01"},
        { activity: "Added a song to playlist 'Sad Shit'", timestamp: "2024-10-01"},
    ]
    res.status(200).json({
        activities: activities
    });
});

module.exports = router;