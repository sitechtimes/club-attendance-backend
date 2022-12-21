const { google } = require("googleapis");

//Function that access google spreadsheet
//and returns user's google spreadsheet object data
exports.authSheetsMiddleware = async (req, res, next) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "keys.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    //Create client instance for auth
    const authClient = await auth.getClient();

    //Instance of the spreadsheet API
    const sheets = google.sheets({ version: "v4", auth: authClient });

    req.object = {
      auth,
      authClient,
      sheets,
    };
    return next();
  } catch (error) {
    console.log(error);
  }
};
