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

    const sheetValues = getRows.data.values;
    let sheetArray = [];
    sheetValues.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
      // console.log(turnArrayToObject);
    });

    console.log(sheetArray[1]);
    // sheetArray.forEach((element) => {
    //   element.map((value) => ({
    //     clubName: value[0],
    //     advisor: value[1],
    //     president: value[2],
    //     roomNumber: value[3],
    //     memberCount: value[4],
    //     nextMeeting: value[5],
    //     qrCode: value[6],
    //     clubSpreadsheetId: value[7],
    //     clubCode: value[8],
    //   }));
    // });

    res.send(sheetValues);
  } catch (error) {
    console.log(error);
  }
};
