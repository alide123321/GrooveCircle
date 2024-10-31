const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { database } = require("../../dbClient");

// POST route for blocking a user
router.post("/", async (req, res) => {
  const users = database.collection("users");
  const { userID, blockedID } = req.query;

  if (!userID || !blockedID)
    return res.status(400).send({
      errmsg: "userID and blockedID are required",
    });

  if (userID === blockedID)
    return res.status(400).send({
      errmsg: "User cannot unblock themselves",
    });

  try {
    let fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch(`http://localhost:${process.env.PORT}/Blocked?userID=${userID}`, fetchOptions)
    .then((response) => response.json())
    .then((body) => {
        if (!body.blockedlist) 
            throw new Error("User not found");

        users.updateOne({ "spotify_info.id": userID },{ $pull: { blocked_list: blockedID }});
    }).catch((error) => {
        console.error("Error fetching user:", error);
        return res.status(404).send({
            errmsg: error.message || "An error occurred",
        });
    });

    if (res.headersSent) return;

    res.status(200).send(`User with ID \'${userID}\' unblocked user with ID \'${blockedID}\'`);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;
