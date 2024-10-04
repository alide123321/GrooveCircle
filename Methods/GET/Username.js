const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { username } = req.params; 
    req.statusCode(200).json({
        username: "JohnDoe"
    });
});

module.exports = router;