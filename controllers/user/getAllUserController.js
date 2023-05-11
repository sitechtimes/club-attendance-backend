const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const { sheetData } = require("../../utility.js");

exports.allUserData = async (req, res) => {
  try {
    const sheets = req.object.sheets;
    const allUserData = await sheetData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData"
    );

    let sheetArray = [];

    //this is what change the array into object
    allUserData.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting
    sheetArray.shift();

    const sheetObject = sheetArray.map((value) => ({
      uid: value[0],
      firstName: value[1],
      lastName: value[2],
      email: value[3],
      type: value[4],
      osis: value[5],
      grade: value[6],
      officialClass: value[7],
      emailDomain: value[8],
      clubData: JSON.parse(value[9]),
      presentLocation: JSON.parse(value[10]),
    }));

    console.log(sheetObject);
    res.send(sheetObject);
  } catch (error) {
    console.log(error);
  }
};
