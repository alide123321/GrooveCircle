const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    let { userid, limit } = req.headers;

    // ensures userid and limit are valid
    userid = userid?.trim();
    limit = limit?.trim() || 10; //limit to 10

    if (!userid) {
        return res.status(400).json({ errmsg: "Valid userid is required." });
    }

    try {
        //fetch listening history for the user
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                userid,
                limit,
            },
        };

        const response = await fetch(`http://localhost:${process.env.PORT}/listeningHistory`, fetchOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch listening history. Status: ${response.status}`);
        }

        const body = await response.json();

        //validate and return song history
        if (!body.tracks || body.tracks.length === 0) {
            return res.status(404).json({ errmsg: "No listening history found." });
        }

        const songHistory = body.tracks.map((track) => ({
            name: track.track.name,
            id: track.track.id,
            image: track.track.album.images[2], 
        }));

        res.status(200).json({ songHistory, length: songHistory.length });
    } catch (error) {
        console.error("Error fetching song history:", error);
        res.status(500).json({
            errmsg: error.message || "An error occurred while fetching song history.",
        });
    }
});

module.exports = router;
