const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { MatchingInfo } = req.params; 
    req.statusCode(200).json({
        matchingList: "matching details, currSong, artist, genre, etc..."
    });
});

module.exports = router;