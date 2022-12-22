//adds attendence date to club sheet
exports.createAttendeceDate = async (req, res) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: req.sheetID,
      range: "Information",
    });
    const sheetValues = getRows.data.values;
    console.log(sheetValues);

    //this is what adds spread inside club spreadsheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: req.sheetID,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                //this is the data from the frontend for dates
                title: req.body.date,
              },
            },
          },
        ],
      },
    });
    res.json(`You added date of ${createDate.date} to club sheet`);
  } catch (error) {
    console.log(error);
  }
};
