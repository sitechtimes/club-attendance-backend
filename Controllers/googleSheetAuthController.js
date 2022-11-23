const { google } = require("googleapis");

//Function that access google sheet
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
