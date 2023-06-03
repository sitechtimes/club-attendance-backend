"use strict";
require("dotenv").config();

//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;

//this compare the incoming qr code with google spreadsheet qr code
exports.compareQRCodeMiddleware = async (req, res, next) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data

    const userQRCode = req.body; //this is the data from the frontend

    //this specific which google spreadsheet we are acessing
    const getQRArray = await sheets.spreadsheets.values.get({
      spreadsheetId: CLUB_DATA_SPREADSHEET_ID,
      range: "Information!G1:H5",
    });

    //this gets the google spreadsheet's row data
    const qrValue = getQRArray.data.values;

    //this variable will be needed to access the specific club google spreadsheet id
    let idOfSheet = null;

    //this compare the incoming qr code to google spreadsheet qr code
    function googleIDCode() {
      for (let i = 0; qrValue.length > i; i++) {
        let eachQRCode = qrValue[i][0];
        if (eachQRCode === userQRCode.qrCode) {
          idOfSheet = qrValue[i][1];
        }
      }
    }
    googleIDCode();
    req.sheetID = idOfSheet;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.markAttendence = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    const markUser = {
      name: req.body.user.name,
      osis: req.body.user.osis,
      status: req.body.user.status,
    };

    const sheetName = req.body.date;
    console.log(sheetName);
    await sheets.spreadsheets.values.append({
      spreadsheetId: req.sheetID,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[markUser.name, markUser.osis, markUser.status]],
      },
    });

    res.send("Attendence added");
  } catch (error) {
    // need better error handling
    // https://expressjs.com/en/guide/error-handling.html
    // create a middleware fpr event handling
    console.log(error);
    if (
      error.response.data.error.message === "Requested entity was not found."
    ) {
      res.json("Invaild qrCode");
    }
  }
};
