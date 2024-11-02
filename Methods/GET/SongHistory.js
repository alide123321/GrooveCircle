const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', (req, res) => {
    const { userid, limit } = req.headers;

    if (!userid) 
        return res.status(400).json({
            errmsg: "userid is required"
        });

    let fetchOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            userid: userid,
            limit: limit
        },
    };

    fetch(`http://localhost:${process.env.PORT}/listeningHistory`, fetchOptions)
    .then(response => response.json())
    .then(body => {
        if(!body || !body.length) 
            throw new Error("No history found");

        res.status(200).json({
            songHistory: body.tracks.map(function(obj) {
                return {
                    name: obj.track.name,
                    id: obj.track.id
                };
            }),
            length: body.length
        });
        
    }).catch(error => {
        console.error("Error fetching user:", error);
        return res.status(404).json({
            errmsg: error.message || "An error occurred"
        });
    });
});

module.exports = router;