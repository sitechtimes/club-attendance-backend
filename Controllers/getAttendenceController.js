require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
const range = "Information";
//auth to check if the person have permisson

async function clubDataExist(sheets, spreadsheetId, range) {
  const studentData = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const credentialData = studentData.data.values;
  return credentialData;
  //make this a resuable function
  // compareValue(credentialData, userData.sub);
}

function compareValue(spreadSheetValue, valueComparing) {
  let ifExist = false;
  let sheetID = null;
  for (let i = 0; spreadSheetValue.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = spreadSheetValue[i][11];
    let sheetId = spreadSheetValue[i][10];
    if (eachId === valueComparing) {
      ifExist = true;
      sheetID = sheetId;
      break;
    }
  }
  console.log(ifExist);
  return Promise.resolve({ ifExist, sheetID });
}

exports.checkDates = async (req, res, next) => {
  try {
    const sheetsValue = req.object.sheets;
    const incomingData = req.body;

    const ifClubExist = await clubDataExist(
      sheetsValue,
      CLUB_DATA_SPREADSHEET_ID,
      range
    ).then((response) =>
      compareValue(response, incomingData.clubCode).then(
        (compareValueResponse) => {
          return compareValueResponse;
        }
      )
    );

    if (ifClubExist.ifExist) {
      req.sheetID = ifClubExist.sheetID;
      next();
    } else {
      res.json("No such club!");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getclubAttendence = async (req, res) => {
  try {
    const incomingData = req.body;
    const sheetsValue = req.object.sheets;
    const attendence = await clubDataExist(
      sheetsValue,
      req.sheetID,
      incomingData.attendenceDate
    );

    let sheetArray = [];
    attendence.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting
    const attendenceData = sheetArray.map((value) => ({
      firstName: value[0],
      lastName: value[1],
      osis: value[2],
      grade: value[3],
      officalClass: value[4],
      uid: value[5],
      status: value[6],
    }));
    attendenceData.shift();

    //retrun the data
    res.json(attendenceData);

    console.log(attendence);
  } catch (error) {
    console.log(error);
  }
};
