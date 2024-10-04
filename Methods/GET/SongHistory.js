const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { songHistory } = req.params; 
    req.statusCode(200).json({
        songHistory: "the song history"
    });
});

module.exports = router;