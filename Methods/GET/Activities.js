const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { activities } = req.params; 
    req.statusCode(200).json({
        activities: "this is your feed"
    });
});

module.exports = router;