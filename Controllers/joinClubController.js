require("dotenv").config({ path: "variables.env" });

//google sheet id for "Main-Club-Data"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

exports.compareClubCodeMiddleware = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const userQRCode = req.body;

    const getQRArray = await sheets.spreadsheets.values.get({
      spreadsheetId: MAIN_CLUB_ID,
      range: "Information!H1:I5",
    });
    const qrValue = getQRArray.data.values;

    let idOfSheet = null;
    function googleIDCode() {
      for (let i = 0; qrValue.length > i; i++) {
        let eachQRCode = qrValue[i][1];
        if (eachQRCode === userQRCode.qrCode) {
          idOfSheet = qrValue[i][0];
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

exports.readCell = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: req.sheetID,
      range: "Information",
    });

    res.send(getRows.data);
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
