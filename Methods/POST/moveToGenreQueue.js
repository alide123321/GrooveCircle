const express = require('express');
const router = express.Router();

// POST route for moving to genre match queue
router.post('/', (req, res) => {
    const { userID, genre } = req.query;

    if (!userID || !genre) 
        return res.status(400).json({
            errmsg: 'userID and genre are required'
        });
        
    res.status(200).send(`User with ID ${userID} moved to genre queue for genre ${genre}`);
});

module.exports = router;
