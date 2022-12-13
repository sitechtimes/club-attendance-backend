const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

exports.loginMiddleware = async (req, res) => {
  try {
    //No CSRF protection
    console.log(req.body);
  } catch (error) {
    console.log(error);
  }
};
