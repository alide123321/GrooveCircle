const express = require('express');
const { database } = require('../../../dbClient');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid } = req.headers;

    if (!userid) {
        return res.status(400).json({
            errmsg: "userid is required"
        });
    }

    const users = database.collection('users');
    const user = await users.findOne({ "spotify_info.id": userid });

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