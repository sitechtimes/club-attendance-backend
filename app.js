const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const routes = require("./Routes/index");
const cors = require("cors");

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//this code is guard clauses for cors, which i will deal with
// const corsOptionsDelegate = (req, callback) => {
//   let corsOptions;

//   let isDomainAllowed = whitelist.indexOf(req.header("Origin")) !== -1;
//   let isExtensionAllowed = req.path.endsWith(".jpg");

//   if (isDomainAllowed && isExtensionAllowed) {
//     // Enable CORS for this request
//     corsOptions = { origin: true };
//   } else {
//     // Disable CORS for this request
//     corsOptions = { origin: false };
//   }
//   callback(null, corsOptions);
// };

app.use("/", cors("http://localhost:5173/"), routes);
