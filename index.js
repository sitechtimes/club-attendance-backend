const express = require("express");
const { google } = require("googleapis");
 
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
 
app.get("/", (req, res) => {
  res.render("index");
});
 
app.post("/", async (req, res) => {
  const { clubname, advisor, president, clubcode, room } = req.body;
 
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
 
  // Create client instance for auth
  const client = await auth.getClient();
 
  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
 
  const spreadsheetId = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
 
  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });
 
  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A:A",
  });
 
  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1!A:E",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[clubname, advisor, president, clubcode, room]],
    },
  });
 
  res.send("Successfully submitted");
});
 
app.listen(3000, (req, res) => console.log("running on 3000"));
