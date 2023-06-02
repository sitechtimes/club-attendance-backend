"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
require("dotenv").config({ path: "./env/driveId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const CLUB_ATTENDENCE_FOLDERID = `${process.env.CLUB_ATTENDENCE_FOLDERID}`;
const {
  sheetData,
  addItemToRow,
  generateRandomNumber,
  uploadToFolder,
  createSheetInFolder,
  appendNewItemBatch,
} = require("../../utility.js");

//a bug on keep adding
exports.generateNewItem = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    await addItemToRow(sheets, NEW_CLUB_DATA_SPREADSHEETID, "clubData", 0, [
      "Next Meeting",
      "QR Code",
      "Club Folder Id", //m
      "Club Spreadsheet Id", //n
      "Club Attendence Folder Id", //o
      "Club Code",
      "Row Number",
    ]);
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generateRowItem = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    const clubNameData = await sheetData(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "clubData!A:A"
    );
    clubNameData.shift();

    // now change
    const clubNameDataLength = clubNameData.flat().length;

    console.log(clubNameDataLength);

    const totalNull = [];
    const randNum = [];
    for (let i = 2; clubNameDataLength + 1 >= i; i++) {
      let randomNumber = generateRandomNumber(10);
      randNum.push(`${randomNumber}`);
      totalNull.push(`null`);
    }

    const clubCode = [];
    for (let i = 2; clubNameDataLength + 1 >= i; i++) {
      clubCode.push(generateRandomNumber(6));
    }

    const rowNumber = [];
    for (let i = 2; clubNameDataLength + 1 >= i; i++) {
      rowNumber.push(i);
    }

    await appendNewItemBatch(sheets, NEW_CLUB_DATA_SPREADSHEETID, [
      {
        range: "clubData!K2:K",
        majorDimension: "COLUMNS",
        values: [totalNull],
      },
      {
        range: "clubData!L2:L",
        majorDimension: "COLUMNS",
        values: [randNum],
      },
      {
        range: "clubData!P2:P",
        majorDimension: "COLUMNS",
        values: [clubCode],
      },
      {
        range: "clubData!Q2:Q",
        majorDimension: "COLUMNS",
        values: [rowNumber],
      },
    ]);

    req.clubNameData = clubNameData.flat();

    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generateAcdemicYearDriveFolder = async (req, res, next) => {
  try {
    let drive = req.driveService;
    const acdemicYearFolderId = await uploadToFolder(
      drive,
      CLUB_ATTENDENCE_FOLDERID,
      `${req.body.acdemicYear}`
    );

    req.acdemicYearFolderId = acdemicYearFolderId;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generateClubSheetAndFolder = async (req, res, next) => {
  try {
    let drive = req.driveService;

    const childFolderId = req.acdemicYearFolderId;
    const spreadsheetName = req.clubNameData;

    const folderClubId = [];
    const folderAttendenceId = [];
    const idSpreadsheet = [];

    for (let i = 0; spreadsheetName.length > i; i++) {
      const clubFolderId = await uploadToFolder(
        drive,
        childFolderId,
        spreadsheetName[i]
      );

      const attendenceFolderId = await uploadToFolder(
        drive,
        clubFolderId,
        "Club Attendence Photo"
      );

      const spreadsheetId = await createSheetInFolder(
        drive,
        clubFolderId,
        spreadsheetName[i]
      );

      folderClubId.push(clubFolderId);
      folderAttendenceId.push(attendenceFolderId);
      idSpreadsheet.push(spreadsheetId);
    }

    req.folderClubId = folderClubId;
    req.folderAttendenceId = folderAttendenceId;
    req.idSpreadsheet = idSpreadsheet;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generaterRowForClub = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    setTimeout(async () => {
      for (let i = 0; req.idSpreadsheet.length > i; i++) {
        await appendNewItemBatch(sheets, req.idSpreadsheet[i], [
          {
            range: "Sheet1",
            majorDimension: "ROWS",
            values: [
              [
                "UID",
                "First Name",
                "Last Name",
                "OSIS",
                "Posisiton",
                "Grade",
                "Email",
                "Offical Class",
                "# of Attendence",
                "Row Number",
                "0",
              ],
            ],
          },
        ]);
        console.log(i);

        function timeout(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }

        if (i === 45) {
          console.log("waiting");
          await timeout(70000);
          console.log("finish");
        }
      }
      console.log("done with adding things for each clubs");
      return next();
    }, 70000);
  } catch (error) {
    console.log(error);
  }
};

exports.uploadIdToClubData = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    await appendNewItemBatch(sheets, NEW_CLUB_DATA_SPREADSHEETID, [
      {
        range: "clubData!M2:M",
        majorDimension: "COLUMNS",
        values: [req.folderClubId],
      },
      {
        range: "clubData!N2:N",
        majorDimension: "COLUMNS",
        values: [req.idSpreadsheet],
      },
      {
        range: "clubData!O2:O",
        majorDimension: "COLUMNS",
        values: [req.folderAttendenceId],
      },
    ]);
    console.log("done with everything");
    return res.json("done");
  } catch (error) {
    console.log(error);
  }
};
