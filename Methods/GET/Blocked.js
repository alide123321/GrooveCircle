const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { blocked } = req.params; 
    req.statusCode(200).json({
        blockedList: "blocked people"
    });
});

module.exports = router;