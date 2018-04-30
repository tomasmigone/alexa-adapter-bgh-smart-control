const express = require('express')
const session = require('cookie-session')
const bodyParser = require('body-parser')
const BGH = require('bgh-smart-control')

const app = express()
app.set('view engine', 'pug')
app.set('trust proxy', 1)
app.set('port', 5000)
app.use(session({ secret: 'batata', cookie: { maxAge: 2592000 } }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ok' })
})

// OAuth 2.0 - Request token endpoints
app.get('/oauth/request_token', (req, res) => {
  let data = {
    state: req.query.state,
    redirectURL: req.query.redirect_uri
  }
  if (data.state && data.redirectURL) {
    res.render('login', data)
  } else {
    res.status(500).send('Error: Did not receive state or redirect_uri.')
  }
})

app.get('/oauth/request_token/callback', async (req, res) => {
  let bgh = new BGH()
  let token = await bgh.login(req.query.uname, req.query.psw)
  if (req.query.redirectURL && req.query.state && token) {
    res.redirect(decodeURI(req.query.redirectURL) + '?state=' + req.query.state + '&code=' + token)
  } else {
    res.status(500).send('Error: Could not get redirectURL, state or token.')
  }
})

// OAuth 2.0 - Access token endpoint
app.post('/oauth/access_token', (req, res) => {
  if (req.body.code) {
    res.json({
      access_token: req.body.code
    })
  }
})

// Start server
app.listen(app.get('port'), () => {
  console.log('Listening on port %s', app.get('port'))
})
