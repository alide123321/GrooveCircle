const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    let { userid, limit, offset } = req.headers;

    userid = userid?.trim();
    limit = parseInt(limit?.trim() || 10, 10); //limit of 10 songs returned in one API call
    offset = parseInt(offset?.trim() || 0, 10); //starts fetchibg of songs

    if (!userid) {
        return res.status(400).json({ errmsg: 'Valid userid is required.' });
    }

    try {
        //makes sure it gets right data when 
        const fetchOptions = {
            method: 'GET',
            headers: { userid, limit, offset }
        };

        const response = await fetch(`http://localhost:${process.env.PORT}/listeningHistory`, fetchOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch listening history. Status: ${response.status}`);
        }

        const body = await response.json();

        if (!body.tracks || body.tracks.length === 0) {
            return res.status(404).json({ errmsg: 'No listening history found.' });
        }

        const songHistory = body.tracks.map(track => ({
            name: track.track.name,
            artist: track.track.artists.map(artist => artist.name).join(', '),
            id: track.track.id,
            image: track.track.album.images[2] //small album image
        }));

        res.status(200).json({ songHistory });
    } catch (error) {
        console.error('Error fetching song history:', error);
        res.status(500).json({ errmsg: error.message || 'An error occurred while fetching song history.' });
    }
});

module.exports = router;
