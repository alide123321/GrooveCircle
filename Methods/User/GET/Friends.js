const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid } = req.headers;
    const enrich = req.query.enrich === 'true'; 

    if (!userid) {
        return res.status(400).json({ errmsg: 'userid is required' });
    }

    const fetchOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            userid,
        },
    };

    try {
        const userInfo = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions).then((response) =>
            response.json()
        );

        if (!userInfo.user || !userInfo.user.friends_list) {
            return res.status(404).json({ errmsg: 'No friends found.' });
        }

        if (enrich) {
            const enrichedFriends = await Promise.all(
                userInfo.user.friends_list.map(async (friendId) => {
                    try {
                        const friendResponse = await fetch(`http://localhost:${process.env.PORT}/User`, {
                            method: 'GET',
                            headers: { userid: friendId },
                        });
                        const friendData = await friendResponse.json();

                        if (friendData.user) {
                            return {
                                id: friendData.user.spotify_info.id,
                                username: friendData.user.username || friendData.user.spotify_info.id,
                            };
                        }
                    } catch (error) {
                        console.error(`Failed to fetch friend data for ID: ${friendId}`, error);
                    }
                    //displays ID if no data is available
                    return { id: friendId, username: friendId };
                })
            );
            return res.status(200).json({ friendsList: enrichedFriends });
        }

        res.status(200).json({
            friendsList: userInfo.user.friends_list,
        });
    } catch (error) {
        console.error('Error fetching friends list:', error);
        res.status(500).json({ errmsg: 'Failed to fetch friends list.' });
    }
});

module.exports = router;
