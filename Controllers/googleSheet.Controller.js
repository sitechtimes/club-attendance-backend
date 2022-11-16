const { google } = require("googleapis");

exports.authSheets = async (req, res, next) => {
  //Function for authentication object
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

const id = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";

exports.readCell = async (req, res) => {
  const sheets = req.object.sheets;

  // Read rows from spreadsheet
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: "Sheet1",
  });

  res.send(getRows.data);
};
