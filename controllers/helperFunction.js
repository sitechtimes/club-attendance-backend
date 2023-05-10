"use strict";
const sheetData = async (sheets, spreadsheetId, range) => {
  console.log("running sheetData");
  const sheet = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });
  const sheetDataValues = sheet.data.values;
  return sheetDataValues;
};

module.exports = { sheetData };
