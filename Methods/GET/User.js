const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query; 

    if (!userID) 
        return res.status(400).json({
            errmsg: "UserID is required"
        });

    //calls other services to get user info and return it in the json
    
    res.status(200).json({
        user: "userInfo"
    });
});

module.exports = router;