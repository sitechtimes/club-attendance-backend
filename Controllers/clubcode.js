const express = require("express");
const { google } = require("googleapis");
require("dotenv").config({ path: "variables.env" });

const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;