const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');
const fetch = require('node-fetch');

// Route to fetch song history for a specific user
router.get('/', async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ errmsg: "UserID is required" });
    }

    try {
        // Retrieve the user from MongoDB to get the Spotify access token
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({ "spotify_info.id": userID });

        if (!user || !user.spotify_info.access_token) {
            return res.status(404).json({ errmsg: "User not found or not authenticated with Spotify" });
        }

        const accessToken = user.spotify_info.access_token;

        // Call Spotify API to get recently played tracks
        const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            // If the token is expired or invalid, you might need to refresh the token here
            return res.status(response.status).json({ errmsg: "Error fetching song history from Spotify" });
        }

        const data = await response.json();

        // Return the recently played tracks to the client
        res.status(200).json({
            songHistory: data.items.map(item => ({
                trackName: item.track.name,
                albumName: item.track.album.name,
                artistNames: item.track.artists.map(artist => artist.name),
                playedAt: item.played_at,
                trackUri: item.track.uri
            }))
        });
    } catch (error) {
        console.error("Error fetching song history:", error);
        res.status(500).json({ errmsg: "Error fetching song history" });
    }
});

module.exports = router;
