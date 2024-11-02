const express = require('express');
const router = express.Router();

// POST route for reacting to an activity
router.post('/', (req, res) => {
    const { userid, activityid, emoji } = req.headers;

    if (!userid || !activityid || !emoji) 
            return res.status(400).json({
                errmsg: 'userid, activityid, and emoji are required'
    });

    res.status(200).send(`User with ID ${userid} reacted to activity ${activityid} with emoji ${emoji}`);
});

module.exports = router;
