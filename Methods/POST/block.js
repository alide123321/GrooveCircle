const express = require('express');
const router = express.Router();

// POST route for blocking a user
router.post('/', (req, res) => {
    const { userID, blockID } = req.query;

    if (!userID || !blockID) 
        return res.status(400).json({
            errmsg: 'userID and blockID are required'
        });
    
    res.status(200).send(`User with ID ${userID} blocked user with ID ${blockID}`);
});

module.exports = router;
