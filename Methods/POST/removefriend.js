const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { database } = require("../../dbClient");

// POST route for adding a friend
router.post("/", async (req, res) => {
    const users = database.collection("users");
    const { userid, friendid } = req.headers;

    if (!userid || !friendid)
        return res.status(400).send({
            errmsg: "userid and friendid are required",
        });

    if (userid === friendid)
        return res.status(400).send({
            errmsg: "User cannot add themselves as a friend",
        });

    let fetchOptions = {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        userid: userid,
        },
    };

    fetch(`http://localhost:${process.env.PORT}/Friends`,fetchOptions)
    .then((response) => response.json())
    .then((body) => {
      if (!body.friendsList) throw new Error("User not found");

      users.updateOne({"spotify_info.id": userid}, {$pull: {friends_list: friendid}});

      fetchOptions.headers.userid = friendid;

      fetch(`http://localhost:${process.env.PORT}/Friends`, fetchOptions)
      .then((response) => response.json())
      .then((body) => {
        if (!body.friendsList) throw new Error("Friend not found");

        users.updateOne({"spotify_info.id": friendid}, {$pull: {friends_list: userid}});
      })
    }).catch((error) => {
      console.error("Error fetching user:", error);
      return res.status(404).send({
        errmsg: error.message || "An error occurred",
      });
    });

  if (res.headersSent) return;
  res.status(200).send(`User with ID \'${userid}\' removed \'${friendid}\' as a friend`);
});

module.exports = router;
