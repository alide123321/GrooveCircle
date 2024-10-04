const express = require('express');
const router = express.Router();

router.delete('/', (req, res) => {
    const { userID } = req.query; 
    res.status(200).json({
        userID: "deleted"
    });
});

module.exports = router;