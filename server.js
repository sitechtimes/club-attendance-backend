const express = require("express"); // this page require express
const port = process.env.PORT || 3000; // host the server on a hosting app or localhost 3000
const app = express(); //initalize express
const routes = require("./Routes/index");

app.listen(port, () => {
  // let us know what port the server is up on
  console.log(`Server is up on ${port}`);
});

app.use("/", routes);
