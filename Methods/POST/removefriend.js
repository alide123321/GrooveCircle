const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { database } = require("../../dbClient");

// POST route for adding a friend
router.post("/", async (req, res) => {
    const users = database.collection("users");
    const { userID, friendID } = req.query;

    if (!userID || !friendID)
        return res.status(400).send({
            errmsg: "UserID and friendID are required",
        });

    if (userID === friendID)
        return res.status(400).send({
            errmsg: "User cannot add themselves as a friend",
        });

    let fetchOptions = {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
    };

    fetch(`http://localhost:${process.env.PORT}/Friends?userID=${userID}`,fetchOptions)
    .then((response) => response.json())
    .then((body) => {
      if (!body.friendsList) throw new Error("User not found");

      users.updateOne({"spotify_info.id": userID}, {$pull: {friends_list: friendID}});
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      return res.status(404).send({
        errmsg: error.message || "An error occurred",
      });
    });

    if (res.headersSent) return;

    fetch(`http://localhost:${process.env.PORT}/Friends?userID=${friendID}`, fetchOptions)
    .then((response) => response.json())
    .then((body) => {
      if (!body.friendsList) throw new Error("Friend not found");

      users.updateOne({"spotify_info.id": friendID}, {$pull: {friends_list: userID}});
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      return res.status(404).send({
        errmsg: error,
      });
    });

  if (res.headersSent) return;

  res.status(200).send(`User with ID \'${userID}\' removed \'${friendID}\' as a friend`);
});

module.exports = router;
