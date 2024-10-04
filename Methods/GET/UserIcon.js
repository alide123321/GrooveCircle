const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userIcon } = req.params; 
    req.statusCode(200).json({
        userIcon: "Icon"
    });
});

module.exports = router;