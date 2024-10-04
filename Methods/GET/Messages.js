const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { messages } = req.params; 
    req.statusCode(200).json({
        messages: "these are your messages"
    });
});

module.exports = router;