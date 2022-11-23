require("dotenv").config({ path: "variables.env" });

//google sheet id for "Main-Club-Data"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

exports.readCell = async (req, res) => {
  const sheets = req.object.sheets;

  // Read rows from spreadsheet
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: MAIN_CLUB_ID,
    range: "Information",
  });

  res.send(getRows.data);
};
