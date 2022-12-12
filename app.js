const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const routes = require("./Routes/index");
const cookieParser = require('cookie-parser')

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '896694709483-dpdmbclc3o40j3d53ql06bcplgsmut9q.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routes);

app.post('/login', (req,res)=>{
  let token = req.body.token;

  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
    }
    verify()
    .then(()=>{
        res.cookie('session-token', token);
        res.send('success')
    })
    .catch(console.error);

})