const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid } = req.headers; 
    let { limit } = req.headers || 5

    if (!userid) 
        return res.status(400).json({
            errmsg: "userid and token are required"
        });

    const fetchOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            userid: userid
        },
    };

    let user = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions);
    user = await user.json();
    user = user.user;

    if(!user || !user.spotify_info.access_token)
        return res.status(400).json({
            errmsg: "User not found or user has not authenticated with Spotify"
        });

    const authOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${user.spotify_info.access_token}`
        }
    };
    
    fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, authOptions)
    .then(response => response.json())
    .then(body => {
        if(!body)
            throw new Error("error fetching listening history");
        
        return res.status(200).json({
            tracks: body.items,
            length: body.items.length
        });
    }).catch(error => {
        console.error("Error fetching user:", error);
        return res.status(404).json({
            errmsg: error.message || "An error occurred"
        });
    });
});

module.exports = router;
