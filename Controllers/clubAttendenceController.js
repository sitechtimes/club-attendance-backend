"use strict";

require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
//auth to check if the person have permisson

//check club exist
