const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const routes = require("./Routes/index");

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routes);
("vve");
