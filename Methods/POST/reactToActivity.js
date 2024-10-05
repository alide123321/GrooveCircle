const express = require('express');
const router = express.Router();

// POST route for reacting to an activity
router.post('/', (req, res) => {
    const { userID, activityID, emoji } = req.query;

    if (!userID || !activityID || !emoji) 
            return res.status(400).json({
                errmsg: 'userID, activityID, and emoji are required'
    });

    res.status(200).send(`User with ID ${userID} reacted to activity ${activityID} with emoji ${emoji}`);
});

module.exports = router;
