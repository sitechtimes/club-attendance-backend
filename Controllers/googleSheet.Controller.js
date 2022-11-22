const { google } = require("googleapis");
require("dotenv").config({ path: "variables.env" });

//google sheet id for "testing"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

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

exports.compareQRCodeMiddleware = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const userQRCode = req.body;

    const getQRArray = await sheets.spreadsheets.values.get({
      spreadsheetId: MAIN_CLUB_ID,
      range: "Sheet1!H1:I5",
    });
    const qrValue = getQRArray.data.values;

    let idOfSheet = null;
    function googleIDCode() {
      for (let i = 0; qrValue.length > i; i++) {
        let eachQRCode = qrValue[i][0];
        if (eachQRCode === userQRCode.qrCode) {
          idOfSheet = qrValue[i][1];
        } else {
          false;
          // what happen when qr no same
        }
      }
    }
    googleIDCode();
    req.sheetID = idOfSheet;
    next();
  } catch (error) {
    console.log(error);
  }
};

exports.writeName = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: req.sheetID,
      range: "Information",
    });

    res.send(getRows.data);
  } catch (error) {
    console.log(error);
  }
};

exports.readCell = async (req, res) => {
  const sheets = req.object.sheets;

  // Read rows from spreadsheet
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: MAIN_CLUB_ID,
    range: "Sheet1",
  });

  res.send(getRows.data);
};
