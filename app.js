const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const routes = require("./Routes/index");
const cors = require("./Controllers/corscontroller");

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", cors.CORSmiddleware, routes);
