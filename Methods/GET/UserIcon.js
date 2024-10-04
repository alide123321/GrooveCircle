const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userID } = req.query;
    
    if (!userID)
        return res.status(400).json({
            errmsg: "UserID is required"
        });

        //call to database to get user icon

    res.status(200).json({
        userIcon: "Icon"
    });
});

module.exports = router;