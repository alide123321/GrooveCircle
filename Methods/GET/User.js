const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { user } = req.params; 
    req.statusCode(200).json({
        user: "maps to username, songHist, artistHist, userIcon, friends, block, songID"
    });
});

module.exports = router;