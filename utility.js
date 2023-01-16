//find request alphate number
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
    //get the first row data
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

  if (ifValueExist === true) {
    const alphabet = String.fromCharCode(columnNumber + 64);
    console.log(alphabet);
    if (columnNumber >= 27) {
      return "No such alphabet";
    }
    return alphabet;
  } else if (ifValueExist === false) {
    return "There is no such value in google sheet";
  }
};

//find user number
const sheetRowNumberFinder = async (
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
  let rowNumber = 0;
  let ifValueExist = false;
  for (let i = 0; data.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = data[i][0];
    rowNumber++;
    if (eachId === valueComparing) {
      ifValueExist = true;
      break;
    }
  }

  if (ifValueExist === true) {
    console.log(rowNumber);
    return rowNumber;
  } else if (ifValueExist === false) {
    return "There is no such value in google sheet";
  }
};

module.exports = { sheetColumnAlphabetFinder, sheetRowNumberFinder };
