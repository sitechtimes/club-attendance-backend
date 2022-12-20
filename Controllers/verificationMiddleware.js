const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

exports.loginMiddleware = async (req, res, next) => {
  try {
    console.log(req.body);
    const userResponse = req.body.userCredential;

    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    // this verfiy user token
    verifyToken(userResponse.access_token).then((userInfo) => {
      console.log(userInfo);
      // console.log(req.session);
      //set put userInfo into request called req.userInfo
      req.userInfo = userInfo;
      req.userInfo.hd = userResponse.hd;

      if (
        userInfo &&
        (userResponse.hd === "nycstudents.net" ||
          userResponse.hd === "schools.nyc.gov")
      ) {
        const newUserData = {
          userInfo: {
            sub: req.userInfo.sub,
            firstName: req.userInfo.given_name,
            lastName: req.userInfo.family_name,
            email: req.userInfo.email,
            googleDomain: req.userInfo.hd,
          },
        };
        req.newUserData = newUserData;

        next();
      } else {
        // this else does not work
        console.log("something went wrong");
        res.json(
          "You must use a school email. (nycstudents.net or schools.nyc.gov)"
        );
      }
    });
    // reminder to resict this to nycstudents domain
  } catch (error) {
    console.log(error);
  }
};

exports.studentOrTeacher = async (req, res) => {
  try {
    const userInfo = req.userInfo;
    if (userInfo.hd === "nycstudents.net") {
      console.log("student");
      req.newUserData.type = "student";
      const response = req.newUserData;

      //add user data to session
      // req.session.user = response;

      console.log(response);
      res.json(response);
    } else if (userInfo.hd === "schools.nyc.gov") {
      console.log("teacher");
      req.newUserData.type = "teacher";
      const response = req.newUserData;

      //add user data to session
      // req.session.user = response;

      res.json(response);
    }
  } catch (error) {
    console.log(error);
    res.json(401);
  }
};
