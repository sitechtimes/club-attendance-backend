require("dotenv").config({ path: "variables.env" });

//google spreadsheet id for "Main-Club-Data"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

//this lets us read all the data from main spreadsheet
exports.readCell = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    // Read rows from spreadsheet
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: MAIN_CLUB_ID,
      range: "Information",
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
      president: value[2],
      roomNumber: value[3],
      memberCount: value[4],
      nextMeeting: value[5],
      qrCode: value[6],
      clubSpreadsheetId: value[7],
      clubCode: value[8],
      nextMeeting: value[9],
    }));

    //retrun the data
    res.send(sheetObject);
  } catch (error) {
    console.log(error);
  }
};
