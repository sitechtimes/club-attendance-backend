const { google } = require("googleapis");
const googleUserKey = require("../Key/googleKey");
require("dotenv").config({ path: "../Key/variables.env" });

//Function that access to google sheet
//and returns user's google sheet object data
exports.authSheetsMiddleware = async (req, res, next) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "keys.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  //Create client instance for auth
  const authClient = await auth.getClient();

  //Instance of the Sheets API
  const sheets = google.sheets({ version: "v4", auth: authClient });

  req.object = {
    auth,
    authClient,
    sheets,
  };
  next();
};

//google sheet id for "testing"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

exports.readCell = async (req, res) => {
  const sheets = req.object.sheets;

  // Read rows from spreadsheet
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: MAIN_CLUB_ID,
    range: "Sheet1",
  });

  res.send(getRows.data);
};

("what when wrong");
