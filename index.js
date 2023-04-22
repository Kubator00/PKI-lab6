const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')
const axios = require('axios')
const app = express()

const cors = require('cors')
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.SECRET_KEY;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;


app.get('/', (req, res) => {
    if (authed)
        return res.redirect('/user');
    res.send(`Witaj na stronie <br> <a href='/login'>Zaloguj się przez Google</a> <br> <a href='/login-github'> Zaloguj się przez GitHub</a>`)
})

app.get('/login', (req, res) => {
    if (!authed) {
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        res.redirect(url);
    } else {
        res.redirect('/user');
    }
});



app.get('/user', (req, res) => {
    if (!authed)
        return res.redirect('/');

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
        res.send(`Logged in: ${loggedUser} <br/> <img src='${result.data.picture}' height='23' width='23' /> <a href='/logout'>Wyloguj</a>`)
    });
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
                res.redirect('/user')
            }
        });
    }
});


app.get('/login-github', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID_GITHUB}`);

});

app.get('/github/callback', (req, res) => {

    const requestToken = req.query.code

    axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID_GITHUB}&client_secret=${process.env.SECRET_KEY_GITHUB}&code=${requestToken}`,
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        access_token = response.data.access_token
        res.redirect('/user-github');
    })
})

app.get('/user-github', function (req, res) {
    if (!authed)
        return res.redirect('/');

    axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
            Authorization: 'token ' + access_token
        }
    }).then((response) => {
        res.send(`Name: ${response.data.name} <br/> <a href='/logout'>Wyloguj</a>`)
    })
});


const port = 8080
app.listen(port, () => console.log(`Server running at ${port}`));
