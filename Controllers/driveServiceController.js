const { google } = require('googleapis');
const path = require('path');

exports.getDriveService = async (req, res, next) => {
  try {
    
    const KEYFILEPATH = path.join(__dirname, 'keys.json');
    const SCOPES = ['https://www.googleapis.com/auth/drive'];

    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
    const driveService = google.drive({ version: 'v3', auth });
    req.driveService = driveService;

    return next();
  } catch (error) {
    console.log(error);
  }
};

