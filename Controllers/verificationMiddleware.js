const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

exports.loginMiddleware = async (req, res, next) => {
  try {
    console.log(req.body);
    const userResponse = req.body.response;

    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    const userData = [];
    //this verfiy user token
    verifyToken(userResponse.access_token)
      .then((userInfo) => {
        console.log(userInfo);
        //set put userInfo into request called req.userInfo

        req.userInfo = userInfo;
        req.userInfo.hd = userResponse.hd;

        if (
          !(
            userInfo === null ||
            userInfo === undefined ||
            userResponse.hd === undefined ||
            userResponse.hd === null
          )
        ) {
          next();
        } else {
          console.log("something went wrong");
          //send back response if there is no userInfo
        }
      })
      .catch((error) => {
        console.log(error);
      });
    //reminder to resict this to nycstudents domain
  } catch (error) {
    console.log(error);
  }
};

exports.studentOrTeacher = async (req, res) => {
  try {
    const userInfo = req.userInfo;
    if (userInfo.hd === "nycstudents.net") {
      console.log("student");
      res.json("student");
    } else if (userInfo.hd === "schools.nyc.gov") {
      console.log("teacher");
      res.json("teacher");
    }
  } catch (error) {
    console.log(error);
  }
};
