const express = require('express');
const { database } = require("../../../dbClient");
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { userid } = req.headers; 

        if (!userid) {
            return res.status(400).json({
                errmsg: "userid is required"
            });
        }

        // get all activities from database
        const activities = database.collection('activitys');
        const result = await activities.find({ userid: userid }).toArray();

        if (!result) {
            return res.status(404).json({
                errmsg: "No activities found"
            });
        }

        res.status(200).json({
            activities: result
        });
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({
            errmsg: error.message || "Could not fetch activities"
        });
    }
});

module.exports = router;