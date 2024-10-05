const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query;
    
    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });
    
    const friendsList = [
        { userID: "005"},
        { userID: "006"},
        { userID: "007"},
    ]
    res.status(200).json({
        friendsList: friendsList
    });
});

module.exports = router;