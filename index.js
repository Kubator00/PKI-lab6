const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')

const app = express()

const cors = require('cors')
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.SECRET_KEY;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;

app.get('/', (req, res) => {
    console.log("start");
    if (!authed) {
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        res.redirect(url);
    } else {
        const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
        oauth2.userinfo.v2.me.get(function (err, result) {
            let loggedUser;
            if (err) {
                res.send('wystapil blad');
            }
            else {
                loggedUser = result.data.name;
                console.log(loggedUser);
            }
            res.send(`Logged in: ${loggedUser} <br/> <img src='${result.data.picture}' height='23' width='23' /> <a href='/'>Wyloguj</a>`)

        })
    }
})

app.get('/logout', (req, res) => {
    authed = false;
    res.redirect('/');
})

app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    if (code) {
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/')
            }
        });
    }
});

const port = 8080
app.listen(port, () => console.log(`Server running at ${port}`));
