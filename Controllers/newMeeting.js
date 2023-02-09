const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const tempClub = "Chinese Culture Club"

const auth = new google.auth.GoogleAuth({
    keyFile: "keys.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.newMeeting = async (req, res, next) =>{
    try {
        console.log(req.body);
        const UserID = req.body.user.uid;
        const ClubCode = req.body.clubCode;

        // This gets the row number of the clubname, this rownumber would "identify" the specific club, MainClubdata row#
        const mainClubDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: "clubData!L2:L",
        });
        const clubCodeList = (mainClubDataSheet).data.values;
        const clubCodesLength = clubCodeList?.length;
        console.log(clubCodeList);
        console.log(clubCodesLength);
        let clubDataRowNumber = 0;
        for (let i = 0; i < clubCodesLength; i++) {
            if (clubCodeList[i][0] === ClubCode) {
                clubDataRowNumber = i + 2;
                break;
            }
        }
        console.log(clubDataRowNumber);

    } catch (error) {
        console.log(error);
    }
};