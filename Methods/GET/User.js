const express = require('express');
const { database } = require('../../dbClient');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({
            errmsg: "UserID is required"
        });
    }

    const users = database.collection('users');
    const user = await users.findOne({ "spotify_info.id": userID });

    if (!user) {
        return res.status(404).json({
            errmsg: "User not found"
        });
    }

    res.status(200).json({
        user: user
    });
});

module.exports = router;