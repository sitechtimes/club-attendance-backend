//One spreadsheet can contains multiple sheets

//return all the data from the spreadsheet's sheet you specify
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
//range- represents the sheet name you want the data from in the spreadsheet
const sheetData = async (sheets, spreadsheetId, range) => {
  console.log("running sheetData");
  const sheet = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const sheetDataValues = sheet.data.values;
  return sheetDataValues;
};

//returns a boolean if the value you are searching for exist
//sheetDataValues-  represent the sheet's data
//valueComparing- represents the item name you are looking for
const ifValueExist = async (
  sheets,
  spreadsheetId,
  range,
  columnNumber,
  valueComparing
) => {
  console.log("running ifValueExist");
  const data = await sheetData(sheets, spreadsheetId, range);
  let suchVale = false;
  for (let i = 0; data.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example

    let eachId = data[i][columnNumber];
    console.log(data[i]);
    if (eachId === valueComparing) {
      suchVale = true;
      break;
    }
  }
  return Promise.resolve(suchVale);
};

//find item row number from a spreadsheet's sheet
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
//range- represents the sheet name you want the data from in the spreadsheet
//valueComparing- represents the item name you are looking for
//return the first match valueComparing in the  sheet as an object of alphabet and columnNumber
const sheetColumnAlphabetFinder = async (
  sheets,
  spreadsheetId,
  range,
  valueComparing
) => {
  console.log("running sheetColumnAlphabetFinder");
  const data = await sheetData(sheets, spreadsheetId, range);

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
    console.log({
      alphabet: alphabet,
      columnNumber: columnNumber - 1,
    });
    if (columnNumber >= 27) {
      return "No such alphabet";
    }
    return {
      alphabet: alphabet,
      columnNumber: columnNumber - 1,
    };
  } else if (ifValueExist === false) {
    return "There is no such value in google sheet";
  }
};

function sheetRowNumberTrue(data, columnNumber, valueComparing) {
  const matchValueArray = [];
  let rowNumber = 0;

  for (let i = 0; data.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = data[i][columnNumber];
    rowNumber++;
    if (eachId === valueComparing) {
      matchValueArray.push(rowNumber);
    }
  }

  if (matchValueArray.length !== 0) {
    console.log(matchValueArray);
    return matchValueArray;
  } else if (matchValueArray.length === 0) {
    return "There is no such value in google sheet";
  }
}

function sheetRowNumberFalse(data, columnNumber, valueComparing) {
  let rowNumber = 0;
  let ifValueExist = false;
  for (let i = 0; data.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = data[i][columnNumber];
    rowNumber++;
    if (eachId === valueComparing) {
      ifValueExist = true;
      break;
    }
  }

  if (ifValueExist === true) {
    console.log(rowNumber);
    return rowNumber;
  }
}

//find user column number
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
//range- represents the sheet name you want the data from in the spreadsheet
//valueComparing- represents the item name you are looking for
//columnNumber- represents the column number for the thing you are looking for
//columnNumber can be found through sheetColumnAlphabetFinder
//addEveryValue- should be a boolean value
//if addEveryValue is true then it would add every row the valueComparing appears in
//if addEveryValue is false then it would return the first value that match valueComparing
const sheetRowNumberFinder = async (
  sheets,
  spreadsheetId,
  range,
  valueComparing,
  columnNumber,
  addEveryValue
) => {
  console.log("running sheetRowNumberFinder");
  const data = await sheetData(sheets, spreadsheetId, range);
  if (addEveryValue) {
    return sheetRowNumberTrue(data, columnNumber, valueComparing);
  } else if (addEveryValue === false) {
    return sheetRowNumberFalse(data, columnNumber, valueComparing);
  }
};

//this function add user to google, which takes three
// parameter: sheet, which is sheet id from req.obect from
//verficationMiddleware
//user data that was pass through after google auth verifcation
//spreadsheetid is from the url id from google sheets
const addUserData = async (sheets, spreadsheetId, value) => {
  //this is the value we are going to add to google sheets
  //value must be an array format
  let values = [value];

  return Promise.resolve(
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "userData",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: values,
      },
    })
  );
};

//this function get user data from "User Data" google sheet
async function getUserData(sheets, spreadsheetId, range, valueComparing) {
  const data = await sheetData(sheets, spreadsheetId, range);

  const columnUidFinder = await sheetColumnAlphabetFinder(
    sheets,
    spreadsheetId,
    range,
    "UID"
  );

  console.log(columnUidFinder);

  let user = null;
  for (let i = 0; data.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = data[i][columnUidFinder.columnNumber];

    if (eachId === valueComparing) {
      user = data[i];
      break;
    }
  }

  const newUserDataObject = {
    uid: user[0],
    firstName: user[1],
    lastName: user[2],
    email: user[3],
    type: user[4],
    osis: user[5],
    grade: user[6],
    officalClass: user[7],
    emailDomain: user[8],
    positionOfClub: JSON.parse(user[9]),
  };

  return Promise.resolve(newUserDataObject);
}

const findAndUpdateValue = async (
  sheets,
  spreadsheetId,
  range,
  valueOfRowThatNeedChange,
  fromWhatYouChanging,
  identifierOfItem,
  inputValue
) => {
  const columnThingFinder = await sheetColumnAlphabetFinder(
    sheets,
    spreadsheetId,
    range,
    valueOfRowThatNeedChange
  );

  const columnIdentifierFinder = await sheetColumnAlphabetFinder(
    sheets,
    spreadsheetId,
    range,
    fromWhatYouChanging
  );
  console.log(identifierOfItem);

  const rowUidNumber = await sheetRowNumberFinder(
    sheets,
    spreadsheetId,
    range,
    identifierOfItem,
    columnIdentifierFinder.columnNumber,
    false
  );

  console.log(`${columnThingFinder.alphabet}:${rowUidNumber}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: range,
    range: `userData!${columnThingFinder.alphabet}${rowUidNumber}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[`${inputValue}`]],
    },
  });
};

module.exports = {
  sheetColumnAlphabetFinder,
  sheetRowNumberFinder,
  sheetData,
  ifValueExist,
  addUserData,
  getUserData,
  findAndUpdateValue,
};
