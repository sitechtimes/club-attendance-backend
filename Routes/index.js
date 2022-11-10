const express = require("express");
const router = new express.Router();

router.get("/", async (req, res) => {
    const teacher = {name: "Whalen", age:31, tenure: true };
    try {
        res.json(teacher);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;