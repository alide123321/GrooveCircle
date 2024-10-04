const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { currentSong } = req.params; 
    req.statusCode(200).json({
        username: "this the song youre listening to"
    });
});

module.exports = router;