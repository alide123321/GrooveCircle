const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query; 

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });
    
    const blockedList = [
        { userID: "124" },
        { userID: "125" },
        { userID: "126" },
    ]

    res.status(200).json({
        blockedList: blockedList
    });
});

module.exports = router;