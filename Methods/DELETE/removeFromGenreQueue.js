const express = require('express');
const router = express.Router();

// DELETE route for moving user to genre queue
router.delete('/', (req, res) => {
    const { userID, genre } = req.query;
    if (!userID || !genre) {
        return res.status(400).send('userID and genre are required');
    }
    res.status(200).send(`User with ID ${userID} \nremoved from genre queue ${genre}`);
});

module.exports = router;
