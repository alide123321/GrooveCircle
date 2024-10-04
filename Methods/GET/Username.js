const express = require('express');
const router = express.Router();

router.get('/Username', (req, res) => {
    const { userID } = req.params; 
    req.statusCode(200).json({
        username: "JohnDoe"
    });
});

module.exports = router;