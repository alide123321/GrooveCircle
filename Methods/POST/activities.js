const express = require('express');
const router = express.Router();
router.use(express.json());
const { database } = require("../../dbClient");


// POST route for posting an activity
router.post('/', async (req, res) => {
    try {
        // insert activity into database
        const activitys = database.collection('activitys');
        await activitys.insertOne({
            message: req.body.message,
            user_id: req.body.user_id,
            activity_type: req.body.activity_type,
            timestamp: req.body.timestamp,
            reactions: [],
        }); 

        res.status(200).send("Activity posted successfully");
    } catch (error) {
        console.error("Error posting activity:", error);
        res.status(500).send("Error posting activity");
    }
});

module.exports = router;