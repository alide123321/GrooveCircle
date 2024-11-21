const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid } = req.headers;

    if (!userid) {
        return res.status(400).json({ errmsg: 'userid is required' });
    }

    try {
        const userResponse = await fetch(`http://localhost:${process.env.PORT}/User`, {
            headers: { userid }
        });

        const userData = await userResponse.json();

        if (!userData.user || !userData.user.friends_list) {
            return res.status(404).json({ errmsg: 'No friends found' });
        }

        const enrichedFriends = await Promise.all(
            userData.user.friends_list.map(async (friendId) => {
                try {
                    const friendResponse = await fetch(`http://localhost:${process.env.PORT}/User`, {
                        headers: { userid: friendId }
                    });

                    const friendData = await friendResponse.json();

                    return {
                        id: friendId,
                        username: friendData.user.username || friendData.user.spotify_info.id,
                        profileImage: friendData.user.profileImage || '/images/default-profile.png' //added profile image
                    };
                } catch (error) {
                    console.error(`Error fetching friend data for ${friendId}:`, error);
                    return { id: friendId, username: friendId, profileImage: '/images/default-profile.png' };
                }
            })
        );

        res.status(200).json({ friendsList: enrichedFriends });
    } catch (error) {
        console.error('Error fetching friends list:', error);
        res.status(500).json({ errmsg: 'Failed to fetch friends list.' });
    }
});

module.exports = router;
