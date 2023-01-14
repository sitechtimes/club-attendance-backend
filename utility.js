const sheetColumnAlphabetFinder = async (
  sheets,
  spreadsheetId,
  range,
  valueComparing
) => {
  const googleSheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const data = googleSheetData.data.values;

  console.log("help");
  console.log(data[0]);
  console.log("help");

  let ifValueExist = false;
  let columnNumber = 0;
  for (let i = 0; ; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = data[0][i];
    columnNumber++;
    console.log(eachId);
    if (eachId === valueComparing) {
      ifValueExist = true;
      break;
    } else if (eachId === undefined) {
      break;
    }
  }

  const alphabet = String.fromCharCode(columnNumber + 64);
  console.log(alphabet);

  if (ifValueExist === true) {
    if (columnNumber >= 27) {
      return "No such alphabet";
    }
    return alphabet;
  } else if (ifValueExist === false) {
    return "There is no such value in google sheet";
  }
};

module.exports = { sheetColumnAlphabetFinder };
