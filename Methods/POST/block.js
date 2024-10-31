const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { database } = require("../../dbClient");

// POST route for blocking a user
router.post("/", async (req, res) => {
  const users = database.collection("users");
  const { userID, blockID } = req.query;

  if (!userID || !blockID)
    return res.status(400).send({
      errmsg: "UserID and blockID are required",
    });

  if (userID === blockID)
    return res.status(400).send({
      errmsg: "User cannot block themselves",
    });

    let fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch( `http://localhost:${process.env.PORT}/User?userID=${blockID}`, fetchOptions)
    .then((response) => response.json())
    .then((body) => {
        if (!body.user)
            throw new Error("User not found");

        fetch(`http://localhost:${process.env.PORT}/Blocked?userID=${userID}`, fetchOptions)
        .then((response) => response.json())
        .then((body) => {
            if (!body.blockedlist) 
                throw new Error("User not found");

            if (body.blockedlist.includes(blockID)) return;

            users.updateOne({ "spotify_info.id": userID },{ $push: { blocked_list: blockID }});
        }).catch((error) => {
            console.error("Error fetching user:", error);
            return res.status(404).send({
                errmsg: error.message || "An error occurred",
            });
        });
    }).catch((error) => {
        console.error("Error fetching user:", error);
        return res.status(404).json({
            errmsg: error.message || "An error occurred",
        });
    });

});

module.exports = router;
