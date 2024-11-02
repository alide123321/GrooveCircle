const express = require('express');
const { database } = require("../../dbClient");
const router = express.Router();

router.get('/', (req, res) => {
    const { userid } = req.headers; 

    if (!userid) 
        return res.status(400).json({
            errmsg: "userid is required"
        });
    
        fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions)
        .then(response => response.json())
        .then(body => {
            if(!body.user || !body.user.activities)
                throw new Error("User not found");

            let activities = [];

            let activitieslist = database.collection('activitie_list');
            for (let i = 0; i < body.user.activitie_list.length; i++) {
                activities.push(activitieslist.findOne({ _id: body.user.activitie_list[i] }));
            }

    
            res.status(200).json({
                activities: activities
            });
            
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            return res.status(404).json({
                errmsg: error.message || "An error occurred"
            });
        });
    
});

module.exports = router;