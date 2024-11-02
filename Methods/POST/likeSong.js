const express = require('express');
const router = express.Router();

// POST route for liking a song
router.post('/', (req, res) => {
    const { userid, songid } = req.headers;

    if (!userid || !songid) 
        return res.status(400).json({
            errmsg: 'userid and blockID are required'
        });
        
    // add to activites feed
    
    res.status(200).send(`User with ID ${userid} liked song with ID ${songid}`);
});

module.exports = router;
