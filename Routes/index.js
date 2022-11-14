const express = require("express"); // this page require express
const router = new express.Router(); //initalize router

router.get("/test", async (req, res) => {
  try {
    res.send("we are live :)");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
