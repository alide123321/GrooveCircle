const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.params; 
    req.statusCode(200).json({
        userID: "userID: 123456"
    });
});

module.exports = router;