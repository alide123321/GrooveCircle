const express = require('express');
const router = express.Router();

// POST route for liking a song
router.post('/', (req, res) => {
    const { userID, songID } = req.query;

    if (!userID || !songID) 
        return res.status(400).json({
            errmsg: 'userID and blockID are required'
        });
        
    // add to activites feed
    
    res.status(200).send(`User with ID ${userID} liked song with ID ${songID}`);
});

module.exports = router;
