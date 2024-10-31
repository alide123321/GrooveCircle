const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

router.get('/', async (req, res) => {
    
    const { userID } = req.query; 

    if (!userID)
        return res.status(400).json({
            errmsg: "UserID is required"
        });

    const users = database.collection('users');
    const user = await users.findOne({"spotify_info.id" : userID });

    //calls other services to get user info and return it in the json
    
    res.status(200).json({
        user: user
    });
});

module.exports = router;