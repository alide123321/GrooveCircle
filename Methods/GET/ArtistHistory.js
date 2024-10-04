const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { artistHistory } = req.params; 
    req.statusCode(200).json({
        username: "u listen to these artists"
    });
});

module.exports = router;