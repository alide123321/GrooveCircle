const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    let { userid, limit, offset } = req.headers;

    // Ensure userid and limit are valid
    userid = userid?.trim();
    limit = parseInt(limit?.trim() || 10);
    offset = parseInt(offset?.trim() || 0); // Default offset is 0

    if (!userid) {
        return res.status(400).json({ errmsg: 'Valid userid is required.' });
    }

    try {
        // Fetch listening history for the user
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                userid,
                limit,
                offset
            }
        };

        const response = await fetch(`http://localhost:${process.env.PORT}/listeningHistory`, fetchOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch listening history. Status: ${response.status}`);
        }

        const body = await response.json();

        // Validate and return song history
        if (!body.tracks || body.tracks.length === 0) {
            return res.status(404).json({ errmsg: 'No listening history found.' });
        }

        const songHistory = body.tracks.map((track) => ({
            name: track.track.name,
            artist: track.track.artists.map((artist) => artist.name).join(', '),
            id: track.track.id,
            image: track.track.album.images[2]
        }));

        res.status(200).json({ songHistory, length: songHistory.length });
    } catch (error) {
        console.error('Error fetching song history:', error);
        res.status(500).json({
            errmsg: error.message || 'An error occurred while fetching song history.'
        });
    }
});

module.exports = router;
