const express = require('express');
const router = express.Router();

router.get('/SongHistory', (req, res) => {
    const { songHistory } = req.params; 
    req.statusCode(200).json({
        username: "the song history"
    });
});

module.exports = router;