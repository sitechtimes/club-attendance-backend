require("dotenv").config({ path: "./env/spreadsheetId.env" });
require("dotenv").config({ path: "variables.env" });
const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { parse } = require("dotenv");
const client = new OAuth2Client();
const express = require(`express`);
const multer = require("multer");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const CLUB_ATTENDENCE_FOLDERID = `${process.env.CLUB_ATTENDENCE_FOLDERID}`;
const { sheetData } = require("../../utility.js");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const KEYFILEPATH = "keys.json";

const sheetAuth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const driveAuth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/drive",
});

exports.uploadPhoto = async (req, res, next) => {
  try {
    console.log(req.body, "body");
    console.log(req.body.clubName, "clubName");
    const body = req.body;
    const clubName = req.body.clubName;
    const files = req.photo;
    console.log(files, "file");
    let sheets = req.object.sheets;
    const MainClubData = "1nxcHKJ2kuOy-aWS_nnBoyk4MEtAk6i1b-_pC_l_mx3g";
    const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

    // This gets the list of every club's name
    const mainClubDataSheet = await sheetData(
      sheets,
      MainClubData,
      "clubData!A2:A"
    );
    // clubNameList is the list of club names
    const clubNameList = mainClubDataSheet.flat();
    const clubSorted = clubNameList.sort();
    console.log(clubSorted);

    // This gets the row number of the club with a binary search, x is the club name
    function binarySearch(clubSorted, x) {
      let l = 0,
        r = clubSorted.length - 1;
      while (l <= r) {
        let m = l + Math.floor((r - l) / 2);

        let res = x.localeCompare(clubSorted[m]);

        // Check if x is present at mid
        if (res == 0) return m;

        // If x greater, ignore left half
        if (res > 0) l = m + 1;
        // If x is smaller, ignore right half
        else r = m - 1;
      }
      return -1;
    }
    let x = clubName;
    // result would be the number in the array
    let result = binarySearch(clubSorted, x);
    // add 1 to get row number (google sheets don't start with 0)
    let clubDataRowNumber = result + 2;
    console.log(clubDataRowNumber);

    // This gets the folder ID for drive (where we upload the pictures to)
    const clubFolderID = await sheetData(
      sheets,
      MainClubData,
      `clubData!N${clubDataRowNumber}:N${clubDataRowNumber}`
    );
    const folderID = clubFolderID;
    console.log(folderID);

    const drive = req.driveService;

    const response = await drive.files.create({
      requestBody: {
        name: files,
        parents: [`${folderID}`],
      },
      media: {
        mimeType: "image/png",
        body: files,
      },
    });

    // Send a response with the Google Drive file ID
    res.json({
      message: "File uploaded successfully",
      fileId: response.data.id,
    });

    switch (response.status) {
      case 200:
        let file = response.result;
        console.log("Created File Id: ", response.data.id);
        break;
      default:
        console.error("Error creating the file, " + response.errors);
        break;
    }
  } catch (error) {
    console.log(error);
  }
};
