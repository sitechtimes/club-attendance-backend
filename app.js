const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const routes = require("./Routes/index");
const cors = require("cors");

require("dotenv").config({ path: "variables.env" });

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//this code is guard clauses for cors, meaning
//it prevents unauthorize Origin to accecss this server
const allowlist = ["http://localhost:5173"];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  console.log(req.header("Origin"));

  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }

  console.log(corsOptions);
  callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(
  "/",
  cors({
    corsOptionsDelegate,
    credentials: true,
  }),
  routes
);

//need to manually change all club data in allClubData from clubData.js(sheetObject)
//need to manually change one club data in readAClub from clubData.js(sheetObject)
//need to manually change user data in getUserData from utility.js
