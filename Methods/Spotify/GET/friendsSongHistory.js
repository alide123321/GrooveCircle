const express = require('express');
const { database } = require('../../../dbClient'); // Adjust path as needed
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid } = req.headers;

    if (!userid) {
        return res.status(400).json({ errmsg: 'userid is required' });
    }

    try {
        // Fetch the current user to get their friends list
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({ "spotify_info.id": userid });

        if (!user || !user.friends_list || user.friends_list.length === 0) {
            return res.status(200).json({ friends: [] });
        }

        // Retrieve details for each friend in friends_list
        const friends = await usersCollection.find({
            "spotify_info.id": { $in: user.friends_list }
        }).toArray();

        // Map friends to friendId and friendName format
        const friendData = friends.map(friend => ({
            friendId: friend.spotify_info.id,
            friendName: friend.username
        }));

        res.status(200).json({ friends: friendData });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ errmsg: 'Failed to fetch friends.' });
    }
});

module.exports = router;
