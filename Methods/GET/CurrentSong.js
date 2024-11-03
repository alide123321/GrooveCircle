const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', (req, res) => {
    const { userid } = req.headers; 

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
    
    fetch(`http://localhost:${process.env.PORT}/CurrentListingTo`, fetchOptions)
    .then(response => response.json())
    .then(body => {
        if(!body.currentListeningTo)
            throw new Error("currentListeningTo not found");

        let currentSong = {
            songName: body.currentListeningTo.songName,
            songId: body.currentListeningTo.songId,
        }

        res.status(200).json({
            currentSong: currentSong
        });

            
    }).catch(error => {
        console.error("Error fetching user:", error);
        return res.status(404).json({
            errmsg: error.message || "An error occurred"
        });
    });

    
});

module.exports = router;