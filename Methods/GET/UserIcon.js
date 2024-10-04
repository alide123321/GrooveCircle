const express = require('express');
const router = express.Router();

router.get('/UserIcon', (req, res) => {
    const { userIcon } = req.params; 
    req.statusCode(200).json({
        userIcon: "Icon"
    });
});

module.exports = router;