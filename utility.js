"use strict";
//One spreadsheet can contains multiple sheets
//return all the data from the spreadsheet's sheet you specify
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
//range- represents the sheet name you want the data from in the spreadsheet
const sheetData = async (sheets, spreadsheetId, range) => {
  const sheet = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const sheetDataValues = sheet.data.values;
  return sheetDataValues;
};

const addItemToRow = async (
  sheets,
  spreadsheetId,
  range,
  itemRowNumber,
  addItem
) => {
  const data = await sheetData(sheets, spreadsheetId, range);
  const item = [];
  item.push(data[itemRowNumber], addItem);

  console.log(...item.flat());

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: `${range}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[...item.flat()]],
    },
  });

  console.log("addData");
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
  console.log(valueComparing);
  const data = await sheetData(sheets, spreadsheetId, range);
  let suchVale = false;
  //binary search
  for (let i = 0; data.length > i; i++) {
    let eachId = data[i][columnNumber];
    console.log(data[i]);
    console.log(eachId);
    if (eachId === valueComparing) {
      suchVale = true;
      break;
    }
  }
  return Promise.resolve(suchVale);
};

const ifValueExistBinary = async (
  sheets,
  spreadsheetId,
  range,
  valueComparing
) => {
  const datas = await sheetData(sheets, spreadsheetId, range);
  const newData = datas.flat().sort((a, b) => {
    return a - b;
  });

  let start = 0;
  let end = newData.length - 1;
  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    if (newData[mid] === valueComparing) {
      return true;
    } else if (newData[mid] < valueComparing) {
      start = mid + 1;
    } else end = mid - 1;
  }
  return false;
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

function sheetRowNumberTrue(data, specificRangeNumber, valueComparing) {
  const matchValueArray = [];

  let start = 0;
  let end = data.length - 1;
  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    console.log(mid, data[mid][specificRangeNumber]);
    if (data[mid][specificRangeNumber] === valueComparing) {
      matchValueArray.push(data[mid]);
    } else if (data[mid][specificRangeNumber] < valueComparing) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }
  console.log("array", matchValueArray);

  if (matchValueArray.length !== 0) {
    console.log(matchValueArray);
    return matchValueArray;
  }

  return console.log(
    "sheetRowNumberFinder: There is no such value in google sheet"
  );
}

function sheetRowNumberFalse(data, specificRangeNumber, valueComparing) {
  let rowNumber = 0;
  let ifValueExist = false;

  let flatData = data[specificRangeNumber].flat();
  for (let i = 0; flatData.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = flatData[i];
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
  specificRangeNumber,
  valueComparing,
  addEveryValue
) => {
  const data = await sheetData(sheets, spreadsheetId, range);

  if (addEveryValue) {
    return sheetRowNumberTrue(data, specificRangeNumber, valueComparing);
  } else if (addEveryValue === false) {
    return sheetRowNumberFalse(data, specificRangeNumber, valueComparing);
  }
};

//this function add user to google, which takes three
// parameter: sheet, which is sheet id from req.obect from
//verficationMiddleware
//user data that was pass through after google auth verifcation
//spreadsheetid is from the url id from google sheets
const addData = async (sheets, spreadsheetId, range, value) => {
  //this is the value we are going to add to google sheets
  //value must be an array format
  let values = [value];
  return Promise.resolve(
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: values,
      },
    })
  );
};

//this function get user data from "User Data" google sheet
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
//range- represents the sheet name you want the data from in the spreadsheet
//valueComparing- represents the item name you are looking for
const getUserData = async (sheets, spreadsheetId, range, valueComparing) => {
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
    clientAuthority: user[4],
    osis: user[5],
    grade: user[6],
    officalClass: user[7],
    emailDomain: user[8],
    clubData: JSON.parse(user[9]),
  };

  return Promise.resolve(newUserDataObject);
};

//find one cell to update the value of the cell
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
//range- represents the sheet name you want the data from in the spreadsheet
//valueOfRowThatNeedChange- represents the item column name of the item that you are looking for to change
//fromWhatYouChanging- find the column of identifier of that user
//identifierOfItem- is basically the comparing value to fromWhatYouChanging's item
//inputValue- is what the user want to put in the cell
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

  console.log(`userData!${columnThingFinder.alphabet}${rowUidNumber}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: `${range}!${columnThingFinder.alphabet}${rowUidNumber}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[`${inputValue}`]],
    },
  });
};

//get the sheet names of the spreadsheet
//sheets- represents the sheets value from  the return object from authSheetsMiddleware
//spreadsheetId- represents the id of the spreadsheet you are looking for
const getSheetNames = async (sheets, spreadsheetId) => {
  const result = (
    await sheets.spreadsheets.get({
      spreadsheetId,
    })
  ).data.sheets.map((sheet) => {
    return sheet.properties.title;
  });
  console.log(result);
  return result;
};

const createNewSheetWithName = async (sheets, spreadsheetId, sheetName) => {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [
        {
          addSheet: {
            properties: {
              //this is the data from the frontend for dates
              title: sheetName,
            },
          },
        },
      ],
    },
  });
};

const sortColumn = async (sheets, spreadsheetId) => {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [
        {
          sortRange: {
            range: {
              sheetId: 0,
              start_row_index: 0,
              end_row_index: 7,
              start_column_index: 0,
              end_column_index: 1,
            },
            sortSpecs: [
              {
                sortOrder: "ASCENDING",
                dimensionIndex: 1,
              },
            ],
          },
        },
      ],
    },
  });
};

const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const updateKnownRowAndColumn = async (
  sheets,
  spreadsheetId,
  range,
  columnAlphabet,
  rowNumber,
  inputValue
) => {
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: `${range}!${columnAlphabet}${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[inputValue]],
    },
  });
};

//inputValue should be in array
const appendNewItemToColumnOrRow = async (
  sheets,
  spreadsheetId,
  range,
  inputValue,
  columnOrRow
) => {
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: range,
    valueInputOption: "USER_ENTERED",
    resource: {
      majorDimension: "COLUMNS",
      values: [inputValue],
    },
  });
};

module.exports = {
  sheetColumnAlphabetFinder,
  sheetRowNumberFinder,
  sheetData,
  ifValueExist,
  addData,
  getUserData, //revamp
  //  getRowData, //revamp
  findAndUpdateValue,
  getSheetNames,
  generateRandomString,
  createNewSheetWithName,
  updateKnownRowAndColumn,
  ifValueExistBinary,
  sortColumn,
  addItemToRow,
  appendNewItemToColumnOrRow,
};
