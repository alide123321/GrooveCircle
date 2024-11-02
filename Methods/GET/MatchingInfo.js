const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { userid } = req.headers; 

    if (!userid) 
        return res.status(400).json({
            errmsg: "userid is required"
        });

        //call other services to get the matching details

    res.status(200).json({
        matchingList: "matching info"
    });
});

module.exports = router;