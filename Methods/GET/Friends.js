const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const app = express();
app.use(express.json());

router.get('/', (req, res) => {
    const { userid } = req.headers;
    
    if (!userid) 
        return res.status(400).json({
            errmsg: "userid is required"
        });

    const fetchOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            userid: userid
        },
    };
    
    fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions)
    .then(response => {
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(body => {
        if(!body.user || !body.user.friends_list)
            throw new Error("User not found");

        res.status(200).json({
            friendsList: body.user.friends_list
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