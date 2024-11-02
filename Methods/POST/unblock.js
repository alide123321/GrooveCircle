const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { database } = require("../../dbClient");

// POST route for blocking a user
router.post("/", async (req, res) => {
  const users = database.collection("users");
  const { userid, blockedid } = req.headers;

  if (!userid || !blockedid)
    return res.status(400).send({
      errmsg: "userid and blockedid are required",
    });

  if (userid === blockedid)
    return res.status(400).send({
      errmsg: "User cannot unblock themselves",
    });

    let fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        userid: userid,
      },
    };

    fetch(`http://localhost:${process.env.PORT}/Blocked`, fetchOptions)
    .then((response) => response.json())
    .then((body) => {
        if (!body.blockedlist) 
            throw new Error("User not found");

        users.updateOne({ "spotify_info.id": userid },{ $pull: { blocked_list: blockedid }});
    }).catch((error) => {
        console.error("Error fetching user:", error);
        return res.status(404).send({
            errmsg: error.message || "An error occurred",
        });
    });

    if (res.headersSent) return;

    res.status(200).send(`User with ID \'${userid}\' unblocked user with ID \'${blockedid}\'`);
});

module.exports = router;
