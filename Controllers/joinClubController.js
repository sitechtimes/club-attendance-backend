require("dotenv").config({ path: "variables.env" });

//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;

//This middleware compare the incoming club code from frontend
//to the club code in the google spreadsheet.
exports.compareClubCodeMiddleware = async (req, res, next) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data
    const userClubCode = req.body; //this is the data from the frontend

    //this specific which google spreadsheet we are acessing
    const getClubCodeArray = await sheets.spreadsheets.values.get({
      spreadsheetId: CLUB_DATA_SPREADSHEET_ID,
      range: "Information!H1:I5",
    });

    //this gets the google spreadsheet's row data
    const qrValue = getClubCodeArray.data.values;

    //this variable will be needed to access the specific club google spreadsheet id
    let idOfSheet = null;

    //this compare the incoming club code to google spreadsheet club code
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
    return next();
  } catch (error) {
    console.log(error);
  }
};

//If the incoming club code matches with the club code in google spreadsheet
//the user will be added to the club
exports.addUserToClub = async (req, res) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data

    //this object will be the user data to be inputted to google spreadsheet to create
    //new user
    const createUser = {
      name: req.body.user.name,
      osis: req.body.user.osis,
      position: req.body.user.position,
      grade: req.body.user.grade,
      email: req.body.user.email,
      officalClass: req.body.user.officalClass,
      numberOfAttendence: req.body.user.numberOfAttendence,
      numberOfAdsences: req.body.user.numberOfAdsences,
    };
    console.log(createUser);
    // Write rows to spreadsheet

    //this function create the user
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

//this will read all the spreadsheet data
exports.readCell = async (req, res) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data

    //this specific which google spreadsheet we are acessing
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
