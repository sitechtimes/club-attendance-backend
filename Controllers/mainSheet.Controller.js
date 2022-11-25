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

    res.send(getRows.data);
  } catch (error) {
    console.log(error);
  }
};
