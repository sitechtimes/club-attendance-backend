require("dotenv").config({ path: "variables.env" });

//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;

//this lets us read all the data from main spreadsheet
exports.readCell = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    // Read rows from spreadsheet
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: CLUB_DATA_SPREADSHEET_ID,
      range: "clubData",
    });

    //this holds the mainspread sheet data
    //the data will be a array inside of array
    const sheetValues = getRows.data.values;

    //this array will store the object from
    //changing arrays in sheetValue into object
    let sheetArray = [];

    //this is what change the array into object
    sheetValues.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting
    const sheetObject = sheetArray.map((value) => ({
      clubName: value[0],
      advisor: value[1],
      advisorEmail: value[2],
      president: value[3],
      presidentEmail: value[4],
      presidentUID: value[5],
      roomNumber: value[6],
      memberCount: value[7],
      nextMeeting: value[8],
      qrCode: value[9],
      clubSpreadsheetId: value[10],
      clubCode: value[11],
    }));
    sheetObject.shift();
    //retrun the data
    console.log(sheetObject);
    res.send(sheetObject);
  } catch (error) {
    console.log(error);
  }
};
