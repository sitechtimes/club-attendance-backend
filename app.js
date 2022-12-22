const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const routes = require("./Routes/index");
const session = require("express-session");
const cors = require("cors");

require("dotenv").config({ path: "variables.env" });
const SESSION_SECRET = `${process.env.SESSION_SECRET}`;

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   session({
//     secret: `${SESSION_SECRET}`,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true, maxAge: 3599000 },
//   })
// );

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

//https://medium.com/developer-rants/session-cookies-between-express-js-and-vue-js-with-axios-98a10274fae7
app.use(
  "/",
  cors({
    corsOptionsDelegate,
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
  routes
);
