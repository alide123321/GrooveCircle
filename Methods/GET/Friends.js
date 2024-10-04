const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { friends } = req.params; 
    req.statusCode(200).json({
        username: "these are your friends"
    });
});

module.exports = router;