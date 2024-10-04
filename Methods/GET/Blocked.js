const express = require('express');
const router = express.Router();

router.get('/Blocked', (req, res) => {
    const { blocked } = req.params; 
    req.statusCode(200).json({
        username: "blocked people"
    });
});

module.exports = router;