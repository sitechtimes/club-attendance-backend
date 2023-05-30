"use strict";

exports.adminCheck = async (req, res) => {
  try {
    if (req.body.user.clientAuthority !== "admin") {
      return res.json("You are not authorize");
    }
    return next();
  } catch (error) {
    console.log(error);
  }
};
