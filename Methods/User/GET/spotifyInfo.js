const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', (req, res) => {
    const { userid } = req.headers;
    
    if (!userid)
        return res.status(400).json({
            errmsg: "userid is required"
        });

    let fetchOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            userid: userid
        },
    };

    fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions)
    .then(response => response.json())
    .then(body => {
        if(!body.user)
            throw new Error("User not found");

        res.status(200).json({
            spotifyInfo: body.user.spotify_info
        });

    }).catch(error => {
        console.error("Error fetching user:", error);
        return res.status(404).json({
            errmsg: error.message || "An error occurred"
        });
    });
});

module.exports = router;