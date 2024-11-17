const express = require('express');
const { database } = require('../../../dbClient'); 
const router = express.Router();

router.get('/', async (req, res) => {
    let { userid } = req.headers;

    userid = userid?.trim();

    if (!userid) {
        return res.status(400).json({ errmsg: "Valid userid is required." });
    }

    try {
        //fetch the user from the database
        const users = database.collection('users');
        const user = await users.findOne({ "spotify_info.id": userid });

        //checks if user exists and has a friends list
        if (!user) {
            return res.status(404).json({ errmsg: "User not found." });
        }

        if (!user.friends_list || user.friends_list.length === 0) {
            return res.status(200).json({ friendsList: [] }); // Return an empty list if no friends
        }

        //return friends list
        res.status(200).json({ friendsList: user.friends_list });
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ errmsg: "Failed to fetch friends." });
    }
});

module.exports = router;
