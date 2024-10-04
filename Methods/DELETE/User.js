const express = require('express');
const router = express.Router();

router.delete('/', (req, res) => {
    const { user } = req.params; 
    req.statusCode(200).json({
        user: "deleted"
    });
});

module.exports = router;