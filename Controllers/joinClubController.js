require("dotenv").config({ path: "variables.env" });

//google sheet id for "Main-Club-Data"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

exports.compareClubCodeMiddleware = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const userClubCode = req.body;

    const getClubCodeArray = await sheets.spreadsheets.values.get({
      spreadsheetId: MAIN_CLUB_ID,
      range: "Information!H1:I5",
    });
    const qrValue = getClubCodeArray.data.values;

    let idOfSheet = null;
    function googleIDCode() {
      for (let i = 0; qrValue.length > i; i++) {
        let eachClubCode = qrValue[i][1];
        if (eachClubCode === userClubCode.clubCode) {
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

exports.addUserToClub = async (req, res) => {
  try {
    const sheets = req.object.sheets;
    const createUser = {
      name: req.body.name,
      osis: req.body.osis,
      position: req.body.position,
      grade: req.body.grade,
      email: req.body.email,
      officalClass: req.body.officalClass,
      numberOfAttendence: req.body.numberOfAttendence,
      numberOfAdsences: req.body.numberOfAdsences,
    };
    console.log(createUser);
    // Write rows to spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: req.sheetID,
      range: "Information",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            createUser.name,
            createUser.osis,
            createUser.position,
            createUser.grade,
            createUser.email,
            createUser.officalClass,
            createUser.numberOfAdsences,
            createUser.numberOfAttendence,
          ],
        ],
      },
    });
    res.json("You are added to the club now.");
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
      res.json("Invaild Club Code");
    }
  }
};
