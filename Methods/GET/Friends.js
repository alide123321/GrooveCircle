const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query;
    
    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });
    
    res.status(200).json({
        friendsList: "these are your friends"
    });
});

module.exports = router;