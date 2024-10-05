const express = require('express');
const router = express.Router();

// POST route for moving to artist match queue
router.post('/', (req, res) => {
    const { userID, artist } = req.query;

    if (!userID || !artist) 
        return res.status(400).json({
            errmsg: 'userID and blockID are required'
        });
        
    res.status(200).send(`User with ID ${userID} moved to artist queue for artist ${artist}`);
});

module.exports = router;
